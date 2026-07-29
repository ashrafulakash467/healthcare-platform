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
import { LoginAdminDto } from './dto/login-admin.dto';
import { ReviewDoctorVerificationDto } from './dto/review-doctor-verification.dto';

@Injectable()
export class AdminService {
  private readonly sessions = new Map<string, AdminSession>();
  private readonly scrypt = promisify(scryptCallback);

  constructor(private readonly databaseService: DatabaseService) {}

  async login(loginAdminDto: LoginAdminDto) {
    const identifier = loginAdminDto.identifier?.trim().toLowerCase() ?? '';
    const password = loginAdminDto.password ?? '';

    if (!identifier || !password) {
      throw new BadRequestException({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const admin = this.findAdminByIdentifier(identifier);

    if (!admin || !(await this.verifyPassword(password, admin.passwordHash))) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const session = this.createSession(admin.id);

    return {
      success: true,
      message: 'Login successful.',
      token: session.token,
      expiresAt: session.expiresAt,
      user: this.toPublicAdmin(admin),
    };
  }

  getAuthenticatedAdmin(authorizationHeader?: string) {
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

    const admin = this.findAdminById(session.adminId);

    if (!admin) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication is required.',
      });
    }

    return {
      success: true,
      user: this.toPublicAdmin(admin),
    };
  }

  getDoctorVerificationQueue(authorizationHeader?: string) {
    this.getAuthenticatedAdmin(authorizationHeader);

    const pendingDoctors = this.listDoctorsByStatus('pending');
    const approvedDoctors = this.listDoctorsByStatus('approved');
    const rejectedDoctors = this.listDoctorsByStatus('rejected');
    const legacyVerifiedDoctors = this.listDoctorsByStatus('verified');

    return {
      success: true,
      pendingDoctors,
      summary: {
        pending: pendingDoctors.length,
        approved: approvedDoctors.length + legacyVerifiedDoctors.length,
        rejected: rejectedDoctors.length,
      },
    };
  }

  reviewDoctorVerification(
    doctorId: string | undefined,
    reviewDoctorVerificationDto: ReviewDoctorVerificationDto,
    authorizationHeader?: string,
  ) {
    this.getAuthenticatedAdmin(authorizationHeader);
    const parsedDoctorId = this.parseDoctorId(doctorId);
    const decision = reviewDoctorVerificationDto.decision?.trim().toLowerCase();
    const rejectionReason = reviewDoctorVerificationDto.rejectionReason?.trim() ?? '';
    const reviewNote = reviewDoctorVerificationDto.note?.trim() ?? '';
    const doctor = this.findDoctorById(parsedDoctorId);

    if (!doctor) {
      throw new NotFoundException({
        success: false,
        message: 'Doctor was not found.',
      });
    }

    if (doctor.verificationStatus !== 'pending') {
      throw new ConflictException({
        success: false,
        message: 'Only pending doctors can be reviewed.',
      });
    }

    if (decision !== 'approve' && decision !== 'reject') {
      throw new BadRequestException({
        success: false,
        message: 'Decision must be approve or reject.',
        field: 'decision',
      });
    }

    if (decision === 'reject' && rejectionReason.length < 3) {
      throw new BadRequestException({
        success: false,
        message: 'A rejection reason is required.',
        field: 'rejectionReason',
      });
    }

    const now = new Date().toISOString();
    const updatedStatus = decision === 'approve' ? 'approved' : 'rejected';
    const updatedIsVerified = decision === 'approve' ? 1 : 0;
    const updatedVerifiedAt = decision === 'approve' ? now : null;
    const updatedRejectionReason = decision === 'reject' ? rejectionReason : null;
    const messageTitle =
      decision === 'approve'
        ? 'Your doctor account was approved.'
        : 'Your doctor account was rejected.';
    const messageBody =
      decision === 'approve'
        ? 'An admin has approved your profile. Your account is now visible in public doctor search.'
        : `${rejectionReason}${reviewNote ? ` Admin note: ${reviewNote}` : ''}`;

    this.databaseService.db.exec('BEGIN IMMEDIATE');
    try {
      this.databaseService.db
        .prepare(
          `
          UPDATE doctors
          SET verification_status = ?,
              rejection_reason = ?,
              reviewed_at = ?,
              verified_at = ?,
              is_verified = ?
          WHERE id = ?
        `,
        )
        .run(
          updatedStatus,
          updatedRejectionReason,
          now,
          updatedVerifiedAt,
          updatedIsVerified,
          parsedDoctorId,
        );

      this.databaseService.db
        .prepare(
          `
          INSERT INTO doctor_messages (
            doctor_id,
            message_type,
            title,
            body,
            created_at
          )
          VALUES (?, 'verification', ?, ?, ?)
        `,
        )
        .run(parsedDoctorId, messageTitle, messageBody, now);

      this.databaseService.db.exec('COMMIT');

      const updatedDoctor = this.findDoctorById(parsedDoctorId);

      return {
        success: true,
        message:
          decision === 'approve'
            ? 'Doctor approved successfully.'
            : 'Doctor rejected successfully.',
        doctor: this.toDoctorVerificationView(updatedDoctor),
      };
    } catch (error) {
      this.databaseService.db.exec('ROLLBACK');
      throw error;
    }
  }

  private listDoctorsByStatus(status: DoctorVerificationStatus) {
    const doctors = this.databaseService.db
      .prepare(
        `
        SELECT
          id,
          name,
          email,
          phone,
          specialty,
          qualifications,
          experience_years as experienceYears,
          license_number as licenseNumber,
          license_issued_by as licenseIssuedBy,
          profile_summary as profileSummary,
          location,
          gender,
          verification_status as verificationStatus,
          rejection_reason as rejectionReason,
          reviewed_at as reviewedAt,
          verified_at as verifiedAt,
          is_available as isAvailable,
          is_verified as isVerified,
          is_active as isActive,
          image_url as imageUrl,
          created_at as createdAt
        FROM doctors
        WHERE verification_status = ? AND is_active = 1
        ORDER BY datetime(created_at) DESC, id DESC
      `,
      )
      .all(status)
      .map((doctor: DoctorVerificationRow) => this.toDoctorVerificationView(doctor));

    return doctors;
  }

  private findDoctorById(doctorId: number) {
    return this.databaseService.db
      .prepare(
        `
        SELECT
          id,
          name,
          email,
          phone,
          specialty,
          qualifications,
          experience_years as experienceYears,
          license_number as licenseNumber,
          license_issued_by as licenseIssuedBy,
          profile_summary as profileSummary,
          location,
          gender,
          verification_status as verificationStatus,
          rejection_reason as rejectionReason,
          reviewed_at as reviewedAt,
          verified_at as verifiedAt,
          is_available as isAvailable,
          is_verified as isVerified,
          is_active as isActive,
          image_url as imageUrl,
          created_at as createdAt
        FROM doctors
        WHERE id = ?
      `,
      )
      .get(doctorId) as DoctorVerificationRow | undefined;
  }

  private toDoctorVerificationView(doctor: DoctorVerificationRow | undefined) {
    if (!doctor) {
      return null;
    }

    return {
      id: doctor.id.toString(),
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialty: doctor.specialty,
      qualifications: this.parseQualifications(doctor.qualifications),
      experienceYears: doctor.experienceYears ?? 0,
      licenseNumber: doctor.licenseNumber,
      licenseIssuedBy: doctor.licenseIssuedBy,
      profileSummary: doctor.profileSummary,
      location: doctor.location,
      gender: doctor.gender,
      verificationStatus: this.normalizeStatus(doctor.verificationStatus),
      rejectionReason: doctor.rejectionReason,
      reviewedAt: doctor.reviewedAt,
      verifiedAt: doctor.verifiedAt,
      isAvailable: Boolean(doctor.isAvailable),
      isVerified: Boolean(doctor.isVerified),
      isActive: Boolean(doctor.isActive),
      imageUrl: doctor.imageUrl,
      createdAt: doctor.createdAt,
    };
  }

  private parseQualifications(value: string | null) {
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

  private normalizeStatus(value: string | null): DoctorVerificationStatus {
    if (value === 'pending' || value === 'approved' || value === 'rejected' || value === 'verified') {
      return value;
    }

    return 'pending';
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

  private findAdminByIdentifier(identifier: string) {
    const row = this.databaseService.db
      .prepare('SELECT * FROM admins WHERE email = ? LIMIT 1')
      .get(identifier) as AdminDbRow | undefined;

    return row ? this.toAdminAccount(row) : undefined;
  }

  private findAdminById(id: string) {
    const row = this.databaseService.db
      .prepare('SELECT * FROM admins WHERE id = ? LIMIT 1')
      .get(id) as AdminDbRow | undefined;

    return row ? this.toAdminAccount(row) : undefined;
  }

  private toAdminAccount(row: AdminDbRow): AdminAccount {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: 'admin',
      passwordHash: row.password_hash,
      createdAt: row.created_at,
    };
  }

  private toPublicAdmin(admin: AdminAccount) {
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
    };
  }

  private createSession(adminId: string) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
    const session = { token, adminId, expiresAt };

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
}

type DoctorVerificationStatus = 'pending' | 'approved' | 'rejected' | 'verified';

type AdminAccount = {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  passwordHash: string;
  createdAt: string;
};

type AdminDbRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  password_hash: string;
  created_at: string;
};

type AdminSession = {
  token: string;
  adminId: string;
  expiresAt: string;
};

type DoctorVerificationRow = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  specialty: string;
  qualifications: string | null;
  experienceYears: number | null;
  licenseNumber: string | null;
  licenseIssuedBy: string | null;
  profileSummary: string | null;
  location: string;
  gender: string;
  verificationStatus: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  verifiedAt: string | null;
  isAvailable: number;
  isVerified: number;
  isActive: number;
  imageUrl: string;
  createdAt: string;
};
