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

const DEFAULT_APPOINTMENT_PAYMENT_CENTS = 150000;
const DEFAULT_APPOINTMENT_PAYMENT_CURRENCY = 'BDT';
const MANUAL_PAYMENT_PROVIDER = 'manual';

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
          appointments.payment_status as paymentStatus,
          appointments.payment_id as paymentId,
          appointments.payment_amount_cents as paymentAmountCents,
          appointments.payment_currency as paymentCurrency,
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
        paymentStatus: appointment.paymentStatus,
        paymentId: appointment.paymentId,
        paymentAmountCents: appointment.paymentAmountCents,
        paymentCurrency: appointment.paymentCurrency,
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
      const paymentAmountCents = DEFAULT_APPOINTMENT_PAYMENT_CENTS;
      const paymentCurrency = DEFAULT_APPOINTMENT_PAYMENT_CURRENCY;

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
          payment_status,
          payment_amount_cents,
          payment_currency,
          created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, 'confirmed', 'unpaid', ?, ?, ?)
        `,
        )
        .run(
          appointmentId,
          patient.id,
          doctorId,
          clinicId,
          appointmentDate,
          slotTime,
          paymentAmountCents,
          paymentCurrency,
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

      this.recordDoctorMessage({
        doctorId,
        appointmentId,
        patientName: patient.name,
        messageType: 'appointment',
        title: 'New appointment booked',
        body: `${patient.name} booked an appointment for ${appointmentDate} at ${slotTime}.`,
        createdAt: new Date().toISOString(),
      });

      this.databaseService.db.exec('COMMIT');

      return {
        success: true,
        message: 'Appointment booked successfully.',
        appointment: {
          id: appointmentId,
          status: 'confirmed',
          paymentStatus: 'unpaid',
          paymentAmountCents,
          paymentCurrency,
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

  getAppointmentPayment(
    authorizationHeader: string | undefined,
    appointmentId: string | undefined,
  ) {
    const patient = this.patientService.getAuthenticatedPatient(authorizationHeader).user;
    const appointment = this.findPatientAppointment(patient.id, appointmentId);
    const payment = this.findPaymentByAppointmentId(appointment.id);

    return {
      success: true,
      appointment: this.toAppointmentDetail(appointment),
      payment: payment ? this.toPaymentSummary(payment) : null,
    };
  }

  createAppointmentPayment(
    authorizationHeader: string | undefined,
    appointmentId: string | undefined,
  ) {
    const patient = this.patientService.getAuthenticatedPatient(authorizationHeader).user;
    const appointment = this.findPatientAppointment(patient.id, appointmentId);
    this.assertPaymentEligible(appointment);

    const now = new Date().toISOString();
    const paymentAmountCents =
      appointment.paymentAmountCents > 0
        ? appointment.paymentAmountCents
        : DEFAULT_APPOINTMENT_PAYMENT_CENTS;
    const paymentCurrency =
      appointment.paymentCurrency?.trim() || DEFAULT_APPOINTMENT_PAYMENT_CURRENCY;
    const existingPayment = this.findPaymentByAppointmentId(appointment.id);
    const paymentReference = `pay_${Date.now()}_${randomBytes(4).toString('hex')}`;

    this.databaseService.db.exec('BEGIN IMMEDIATE');
    try {
      let paymentId = existingPayment?.id ?? paymentReference;

      if (existingPayment) {
        if (existingPayment.status === 'pending' || existingPayment.status === 'succeeded') {
          throw new ConflictException({
            success: false,
            message: 'A payment already exists for this appointment.',
          });
        }

        this.databaseService.db
          .prepare(
            `
            UPDATE appointment_payments
            SET amount_cents = ?,
                currency = ?,
                provider = ?,
                provider_reference = ?,
                status = 'pending',
                attempt_count = attempt_count + 1,
                failure_reason = NULL,
                updated_at = ?,
                paid_at = NULL,
                failed_at = NULL
            WHERE id = ?
          `,
          )
          .run(
            paymentAmountCents,
            paymentCurrency,
            MANUAL_PAYMENT_PROVIDER,
            paymentReference,
            now,
            existingPayment.id,
          );
      } else {
        this.databaseService.db
          .prepare(
            `
            INSERT INTO appointment_payments (
              id,
              appointment_id,
              patient_id,
              amount_cents,
              currency,
              provider,
              provider_reference,
              status,
              attempt_count,
              failure_reason,
              created_at,
              updated_at,
              paid_at,
              failed_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 1, NULL, ?, ?, NULL, NULL)
          `,
          )
          .run(
            paymentId,
            appointment.id,
            patient.id,
            paymentAmountCents,
            paymentCurrency,
            MANUAL_PAYMENT_PROVIDER,
            paymentReference,
            now,
            now,
          );
      }

      this.databaseService.db
        .prepare(
          `
          UPDATE appointments
          SET payment_status = 'pending',
              payment_id = ?,
              payment_amount_cents = ?,
              payment_currency = ?,
              payment_created_at = COALESCE(payment_created_at, ?),
              payment_updated_at = ?
          WHERE id = ?
        `,
        )
        .run(paymentId, paymentAmountCents, paymentCurrency, now, now, appointment.id);

      this.recordDoctorMessage({
        doctorId: Number(appointment.doctorId),
        appointmentId: appointment.id,
        patientName: patient.name,
        messageType: 'payment',
        title: 'Appointment payment pending',
        body: `A payment was created for ${patient.name}. The status is pending.`,
        createdAt: now,
      });

      this.databaseService.db.exec('COMMIT');

      const updatedAppointment = this.findAppointmentById(appointment.id);
      const payment = this.findPaymentByAppointmentId(appointment.id);

      return {
        success: true,
        message: 'Payment created successfully.',
        paymentProvider: MANUAL_PAYMENT_PROVIDER,
        appointment: this.toAppointmentDetail(updatedAppointment),
        payment: payment ? this.toPaymentSummary(payment) : null,
      };
    } catch (error) {
      this.databaseService.db.exec('ROLLBACK');
      throw error;
    }
  }

  markAppointmentPaymentSuccessful(
    authorizationHeader: string | undefined,
    appointmentId: string | undefined,
  ) {
    const patient = this.patientService.getAuthenticatedPatient(authorizationHeader).user;
    const appointment = this.findPatientAppointment(patient.id, appointmentId);
    const payment = this.findPaymentByAppointmentId(appointment.id);

    if (!payment) {
      throw new NotFoundException({
        success: false,
        message: 'Payment was not found.',
      });
    }

    if (payment.status !== 'pending') {
      throw new ConflictException({
        success: false,
        message: 'Only pending payments can be marked as successful.',
      });
    }

    const now = new Date().toISOString();

    this.databaseService.db.exec('BEGIN IMMEDIATE');
    try {
      this.databaseService.db
        .prepare(
          `
          UPDATE appointment_payments
          SET status = 'succeeded',
              failure_reason = NULL,
              updated_at = ?,
              paid_at = ?,
              failed_at = NULL
          WHERE id = ?
        `,
        )
        .run(now, now, payment.id);

      this.databaseService.db
        .prepare(
          `
          UPDATE appointments
          SET payment_status = 'paid',
              payment_id = ?,
              payment_updated_at = ?,
              payment_succeeded_at = ?,
              payment_failed_at = NULL,
              status = CASE WHEN status = 'requested' THEN 'confirmed' ELSE status END
          WHERE id = ?
        `,
        )
        .run(payment.id, now, now, appointment.id);

      this.recordDoctorMessage({
        doctorId: Number(appointment.doctorId),
        appointmentId: appointment.id,
        patientName: patient.name,
        messageType: 'payment',
        title: 'Payment completed',
        body: `Payment was marked as successful for ${patient.name}.`,
        createdAt: now,
      });

      this.databaseService.db.exec('COMMIT');

      const updatedAppointment = this.findAppointmentById(appointment.id);
      const updatedPayment = this.findPaymentByAppointmentId(appointment.id);

      return {
        success: true,
        message: 'Payment marked as successful.',
        appointment: this.toAppointmentDetail(updatedAppointment),
        payment: updatedPayment ? this.toPaymentSummary(updatedPayment) : null,
      };
    } catch (error) {
      this.databaseService.db.exec('ROLLBACK');
      throw error;
    }
  }

  markAppointmentPaymentFailed(
    authorizationHeader: string | undefined,
    appointmentId: string | undefined,
    failureReason?: string,
  ) {
    const patient = this.patientService.getAuthenticatedPatient(authorizationHeader).user;
    const appointment = this.findPatientAppointment(patient.id, appointmentId);
    const payment = this.findPaymentByAppointmentId(appointment.id);

    if (!payment) {
      throw new NotFoundException({
        success: false,
        message: 'Payment was not found.',
      });
    }

    if (payment.status !== 'pending') {
      throw new ConflictException({
        success: false,
        message: 'Only pending payments can be marked as failed.',
      });
    }

    const now = new Date().toISOString();
    const parsedFailureReason = this.parsePaymentFailureReason(failureReason);

    this.databaseService.db.exec('BEGIN IMMEDIATE');
    try {
      this.databaseService.db
        .prepare(
          `
          UPDATE appointment_payments
          SET status = 'failed',
              failure_reason = ?,
              updated_at = ?,
              failed_at = ?,
              paid_at = NULL
          WHERE id = ?
        `,
        )
        .run(parsedFailureReason, now, now, payment.id);

      this.databaseService.db
        .prepare(
          `
          UPDATE appointments
          SET payment_status = 'failed',
              payment_id = ?,
              payment_updated_at = ?,
              payment_failed_at = ?,
              payment_succeeded_at = NULL
          WHERE id = ?
        `,
        )
        .run(payment.id, now, now, appointment.id);

      this.recordDoctorMessage({
        doctorId: Number(appointment.doctorId),
        appointmentId: appointment.id,
        patientName: patient.name,
        messageType: 'payment',
        title: 'Payment failed',
        body: `Payment failed for ${patient.name}.`,
        createdAt: now,
      });

      this.databaseService.db.exec('COMMIT');

      const updatedAppointment = this.findAppointmentById(appointment.id);
      const updatedPayment = this.findPaymentByAppointmentId(appointment.id);

      return {
        success: true,
        message: 'Payment marked as failed.',
        appointment: this.toAppointmentDetail(updatedAppointment),
        payment: updatedPayment ? this.toPaymentSummary(updatedPayment) : null,
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

      this.recordDoctorMessage({
        doctorId: Number(appointment.doctorId),
        appointmentId: appointment.id,
        patientName: patient.name,
        messageType: 'appointment',
        title: 'Appointment rescheduled',
        body: `${patient.name} rescheduled the appointment to ${appointmentDate} at ${slotTime}.`,
        createdAt: new Date().toISOString(),
      });

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

      this.recordDoctorMessage({
        doctorId: Number(appointment.doctorId),
        appointmentId: appointment.id,
        patientName: actor.role,
        messageType: 'appointment',
        title: 'Appointment cancelled',
        body:
          actor.role === 'patient'
            ? `The patient cancelled the appointment.`
            : `An ${actor.role} cancelled the appointment.`,
        createdAt: now,
      });

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
          appointments.payment_status as paymentStatus,
          appointments.payment_id as paymentId,
          appointments.payment_amount_cents as paymentAmountCents,
          appointments.payment_currency as paymentCurrency,
          appointments.payment_created_at as paymentCreatedAt,
          appointments.payment_updated_at as paymentUpdatedAt,
          appointments.payment_succeeded_at as paymentSucceededAt,
          appointments.payment_failed_at as paymentFailedAt,
          appointments.cancellation_reason as cancellationReason,
          appointments.cancelled_at as cancelledAt,
          appointments.created_at as createdAt,
          doctors.name as doctorName,
          doctors.specialty as doctorSpecialty,
          doctor_clinics.name as clinicName,
          doctor_clinics.location as clinicLocation,
          appointment_payments.id as paymentRecordId,
          appointment_payments.provider as paymentProvider,
          appointment_payments.provider_reference as paymentProviderReference,
          appointment_payments.status as paymentRecordStatus,
          appointment_payments.attempt_count as paymentAttemptCount,
          appointment_payments.failure_reason as paymentFailureReason,
          appointment_payments.created_at as paymentRecordCreatedAt,
          appointment_payments.updated_at as paymentRecordUpdatedAt,
          appointment_payments.paid_at as paymentPaidAt,
          appointment_payments.failed_at as paymentRecordFailedAt
        FROM appointments
        INNER JOIN doctors ON doctors.id = appointments.doctor_id
        INNER JOIN doctor_clinics ON doctor_clinics.id = appointments.clinic_id
        LEFT JOIN appointment_payments ON appointment_payments.appointment_id = appointments.id
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
      paymentStatus: appointment.paymentStatus,
      paymentId: appointment.paymentId,
      paymentAmountCents: appointment.paymentAmountCents,
      paymentCurrency: appointment.paymentCurrency,
      paymentCreatedAt: appointment.paymentCreatedAt,
      paymentUpdatedAt: appointment.paymentUpdatedAt,
      paymentSucceededAt: appointment.paymentSucceededAt,
      paymentFailedAt: appointment.paymentFailedAt,
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
      payment: appointment.paymentRecordId
        ? this.toPaymentSummary(appointment)
        : null,
    };
  }

  private findPaymentByAppointmentId(appointmentId: string) {
    return this.databaseService.db
      .prepare(
        `
        SELECT
          id,
          appointment_id as appointmentId,
          patient_id as patientId,
          amount_cents as amountCents,
          currency,
          provider,
          provider_reference as providerReference,
          status,
          attempt_count as attemptCount,
          failure_reason as failureReason,
          created_at as createdAt,
          updated_at as updatedAt,
          paid_at as paidAt,
          failed_at as failedAt
        FROM appointment_payments
        WHERE appointment_id = ?
      `,
      )
      .get(appointmentId) as PaymentRow | undefined;
  }

  private assertPaymentEligible(appointment: AppointmentDetailRow) {
    if (appointment.status === 'cancelled') {
      throw new BadRequestException({
        success: false,
        message: 'Cancelled appointments cannot be paid.',
      });
    }

    if (!['requested', 'confirmed'].includes(appointment.status)) {
      throw new BadRequestException({
        success: false,
        message: 'This appointment is not eligible for payment.',
      });
    }

    if (appointment.paymentStatus === 'pending') {
      throw new ConflictException({
        success: false,
        message: 'A payment is already pending for this appointment.',
      });
    }

    if (appointment.paymentStatus === 'paid') {
      throw new ConflictException({
        success: false,
        message: 'This appointment has already been paid.',
      });
    }
  }

  private toPaymentSummary(payment: PaymentRow | AppointmentDetailRow) {
    if ('paymentRecordId' in payment) {
      return {
        id: payment.paymentRecordId,
        appointmentId: payment.id,
        patientId: payment.patientId,
        amountCents: payment.paymentAmountCents,
        currency: payment.paymentCurrency,
        provider: payment.paymentProvider,
        providerReference: payment.paymentProviderReference,
        status: payment.paymentRecordStatus,
        attemptCount: payment.paymentAttemptCount,
        failureReason: payment.paymentFailureReason,
        createdAt: payment.paymentRecordCreatedAt,
        updatedAt: payment.paymentRecordUpdatedAt,
        paidAt: payment.paymentPaidAt,
        failedAt: payment.paymentRecordFailedAt,
      };
    }

    return {
      id: payment.id,
      appointmentId: payment.appointmentId,
      patientId: payment.patientId,
      amountCents: payment.amountCents,
      currency: payment.currency,
      provider: payment.provider,
      providerReference: payment.providerReference,
      status: payment.status,
      attemptCount: payment.attemptCount,
      failureReason: payment.failureReason,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      paidAt: payment.paidAt,
      failedAt: payment.failedAt,
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

  private parsePaymentFailureReason(value: string | undefined) {
    const reason = value?.trim();

    if (!reason) {
      return 'Payment failed.';
    }

    if (reason.length > 500) {
      throw new BadRequestException({
        success: false,
        message: 'Payment failure reason must be 500 characters or fewer.',
        field: 'reason',
      });
    }

    return reason;
  }

  private recordDoctorMessage(message: DoctorMessageInput) {
    this.databaseService.db
      .prepare(
        `
        INSERT INTO doctor_messages (
          doctor_id,
          appointment_id,
          patient_name,
          message_type,
          title,
          body,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .run(
        message.doctorId,
        message.appointmentId ?? null,
        message.patientName ?? null,
        message.messageType,
        message.title,
        message.body,
        message.createdAt,
      );
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
  paymentStatus?: string;
};

type AppointmentListRow = AppointmentEligibility & {
  id: string;
  slotTime: string;
  paymentStatus: string;
  paymentId: string | null;
  paymentAmountCents: number;
  paymentCurrency: string;
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
  paymentCreatedAt: string | null;
  paymentUpdatedAt: string | null;
  paymentSucceededAt: string | null;
  paymentFailedAt: string | null;
  paymentRecordId: string | null;
  paymentProvider: string | null;
  paymentProviderReference: string | null;
  paymentRecordStatus: string | null;
  paymentAttemptCount: number | null;
  paymentFailureReason: string | null;
  paymentRecordCreatedAt: string | null;
  paymentRecordUpdatedAt: string | null;
  paymentPaidAt: string | null;
  paymentRecordFailedAt: string | null;
};

type PaymentRow = {
  id: string;
  appointmentId: string;
  patientId: string;
  amountCents: number;
  currency: string;
  provider: string;
  providerReference: string;
  status: string;
  attemptCount: number;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  failedAt: string | null;
};

type CancellationActorRole = 'patient' | 'doctor' | 'admin';

type CancellationActor = {
  id: string;
  role: CancellationActorRole;
};

type DoctorMessageInput = {
  doctorId: number;
  appointmentId?: string;
  patientName?: string;
  messageType: string;
  title: string;
  body: string;
  createdAt: string;
};
