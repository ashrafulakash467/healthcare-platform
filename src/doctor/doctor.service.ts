import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { DatabaseService } from '../database/database.service';
import { LoginDoctorDto } from './dto/login-doctor.dto';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { SearchDoctorsDto } from './dto/search-doctors.dto';

@Injectable()
export class DoctorService {
  private readonly scrypt = promisify(scryptCallback);
  private readonly sessions = new Map<string, DoctorSession>();

  constructor(private readonly databaseService: DatabaseService) {}

  async register(registerDoctorDto: RegisterDoctorDto) {
    const payload = this.validateRegistration(registerDoctorDto);
    const normalizedEmail = payload.email.toLowerCase();
    const normalizedPhone = this.normalizePhone(payload.phone);

    const emailExists = this.databaseService.db
      .prepare('SELECT id FROM doctors WHERE email = ?')
      .get(normalizedEmail);
    if (emailExists) {
      throw new ConflictException({
        success: false,
        message: 'Email is already registered.',
        field: 'email',
      });
    }

    const phoneExists = this.databaseService.db
      .prepare('SELECT id FROM doctors WHERE phone = ?')
      .get(normalizedPhone);
    if (phoneExists) {
      throw new ConflictException({
        success: false,
        message: 'Phone number is already registered.',
        field: 'phone',
      });
    }

    const doctor: DoctorAccount = {
      id: `doctor_${Date.now()}_${randomBytes(4).toString('hex')}`,
      name: payload.name,
      role: 'doctor',
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash: await this.hashPassword(payload.password),
      specialty: payload.specialty,
      qualifications: payload.qualifications,
      experienceYears: payload.experienceYears,
      licenseNumber: payload.licenseNumber,
      licenseIssuedBy: payload.licenseIssuedBy,
      profileSummary: payload.profileSummary,
      location: payload.location,
      gender: payload.gender,
      verificationStatus: 'pending',
      rejectionReason: null,
      reviewedAt: null,
      verifiedAt: null,
      isAvailable: false,
      isVerified: false,
      isActive: true,
      imageUrl: payload.imageUrl,
      createdAt: new Date().toISOString(),
    };

    this.databaseService.db
      .prepare(
        `
        INSERT INTO doctors (
          id,
          name,
          role,
          email,
          phone,
          password_hash,
          specialty,
          qualifications,
          experience_years,
          license_number,
          license_issued_by,
          profile_summary,
          location,
          gender,
          verification_status,
          is_available,
          is_verified,
          is_active,
          image_url,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .run(
        doctor.id,
        doctor.name,
        doctor.role,
        doctor.email,
        doctor.phone,
        doctor.passwordHash,
        doctor.specialty,
        JSON.stringify(doctor.qualifications),
        doctor.experienceYears,
        doctor.licenseNumber,
        doctor.licenseIssuedBy,
        doctor.profileSummary,
        doctor.location,
        doctor.gender,
        doctor.verificationStatus,
        doctor.isAvailable ? 1 : 0,
        doctor.isVerified ? 1 : 0,
        doctor.isActive ? 1 : 0,
        doctor.imageUrl,
        doctor.createdAt,
      );

    return {
      success: true,
      message: 'Doctor account created successfully. Verification is pending.',
      doctor: this.toPublicDoctor(doctor),
    };
  }

  async login(loginDoctorDto: LoginDoctorDto) {
    const identifier = loginDoctorDto.identifier?.trim() ?? '';
    const password = loginDoctorDto.password ?? '';

    if (!identifier || !password) {
      throw new BadRequestException({
        success: false,
        message: 'Email/phone and password are required.',
      });
    }

    const normalizedIdentifier = identifier.includes('@')
      ? identifier.toLowerCase()
      : this.normalizePhone(identifier);
    const doctor = this.findDoctorByEmailOrPhone(normalizedIdentifier);

    if (!doctor || !doctor.passwordHash || !(await this.verifyPassword(password, doctor.passwordHash))) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid email/phone or password.',
      });
    }

    const session = this.createSession(doctor.id);

    return {
      success: true,
      message: 'Login successful.',
      token: session.token,
      expiresAt: session.expiresAt,
      user: this.toPublicDoctor(doctor),
    };
  }

  getAuthenticatedDoctor(authorizationHeader?: string) {
    const token = this.extractBearerToken(authorizationHeader);
    const session = token ? this.sessions.get(token) : undefined;

    if (!session || session.expiresAt <= new Date().toISOString()) {
      if (token) {
        this.sessions.delete(token);
      }

      throw new UnauthorizedException({
        success: false,
        message: 'Authentication is required.',
      });
    }

    const doctor = this.findDoctorById(Number(session.doctorId));

    if (!doctor) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication is required.',
      });
    }

    return {
      success: true,
      user: this.toPublicDoctor(doctor),
    };
  }

  getDashboard(authorizationHeader?: string, doctorId?: string) {
    const doctorIdValue =
      authorizationHeader && authorizationHeader.trim()
        ? this.getAuthenticatedDoctor(authorizationHeader).user.id
        : this.getDoctorByIdQuery(doctorId).id;
    const doctor = this.findDoctorById(Number(doctorIdValue));

    if (!doctor) {
      throw new NotFoundException({
        success: false,
        message: 'Doctor was not found.',
      });
    }

    return this.buildDashboard(Number(doctor.id), doctor);
  }

  search(query: SearchDoctorsDto) {
    const page = this.parsePositiveNumber(query.page, 1);
    const limit = Math.min(this.parsePositiveNumber(query.limit, 14), 50);
    const offset = (page - 1) * limit;
    const whereParams: Record<string, string | number> = {};
    const where = ['is_verified = 1', 'is_active = 1'];

    if (query.search?.trim()) {
      where.push('LOWER(name) LIKE @search');
      whereParams.search = `%${query.search.trim().toLowerCase()}%`;
    }

    if (query.specialty?.trim()) {
      where.push('LOWER(specialty) = @specialty');
      whereParams.specialty = query.specialty.trim().toLowerCase();
    }

    if (query.location?.trim()) {
      where.push('LOWER(location) = @location');
      whereParams.location = query.location.trim().toLowerCase();
    }

    if (query.gender?.trim()) {
      where.push('LOWER(gender) = @gender');
      whereParams.gender = query.gender.trim().toLowerCase();
    }

    if (query.availability?.trim()) {
      if (!['available', 'unavailable'].includes(query.availability)) {
        throw new BadRequestException({
          success: false,
          message: 'Availability must be available or unavailable.',
        });
      }

      where.push('is_available = @isAvailable');
      whereParams.isAvailable = query.availability === 'available' ? 1 : 0;
    }

    const whereSql = where.join(' AND ');
    const orderSql = this.getOrderBy(query.sort);
    const listParams = {
      ...whereParams,
      limit,
      offset,
    };
    const doctors = this.databaseService.db
      .prepare(
        `
        SELECT
          id,
          name,
          specialty,
          location,
          gender,
          is_available as isAvailable,
          image_url as imageUrl
        FROM doctors
        WHERE ${whereSql}
        ORDER BY ${orderSql}
        LIMIT @limit OFFSET @offset
      `,
      )
      .all(listParams)
      .map(this.toDoctorResult);

    const total = this.databaseService.db
      .prepare(`SELECT COUNT(*) as count FROM doctors WHERE ${whereSql}`)
      .get(whereParams) as { count: number };

    return {
      success: true,
      data: doctors,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
      filters: this.getFilterOptions(),
    };
  }

  private buildDashboard(doctorId: number, doctor: DoctorAccount) {
    const today = this.formatDate(new Date());

    const appointments = {
      today: this.getDashboardAppointments(
        doctorId,
        'appointments.appointment_date = @today',
        { today },
      ),
      upcoming: this.getDashboardAppointments(
        doctorId,
        `appointments.appointment_date > @today AND appointments.status IN ('requested', 'confirmed')`,
        { today },
      ),
      completed: this.getDashboardAppointments(
        doctorId,
        `appointments.status = 'completed'`,
        {},
      ),
      pending: this.getDashboardAppointments(
        doctorId,
        `appointments.status = 'requested'`,
        {},
      ),
    };

    const patientCount = this.databaseService.db
      .prepare(
        `
        SELECT COUNT(DISTINCT patient_id) as count
        FROM appointments
        WHERE doctor_id = ? AND status != 'cancelled'
      `,
      )
      .get(doctorId) as { count: number };

    const earningsRow = this.databaseService.db
      .prepare(
        `
        SELECT
          COUNT(*) as count,
          COALESCE(SUM(payment_amount_cents), 0) as totalCents,
          payment_currency as currency
        FROM appointments
        WHERE doctor_id = ? AND payment_status = 'paid'
      `,
      )
      .get(doctorId) as {
      count: number;
      totalCents: number;
      currency: string | null;
    };

    const recentMessages = this.databaseService.db
      .prepare(
        `
        SELECT
          id,
          appointment_id as appointmentId,
          patient_name as patientName,
          message_type as messageType,
          title,
          body,
          created_at as createdAt,
          read_at as readAt
        FROM doctor_messages
        WHERE doctor_id = ?
        ORDER BY datetime(created_at) DESC, id DESC
        LIMIT 8
      `,
      )
      .all(doctorId) as DoctorMessageRow[];

    return {
      success: true,
      doctor: this.toPublicDoctor(doctor),
      summary: {
        verificationStatus: doctor.verificationStatus,
        rejectionReason: doctor.rejectionReason,
        reviewedAt: doctor.reviewedAt,
        verifiedAt: doctor.verifiedAt,
        patientCount: patientCount.count,
        earnings:
          earningsRow.count > 0
            ? {
                totalCents: earningsRow.totalCents,
                currency: earningsRow.currency ?? 'BDT',
                appointmentCount: earningsRow.count,
              }
            : null,
      },
      appointments,
      recentMessages: recentMessages.map((message) => ({
        id: message.id,
        appointmentId: message.appointmentId,
        patientName: message.patientName,
        messageType: message.messageType,
        title: message.title,
        body: message.body,
        createdAt: message.createdAt,
        readAt: message.readAt,
      })),
    };
  }

  private formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private getDoctorByIdQuery(doctorId: string | undefined) {
    const parsedDoctorId = this.parseDoctorId(doctorId);
    const doctor = this.findDoctorById(parsedDoctorId);

    if (!doctor) {
      throw new NotFoundException({
        success: false,
        message: 'Doctor was not found.',
      });
    }

    return doctor;
  }

  private getDashboardAppointments(
    doctorId: number,
    whereClause: string,
    params: Record<string, string | number>,
  ) {
    return this.databaseService.db
      .prepare(
        `
        SELECT
          appointments.id,
          appointments.appointment_date as appointmentDate,
          appointments.slot_time as slotTime,
          appointments.status,
          appointments.payment_status as paymentStatus,
          appointments.payment_amount_cents as paymentAmountCents,
          appointments.payment_currency as paymentCurrency,
          appointments.created_at as createdAt,
          patients.id as patientId,
          patients.name as patientName,
          patients.phone as patientPhone,
          doctor_clinics.id as clinicId,
          doctor_clinics.name as clinicName,
          doctor_clinics.location as clinicLocation
        FROM appointments
        INNER JOIN patients ON patients.id = appointments.patient_id
        INNER JOIN doctor_clinics ON doctor_clinics.id = appointments.clinic_id
        WHERE appointments.doctor_id = @doctorId AND ${whereClause}
        ORDER BY appointments.appointment_date DESC, appointments.slot_time DESC
        LIMIT 12
      `,
      )
      .all({ doctorId, ...params })
      .map((appointment: DoctorDashboardAppointmentRow) => ({
        id: appointment.id,
        appointmentDate: appointment.appointmentDate,
        slotTime: appointment.slotTime,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        paymentAmountCents: appointment.paymentAmountCents,
        paymentCurrency: appointment.paymentCurrency,
        createdAt: appointment.createdAt,
        patient: {
          id: appointment.patientId,
          name: appointment.patientName,
          phone: appointment.patientPhone,
        },
        clinic: {
          id: appointment.clinicId,
          name: appointment.clinicName,
          location: appointment.clinicLocation,
        },
      }));
  }

  private findDoctorByEmailOrPhone(identifier: string) {
    const row = this.databaseService.db
      .prepare('SELECT * FROM doctors WHERE email = ? OR phone = ? LIMIT 1')
      .get(identifier, identifier) as DoctorDbRow | undefined;

    return row ? this.toDoctorAccount(row) : undefined;
  }

  private findDoctorById(doctorId: number) {
    const row = this.databaseService.db
      .prepare('SELECT * FROM doctors WHERE id = ? LIMIT 1')
      .get(doctorId) as DoctorDbRow | undefined;

    return row ? this.toDoctorAccount(row) : undefined;
  }

  private toDoctorAccount(row: DoctorDbRow): DoctorAccount {
    return {
      id: row.id.toString(),
      name: row.name,
      role: 'doctor',
      email: row.email ?? '',
      phone: row.phone ?? '',
      passwordHash: row.password_hash ?? '',
      specialty: row.specialty,
      qualifications: this.parseStoredQualifications(row.qualifications),
      experienceYears: row.experience_years ?? 0,
      licenseNumber: row.license_number ?? '',
      licenseIssuedBy: row.license_issued_by ?? '',
      profileSummary: row.profile_summary ?? '',
      location: row.location,
      gender: row.gender,
      verificationStatus: this.parseVerificationStatus(row.verification_status),
      rejectionReason: row.rejection_reason ?? null,
      reviewedAt: row.reviewed_at ?? null,
      verifiedAt: row.verified_at ?? null,
      isAvailable: Boolean(row.is_available),
      isVerified: Boolean(row.is_verified),
      isActive: Boolean(row.is_active),
      imageUrl: row.image_url,
      createdAt: row.created_at,
    };
  }

  private parseStoredQualifications(value: string | null) {
    if (!value) {
      return [];
    }

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.map((item) => String(item).trim()).filter(Boolean)
        : [];
    } catch {
      return value
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  private parseVerificationStatus(value: string | null): DoctorVerificationStatus {
    if (value === 'approved' || value === 'rejected' || value === 'pending' || value === 'verified') {
      return value;
    }

    return 'pending';
  }

  private createSession(doctorId: string) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
    const session = { token, doctorId, expiresAt };

    this.sessions.set(token, session);

    return session;
  }

  private extractBearerToken(authorizationHeader?: string) {
    const [scheme, token] = authorizationHeader?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      return undefined;
    }

    return token;
  }

  private parseDoctorId(value: string | undefined) {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException({
        success: false,
        message: 'doctorId is required.',
        field: 'doctorId',
      });
    }

    return parsed;
  }

  private validateRegistration(registerDoctorDto: RegisterDoctorDto) {
    const name = registerDoctorDto.name?.trim() ?? '';
    const email = registerDoctorDto.email?.trim() ?? '';
    const phone = registerDoctorDto.phone?.trim() ?? '';
    const password = registerDoctorDto.password ?? '';
    const confirmPassword = registerDoctorDto.confirmPassword ?? '';
    const specialty = registerDoctorDto.specialty?.trim() ?? '';
    const qualifications = this.parseQualifications(registerDoctorDto.qualifications);
    const experienceYears = this.parseExperienceYears(registerDoctorDto.experienceYears);
    const licenseNumber = registerDoctorDto.licenseNumber?.trim() ?? '';
    const licenseIssuedBy = registerDoctorDto.licenseIssuedBy?.trim() ?? '';
    const profileSummary = registerDoctorDto.profileSummary?.trim() ?? '';
    const location = registerDoctorDto.location?.trim() ?? '';
    const gender = registerDoctorDto.gender?.trim() ?? '';
    const imageUrl = registerDoctorDto.imageUrl?.trim() ?? '';
    const errors: Record<string, string> = {};

    if (name.length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!/^\+?[0-9]{10,15}$/.test(this.normalizePhone(phone))) {
      errors.phone = 'Enter a valid phone number.';
    }

    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (specialty.length < 2) {
      errors.specialty = 'Specialty must be at least 2 characters.';
    }

    if (qualifications.length === 0) {
      errors.qualifications = 'At least one qualification is required.';
    }

    if (experienceYears < 0) {
      errors.experienceYears = 'Experience years must be 0 or greater.';
    }

    if (licenseNumber.length < 3) {
      errors.licenseNumber = 'License number is required.';
    }

    if (licenseIssuedBy.length < 2) {
      errors.licenseIssuedBy = 'License issuing authority is required.';
    }

    if (profileSummary.length < 20) {
      errors.profileSummary = 'Profile summary must be at least 20 characters.';
    }

    if (location.length < 2) {
      errors.location = 'Location is required.';
    }

    if (gender.length < 2) {
      errors.gender = 'Gender is required.';
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({
        success: false,
        message: 'Doctor registration validation failed.',
        errors,
      });
    }

    return {
      name,
      email,
      phone,
      password,
      specialty,
      qualifications,
      experienceYears,
      licenseNumber,
      licenseIssuedBy,
      profileSummary,
      location,
      gender,
      imageUrl,
    };
  }

  private parseQualifications(value: unknown) {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === 'string') {
      return value
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }

  private parseExperienceYears(value: unknown) {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 0) {
      return -1;
    }

    return parsed;
  }

  private normalizePhone(phone: string) {
    return phone.replace(/[\s()-]/g, '');
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await this.scrypt(password, salt, 64)) as Buffer;

    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
  }

  private async verifyPassword(password: string, passwordHash: string) {
    const [algorithm, salt, storedKey] = passwordHash.split(':');
    if (algorithm !== 'scrypt' || !salt || !storedKey) {
      return false;
    }

    const derivedKey = (await this.scrypt(password, salt, 64)) as Buffer;
    const storedKeyBuffer = Buffer.from(storedKey, 'hex');

    if (derivedKey.length !== storedKeyBuffer.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, storedKeyBuffer);
  }

  private parsePositiveNumber(value: string | undefined, fallback: number) {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 1) {
      return fallback;
    }

    return parsed;
  }

  private getOrderBy(sort = 'name_asc') {
    const sortOptions: Record<string, string> = {
      name_asc: 'name ASC',
      name_desc: 'name DESC',
      specialty_asc: 'specialty ASC, name ASC',
      location_asc: 'location ASC, name ASC',
      newest: 'datetime(created_at) DESC, id DESC',
    };

    return sortOptions[sort] ?? sortOptions.name_asc;
  }

  private getFilterOptions() {
    const baseWhere = 'is_verified = 1 AND is_active = 1';

    return {
      specialties: this.getDistinctValues('specialty', baseWhere),
      locations: this.getDistinctValues('location', baseWhere),
      genders: this.getDistinctValues('gender', baseWhere),
    };
  }

  private getDistinctValues(column: 'specialty' | 'location' | 'gender', where: string) {
    return this.databaseService.db
      .prepare(
        `SELECT DISTINCT ${column} as value FROM doctors WHERE ${where} ORDER BY ${column} ASC`,
      )
      .all()
      .map((row: { value: string }) => row.value);
  }

  private toDoctorResult(row: DoctorSearchRow) {
    return {
      id: row.id,
      name: row.name,
      specialty: row.specialty,
      location: row.location,
      gender: row.gender,
      isAvailable: Boolean(row.isAvailable),
      imageUrl: row.imageUrl,
    };
  }

  private toPublicDoctor(doctor: DoctorAccount) {
    return {
      id: doctor.id,
      name: doctor.name,
      role: doctor.role,
      email: doctor.email,
      phone: doctor.phone,
      specialty: doctor.specialty,
      qualifications: doctor.qualifications,
      experienceYears: doctor.experienceYears,
      licenseNumber: doctor.licenseNumber,
      licenseIssuedBy: doctor.licenseIssuedBy,
      profileSummary: doctor.profileSummary,
      location: doctor.location,
      gender: doctor.gender,
      verificationStatus: doctor.verificationStatus,
      rejectionReason: doctor.rejectionReason,
      reviewedAt: doctor.reviewedAt,
      verifiedAt: doctor.verifiedAt,
      isAvailable: doctor.isAvailable,
      isVerified: doctor.isVerified,
      isActive: doctor.isActive,
      imageUrl: doctor.imageUrl,
      createdAt: doctor.createdAt,
    };
  }
}

type DoctorSearchRow = {
  id: number;
  name: string;
  specialty: string;
  location: string;
  gender: string;
  isAvailable: number;
  imageUrl: string;
};

type DoctorVerificationStatus = 'pending' | 'approved' | 'rejected' | 'verified';

type DoctorAccount = {
  id: string;
  name: string;
  role: 'doctor';
  email: string;
  phone: string;
  passwordHash: string;
  specialty: string;
  qualifications: string[];
  experienceYears: number;
  licenseNumber: string;
  licenseIssuedBy: string;
  profileSummary: string;
  location: string;
  gender: string;
  verificationStatus: DoctorVerificationStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  verifiedAt: string | null;
  isAvailable: boolean;
  isVerified: boolean;
  isActive: boolean;
  imageUrl: string;
  createdAt: string;
};

type DoctorDbRow = {
  id: number;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  password_hash: string | null;
  specialty: string;
  qualifications: string | null;
  experience_years: number | null;
  license_number: string | null;
  license_issued_by: string | null;
  profile_summary: string | null;
  location: string;
  gender: string;
  verification_status: string | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
  verified_at: string | null;
  is_available: number;
  is_verified: number;
  is_active: number;
  image_url: string;
  created_at: string;
};

type DoctorDashboardAppointmentRow = {
  id: string;
  appointmentDate: string;
  slotTime: string;
  status: string;
  paymentStatus: string;
  paymentAmountCents: number;
  paymentCurrency: string;
  createdAt: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  clinicId: number;
  clinicName: string;
  clinicLocation: string;
};

type DoctorMessageRow = {
  id: number;
  appointmentId: string | null;
  patientName: string | null;
  messageType: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

type DoctorSession = {
  token: string;
  doctorId: string;
  expiresAt: string;
};
