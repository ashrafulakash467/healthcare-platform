import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { PatientService } from '../patient/patient.service';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly patientService: PatientService,
  ) {}

  getBookingOptions(doctorId: string | undefined) {
    const parsedDoctorId = this.parseId(doctorId, 'doctorId');
    const doctor = this.findDoctor(parsedDoctorId);
    const clinics = this.databaseService.db
      .prepare(
        `
        SELECT id, name, location
        FROM doctor_clinics
        WHERE doctor_id = ? AND is_active = 1
        ORDER BY name ASC
      `,
      )
      .all(parsedDoctorId) as ClinicRow[];

    return {
      success: true,
      doctor,
      clinics,
    };
  }

  getAvailableDates(doctorId: string | undefined, clinicId: string | undefined) {
    const parsedDoctorId = this.parseId(doctorId, 'doctorId');
    const parsedClinicId = this.parseId(clinicId, 'clinicId');
    this.assertDoctorClinic(parsedDoctorId, parsedClinicId);

    const scheduleWeekdays = this.databaseService.db
      .prepare(
        `
        SELECT DISTINCT weekday
        FROM doctor_schedules
        WHERE doctor_id = ? AND clinic_id = ? AND is_active = 1
      `,
      )
      .all(parsedDoctorId, parsedClinicId)
      .map((row: { weekday: number }) => row.weekday);
    const dates: string[] = [];
    const today = new Date();

    for (let index = 1; index <= 21 && dates.length < 7; index += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + index);

      if (scheduleWeekdays.includes(date.getDay())) {
        dates.push(this.formatDate(date));
      }
    }

    return {
      success: true,
      dates,
    };
  }

  getAvailableSlots(
    doctorId: string | undefined,
    clinicId: string | undefined,
    date: string | undefined,
  ) {
    const parsedDoctorId = this.parseId(doctorId, 'doctorId');
    const parsedClinicId = this.parseId(clinicId, 'clinicId');
    const appointmentDate = this.parseDate(date);
    this.assertDoctorClinic(parsedDoctorId, parsedClinicId);

    return {
      success: true,
      slots: this.getSlots(parsedDoctorId, parsedClinicId, appointmentDate),
    };
  }

  getMyAppointments(authorizationHeader: string | undefined) {
    const patient = this.patientService.getAuthenticatedPatient(authorizationHeader).user;
    const appointments = this.databaseService.db
      .prepare(
        `
        SELECT
          appointments.id,
          appointments.appointment_date as appointmentDate,
          appointments.slot_time as slotTime,
          appointments.status,
          appointments.cancellation_reason as cancellationReason,
          appointments.cancelled_at as cancelledAt,
          appointments.created_at as createdAt,
          doctors.id as doctorId,
          doctors.name as doctorName,
          doctors.specialty as doctorSpecialty,
          doctor_clinics.id as clinicId,
          doctor_clinics.name as clinicName,
          doctor_clinics.location as clinicLocation
        FROM appointments
        INNER JOIN doctors ON doctors.id = appointments.doctor_id
        INNER JOIN doctor_clinics ON doctor_clinics.id = appointments.clinic_id
        WHERE appointments.patient_id = ?
        ORDER BY appointments.appointment_date DESC, appointments.slot_time DESC
      `,
      )
      .all(patient.id)
      .map((appointment: AppointmentListRow) => ({
        id: appointment.id,
        appointmentDate: appointment.appointmentDate,
        slotTime: appointment.slotTime,
        status: appointment.status,
        cancellationReason: appointment.cancellationReason,
        cancelledAt: appointment.cancelledAt,
        createdAt: appointment.createdAt,
        isReschedulable: this.isReschedulable(appointment),
        isCancellable: this.isCancellable(appointment),
        doctor: {
          id: appointment.doctorId,
          name: appointment.doctorName,
          specialty: appointment.doctorSpecialty,
        },
        clinic: {
          id: appointment.clinicId,
          name: appointment.clinicName,
          location: appointment.clinicLocation,
        },
      }));

    return {
      success: true,
      appointments,
    };
  }

  getRescheduleOptions(
    authorizationHeader: string | undefined,
    appointmentId: string | undefined,
  ) {
    const patient = this.patientService.getAuthenticatedPatient(authorizationHeader).user;
    const appointment = this.findPatientAppointment(patient.id, appointmentId);
    this.assertReschedulable(appointment);

    return {
      success: true,
      appointment: this.toAppointmentDetail(appointment),
      dates: this.getAvailableDates(
        String(appointment.doctorId),
      String(appointment.clinicId),
    ).dates,
    };
  }

  cancel(authorizationHeader: string | undefined, cancelAppointmentDto: CancelAppointmentDto) {
    const patient = this.patientService.getAuthenticatedPatient(authorizationHeader).user;

    return this.cancelByActor(
      {
        id: patient.id,
        role: patient.role,
      },
      cancelAppointmentDto,
    );
  }

  getRescheduleSlots(
    authorizationHeader: string | undefined,
    appointmentId: string | undefined,
    date: string | undefined,
  ) {
    const patient = this.patientService.getAuthenticatedPatient(authorizationHeader).user;
    const appointment = this.findPatientAppointment(patient.id, appointmentId);
    const appointmentDate = this.parseDate(date);
    this.assertReschedulable(appointment);

    return {
      success: true,
      slots: this.getSlots(
        appointment.doctorId,
        appointment.clinicId,
        appointmentDate,
        appointment.id,
      ).filter((slot) => !slot.isBooked),
    };
  }

  book(authorizationHeader: string | undefined, createAppointmentDto: CreateAppointmentDto) {
    const patient = this.patientService.getAuthenticatedPatient(authorizationHeader).user;
    const doctorId = this.parseId(createAppointmentDto.doctorId, 'doctorId');
    const clinicId = this.parseId(createAppointmentDto.clinicId, 'clinicId');
    const appointmentDate = this.parseDate(createAppointmentDto.appointmentDate);
    const slotTime = this.parseSlotTime(createAppointmentDto.slotTime);
    const appointmentId = `appt_${Date.now()}_${randomBytes(4).toString('hex')}`;

    this.databaseService.db.exec('BEGIN IMMEDIATE');
    try {
      const doctor = this.findDoctor(doctorId);
      const clinic = this.assertDoctorClinic(doctorId, clinicId);
      this.assertSlotExists(doctorId, clinicId, appointmentDate, slotTime);

      const existingAppointment = this.databaseService.db
        .prepare(
          `
          SELECT id
          FROM appointments
          WHERE doctor_id = ?
            AND clinic_id = ?
            AND appointment_date = ?
            AND slot_time = ?
            AND status IN ('requested', 'confirmed')
        `,
        )
        .get(doctorId, clinicId, appointmentDate, slotTime);

      if (existingAppointment) {
        throw new ConflictException({
          success: false,
          message: 'This appointment slot is already booked.',
        });
      }

      this.databaseService.db
        .prepare(
          `
          INSERT INTO appointments (
            id,
            patient_id,
            doctor_id,
            clinic_id,
            appointment_date,
            slot_time,
            status,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)
        `,
        )
        .run(
          appointmentId,
          patient.id,
          doctorId,
          clinicId,
          appointmentDate,
          slotTime,
          new Date().toISOString(),
        );

      this.databaseService.db
        .prepare(
          `
          INSERT OR IGNORE INTO patient_doctors (
            patient_id,
            doctor_id,
            first_appointment_id,
            created_at
          )
          VALUES (?, ?, ?, ?)
        `,
        )
        .run(patient.id, doctorId, appointmentId, new Date().toISOString());

      this.databaseService.db.exec('COMMIT');

      return {
        success: true,
        message: 'Appointment booked successfully.',
        appointment: {
          id: appointmentId,
          status: 'confirmed',
          patient,
          doctor,
          clinic,
          appointmentDate,
          slotTime,
        },
      };
    } catch (error) {
      this.databaseService.db.exec('ROLLBACK');
      throw error;
    }
  }

  reschedule(
    authorizationHeader: string | undefined,
    rescheduleAppointmentDto: RescheduleAppointmentDto,
  ) {
    const patient = this.patientService.getAuthenticatedPatient(authorizationHeader).user;
    const appointment = this.findPatientAppointment(
      patient.id,
      rescheduleAppointmentDto.appointmentId,
    );
    const appointmentDate = this.parseDate(rescheduleAppointmentDto.appointmentDate);
    const slotTime = this.parseSlotTime(rescheduleAppointmentDto.slotTime);

    this.assertReschedulable(appointment);

    this.databaseService.db.exec('BEGIN IMMEDIATE');
    try {
      this.assertSlotExists(
        appointment.doctorId,
        appointment.clinicId,
        appointmentDate,
        slotTime,
        appointment.id,
      );

      const existingAppointment = this.databaseService.db
        .prepare(
          `
          SELECT id
          FROM appointments
          WHERE doctor_id = ?
            AND clinic_id = ?
            AND appointment_date = ?
            AND slot_time = ?
            AND status IN ('requested', 'confirmed')
            AND id != ?
        `,
        )
        .get(
          appointment.doctorId,
          appointment.clinicId,
          appointmentDate,
          slotTime,
          appointment.id,
        );

      if (existingAppointment) {
        throw new ConflictException({
          success: false,
          message: 'This appointment slot is already booked.',
        });
      }

      this.databaseService.db
        .prepare(
          `
          UPDATE appointments
          SET appointment_date = ?, slot_time = ?, status = 'confirmed'
          WHERE id = ? AND patient_id = ?
        `,
        )
        .run(appointmentDate, slotTime, appointment.id, patient.id);

      this.databaseService.db
        .prepare(
          `
          INSERT INTO appointment_history (
            appointment_id,
            action,
            old_date,
            old_slot_time,
            new_date,
            new_slot_time,
            old_status,
            new_status,
            changed_by_patient_id,
            created_at
          )
          VALUES (?, 'rescheduled', ?, ?, ?, ?, ?, 'confirmed', ?, ?)
        `,
        )
        .run(
          appointment.id,
          appointment.appointmentDate,
          appointment.slotTime,
          appointmentDate,
          slotTime,
          appointment.status,
          patient.id,
          new Date().toISOString(),
        );

      this.databaseService.db.exec('COMMIT');

      const updatedAppointment = this.findPatientAppointment(patient.id, appointment.id);

      return {
        success: true,
        message: 'Appointment rescheduled successfully.',
        appointment: this.toAppointmentDetail(updatedAppointment),
      };
    } catch (error) {
      this.databaseService.db.exec('ROLLBACK');
      throw error;
    }
  }

  cancelByActor(
    actor: CancellationActor,
    cancelAppointmentDto: CancelAppointmentDto,
  ) {
    const appointment = this.findAppointmentForCancellation(
      actor,
      cancelAppointmentDto.appointmentId,
    );
    const cancellationReason = this.parseCancellationReason(cancelAppointmentDto.reason);

    this.assertCancellable(appointment);

    const now = new Date().toISOString();

    this.databaseService.db.exec('BEGIN IMMEDIATE');
    try {
      const updateResult = this.databaseService.db
        .prepare(
          `
          UPDATE appointments
          SET status = 'cancelled',
              cancellation_reason = ?,
              cancelled_at = ?,
              cancelled_by_role = ?,
              cancelled_by_user_id = ?
          WHERE id = ? AND status IN ('requested', 'confirmed')
        `,
        )
        .run(
          cancellationReason,
          now,
          actor.role,
          actor.id,
          appointment.id,
        );

      if (updateResult.changes === 0) {
        throw new ConflictException({
          success: false,
          message: 'This appointment is not eligible for cancellation.',
        });
      }

      this.databaseService.db
        .prepare(
          `
          INSERT INTO appointment_cancellation_history (
            appointment_id,
            old_status,
            new_status,
            cancellation_reason,
            cancelled_by_role,
            cancelled_by_user_id,
            created_at
          )
          VALUES (?, ?, 'cancelled', ?, ?, ?, ?)
        `,
        )
        .run(
          appointment.id,
          appointment.status,
          cancellationReason,
          actor.role,
          actor.id,
          now,
        );

      if (actor.role === 'patient') {
        this.databaseService.db
          .prepare(
            `
            INSERT INTO appointment_history (
              appointment_id,
              action,
              old_date,
              old_slot_time,
              new_date,
              new_slot_time,
              old_status,
              new_status,
              changed_by_patient_id,
              created_at
            )
            VALUES (?, 'cancelled', ?, ?, ?, ?, ?, 'cancelled', ?, ?)
          `,
          )
          .run(
            appointment.id,
            appointment.appointmentDate,
            appointment.slotTime,
            appointment.appointmentDate,
            appointment.slotTime,
            appointment.status,
            actor.id,
            now,
          );
      }

      this.databaseService.db.exec('COMMIT');

      const updatedAppointment = this.findAppointmentById(appointment.id);

      return {
        success: true,
        message: 'Appointment cancelled successfully.',
        appointment: this.toAppointmentDetail(updatedAppointment),
      };
    } catch (error) {
      this.databaseService.db.exec('ROLLBACK');
      throw error;
    }
  }

  private getSlots(
    doctorId: number,
    clinicId: number,
    appointmentDate: string,
    excludeAppointmentId?: string,
  ) {
    const weekday = new Date(`${appointmentDate}T00:00:00`).getDay();
    const scheduleSlots = this.databaseService.db
      .prepare(
        `
        SELECT slot_time as slotTime
        FROM doctor_schedules
        WHERE doctor_id = ?
          AND clinic_id = ?
          AND weekday = ?
          AND is_active = 1
        ORDER BY slot_time ASC
      `,
      )
      .all(doctorId, clinicId, weekday) as { slotTime: string }[];
    const bookedSlots = new Set(
      (
        this.databaseService.db
          .prepare(
            `
            SELECT slot_time as slotTime
            FROM appointments
            WHERE doctor_id = ?
              AND clinic_id = ?
              AND appointment_date = ?
              AND status IN ('requested', 'confirmed')
              ${excludeAppointmentId ? 'AND id != ?' : ''}
          `,
          )
          .all(
            ...(excludeAppointmentId
              ? [doctorId, clinicId, appointmentDate, excludeAppointmentId]
              : [doctorId, clinicId, appointmentDate]),
          ) as { slotTime: string }[]
      ).map((row) => row.slotTime),
    );

    return scheduleSlots.map((slot) => ({
      time: slot.slotTime,
      isBooked: bookedSlots.has(slot.slotTime),
    }));
  }

  private assertSlotExists(
    doctorId: number,
    clinicId: number,
    appointmentDate: string,
    slotTime: string,
    excludeAppointmentId?: string,
  ) {
    const matchingSlot = this.getSlots(
      doctorId,
      clinicId,
      appointmentDate,
      excludeAppointmentId,
    ).find((slot) => slot.time === slotTime);

    if (!matchingSlot || matchingSlot.isBooked) {
      throw new BadRequestException({
        success: false,
        message: 'Selected time slot is not available for this date.',
      });
    }
  }

  private findDoctor(doctorId: number) {
    const doctor = this.databaseService.db
      .prepare(
        `
        SELECT
          id,
          name,
          specialty,
          location,
          gender,
          image_url as imageUrl
        FROM doctors
        WHERE id = ? AND is_verified = 1 AND is_active = 1
      `,
      )
      .get(doctorId) as DoctorRow | undefined;

    if (!doctor) {
      throw new NotFoundException({
        success: false,
        message: 'Doctor was not found or is not available for booking.',
      });
    }

    return doctor;
  }

  private assertDoctorClinic(doctorId: number, clinicId: number) {
    const clinic = this.databaseService.db
      .prepare(
        `
        SELECT id, name, location
        FROM doctor_clinics
        WHERE id = ? AND doctor_id = ? AND is_active = 1
      `,
      )
      .get(clinicId, doctorId) as ClinicRow | undefined;

    if (!clinic) {
      throw new NotFoundException({
        success: false,
        message: 'Clinic was not found for this doctor.',
      });
    }

    return clinic;
  }

  private findPatientAppointment(patientId: string, appointmentId: string | undefined) {
    const appointment = this.findAppointmentById(appointmentId);

    if (appointment.patientId !== patientId) {
      throw new NotFoundException({
        success: false,
        message: 'Appointment was not found.',
      });
    }

    return appointment;
  }

  private findAppointmentForCancellation(
    actor: CancellationActor,
    appointmentId: string | undefined,
  ) {
    const appointment = this.findAppointmentById(appointmentId);

    if (actor.role === 'patient' && appointment.patientId !== actor.id) {
      throw new NotFoundException({
        success: false,
        message: 'Appointment was not found.',
      });
    }

    if (actor.role === 'doctor' && String(appointment.doctorId) !== actor.id) {
      throw new ForbiddenException({
        success: false,
        message: 'You are not allowed to cancel this appointment.',
      });
    }

    return appointment;
  }

  private findAppointmentById(appointmentId: string | undefined) {
    if (!appointmentId) {
      throw new BadRequestException({
        success: false,
        message: 'appointmentId is required.',
        field: 'appointmentId',
      });
    }

    const appointment = this.databaseService.db
      .prepare(
        `
        SELECT
          appointments.id,
          appointments.patient_id as patientId,
          appointments.doctor_id as doctorId,
          appointments.clinic_id as clinicId,
          appointments.appointment_date as appointmentDate,
          appointments.slot_time as slotTime,
          appointments.status,
          appointments.cancellation_reason as cancellationReason,
          appointments.cancelled_at as cancelledAt,
          appointments.created_at as createdAt,
          doctors.name as doctorName,
          doctors.specialty as doctorSpecialty,
          doctor_clinics.name as clinicName,
          doctor_clinics.location as clinicLocation
        FROM appointments
        INNER JOIN doctors ON doctors.id = appointments.doctor_id
        INNER JOIN doctor_clinics ON doctor_clinics.id = appointments.clinic_id
        WHERE appointments.id = ?
      `,
      )
      .get(appointmentId) as AppointmentDetailRow | undefined;

    if (!appointment) {
      throw new NotFoundException({
        success: false,
        message: 'Appointment was not found.',
      });
    }

    return appointment;
  }

  private assertReschedulable(appointment: AppointmentEligibility) {
    if (!this.isReschedulable(appointment)) {
      throw new BadRequestException({
        success: false,
        message: 'This appointment is not eligible for rescheduling.',
      });
    }
  }

  private assertCancellable(appointment: AppointmentEligibility) {
    if (!this.isCancellable(appointment)) {
      throw new BadRequestException({
        success: false,
        message: 'This appointment is not eligible for cancellation.',
      });
    }
  }

  private isReschedulable(appointment: AppointmentEligibility) {
    const today = this.formatDate(new Date());

    return (
      ['requested', 'confirmed'].includes(appointment.status) &&
      appointment.appointmentDate >= today
    );
  }

  private isCancellable(appointment: AppointmentEligibility) {
    return this.isReschedulable(appointment);
  }

  private toAppointmentDetail(appointment: AppointmentDetailRow) {
    return {
      id: appointment.id,
      appointmentDate: appointment.appointmentDate,
      slotTime: appointment.slotTime,
      status: appointment.status,
      cancellationReason: appointment.cancellationReason,
      cancelledAt: appointment.cancelledAt,
      createdAt: appointment.createdAt,
      isReschedulable: this.isReschedulable(appointment),
      isCancellable: this.isCancellable(appointment),
      doctor: {
        id: appointment.doctorId,
        name: appointment.doctorName,
        specialty: appointment.doctorSpecialty,
      },
      clinic: {
        id: appointment.clinicId,
        name: appointment.clinicName,
        location: appointment.clinicLocation,
      },
    };
  }

  private parseId(value: string | number | undefined, field: string) {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException({
        success: false,
        message: `${field} is required.`,
        field,
      });
    }

    return parsed;
  }

  private parseDate(value: string | undefined) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException({
        success: false,
        message: 'A valid appointment date is required.',
        field: 'appointmentDate',
      });
    }

    return value;
  }

  private parseSlotTime(value: string | undefined) {
    if (!value || !/^\d{2}:\d{2}$/.test(value)) {
      throw new BadRequestException({
        success: false,
        message: 'A valid time slot is required.',
        field: 'slotTime',
      });
    }

    return value;
  }

  private parseCancellationReason(value: string | undefined) {
    const reason = value?.trim() ?? '';

    if (reason.length < 3) {
      throw new BadRequestException({
        success: false,
        message: 'A cancellation reason is required.',
        field: 'reason',
      });
    }

    if (reason.length > 500) {
      throw new BadRequestException({
        success: false,
        message: 'Cancellation reason must be 500 characters or fewer.',
        field: 'reason',
      });
    }

    return reason;
  }

  private formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}

type DoctorRow = {
  id: number;
  name: string;
  specialty: string;
  location: string;
  gender: string;
  imageUrl: string;
};

type ClinicRow = {
  id: number;
  name: string;
  location: string;
};

type AppointmentEligibility = {
  appointmentDate: string;
  status: string;
};

type AppointmentListRow = AppointmentEligibility & {
  id: string;
  slotTime: string;
  cancellationReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  clinicId: number;
  clinicName: string;
  clinicLocation: string;
};

type AppointmentDetailRow = AppointmentListRow & {
  patientId: string;
};

type CancellationActorRole = 'patient' | 'doctor' | 'admin';

type CancellationActor = {
  id: string;
  role: CancellationActorRole;
};
