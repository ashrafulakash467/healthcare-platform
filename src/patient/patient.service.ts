import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'crypto';
import { promisify } from 'util';
import { DatabaseService } from '../database/database.service';
import { LoginPatientDto } from './dto/login-patient.dto';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class PatientService {
  private readonly sessions = new Map<string, PatientSession>();
  private readonly passwordResetTokens = new Map<string, PasswordResetToken>();
  private readonly scrypt = promisify(scryptCallback);

  constructor(private readonly databaseService: DatabaseService) {}

  async register(registerPatientDto: RegisterPatientDto) {
    const payload = this.validateRegistration(registerPatientDto);
    const normalizedEmail = payload.email.toLowerCase();
    const normalizedPhone = this.normalizePhone(payload.phone);

    const emailExists = this.databaseService.db
      .prepare('SELECT id FROM patients WHERE email = ?')
      .get(normalizedEmail);
    if (emailExists) {
      throw new ConflictException({
        success: false,
        message: 'Email is already registered.',
        field: 'email',
      });
    }

    const phoneExists = this.databaseService.db
      .prepare('SELECT id FROM patients WHERE phone = ?')
      .get(normalizedPhone);
    if (phoneExists) {
      throw new ConflictException({
        success: false,
        message: 'Phone number is already registered.',
        field: 'phone',
      });
    }

    const patient: PatientUser = {
      id: `patient_${Date.now()}_${randomBytes(4).toString('hex')}`,
      name: payload.name,
      email: normalizedEmail,
      phone: normalizedPhone,
      role: 'patient',
      passwordHash: await this.hashPassword(payload.password),
      createdAt: new Date().toISOString(),
    };

    this.databaseService.db
      .prepare(
        `
        INSERT INTO patients (id, name, email, phone, role, password_hash, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .run(
        patient.id,
        patient.name,
        patient.email,
        patient.phone,
        patient.role,
        patient.passwordHash,
        patient.createdAt,
      );

    return {
      success: true,
      message: 'Patient registered successfully.',
      user: this.toPublicPatient(patient),
    };
  }

  async login(loginPatientDto: LoginPatientDto) {
    const identifier = loginPatientDto.identifier?.trim() ?? '';
    const password = loginPatientDto.password ?? '';

    if (!identifier || !password) {
      throw new BadRequestException({
        success: false,
        message: 'Email/phone and password are required.',
      });
    }

    const normalizedIdentifier = identifier.includes('@')
      ? identifier.toLowerCase()
      : this.normalizePhone(identifier);

    const patient = this.findPatientByEmailOrPhone(normalizedIdentifier);

    if (!patient || !(await this.verifyPassword(password, patient.passwordHash))) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid email/phone or password.',
      });
    }

    const session = this.createSession(patient.id);

    return {
      success: true,
      message: 'Login successful.',
      token: session.token,
      expiresAt: session.expiresAt,
      user: this.toPublicPatient(patient),
    };
  }

  getAuthenticatedPatient(authorizationHeader?: string) {
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

    const patient = this.findPatientById(session.patientId);

    if (!patient) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication is required.',
      });
    }

    return {
      success: true,
      user: this.toPublicPatient(patient),
    };
  }

  requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto) {
    const email = requestPasswordResetDto.email?.trim().toLowerCase() ?? '';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException({
        success: false,
        message: 'Enter a valid email address.',
        field: 'email',
      });
    }

    const patient = this.findPatientByEmail(email);
    const response: PasswordResetResponse = {
      success: true,
      message:
        'If that email exists, a password reset link has been prepared.',
    };

    if (!patient) {
      return response;
    }

    this.expireUnusedResetTokens(patient.id);

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString();

    this.passwordResetTokens.set(tokenHash, {
      tokenHash,
      patientId: patient.id,
      expiresAt,
      usedAt: null,
    });

    return {
      ...response,
      resetToken: token,
      resetUrl: `/reset-password?token=${token}`,
      expiresAt,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const token = resetPasswordDto.token?.trim() ?? '';
    const password = resetPasswordDto.password ?? '';
    const confirmPassword = resetPasswordDto.confirmPassword ?? '';

    const errors: Record<string, string> = {};
    if (!token) {
      errors.token = 'Reset token is required.';
    }
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({
        success: false,
        message: 'Password reset validation failed.',
        errors,
      });
    }

    const tokenHash = this.hashResetToken(token);
    const resetToken = this.passwordResetTokens.get(tokenHash);

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt <= new Date().toISOString()
    ) {
      if (resetToken) {
        this.passwordResetTokens.delete(tokenHash);
      }
      throw new BadRequestException({
        success: false,
        message: 'Reset token is invalid or expired.',
        field: 'token',
      });
    }

    const patient = this.findPatientById(resetToken.patientId);

    if (!patient) {
      this.passwordResetTokens.delete(tokenHash);
      throw new BadRequestException({
        success: false,
        message: 'Reset token is invalid or expired.',
        field: 'token',
      });
    }

    resetToken.usedAt = new Date().toISOString();
    patient.passwordHash = await this.hashPassword(password);
    this.databaseService.db
      .prepare('UPDATE patients SET password_hash = ? WHERE id = ?')
      .run(patient.passwordHash, patient.id);
    this.passwordResetTokens.delete(tokenHash);
    this.invalidatePatientSessions(patient.id);

    return {
      success: true,
      message: 'Password has been reset successfully.',
    };
  }

  private validateRegistration(registerPatientDto: RegisterPatientDto) {
    const name = registerPatientDto.name?.trim() ?? '';
    const email = registerPatientDto.email?.trim() ?? '';
    const phone = registerPatientDto.phone?.trim() ?? '';
    const password = registerPatientDto.password ?? '';
    const confirmPassword = registerPatientDto.confirmPassword ?? '';
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

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({
        success: false,
        message: 'Registration validation failed.',
        errors,
      });
    }

    return { name, email, phone, password };
  }

  private normalizePhone(phone: string) {
    return phone.replace(/[\s()-]/g, '');
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await this.scrypt(password, salt, 64)) as Buffer;

    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
  }

  private hashResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
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

  private createSession(patientId: string) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
    const session = { token, patientId, expiresAt };

    this.sessions.set(token, session);

    return session;
  }

  private invalidatePatientSessions(patientId: string) {
    for (const [token, session] of this.sessions.entries()) {
      if (session.patientId === patientId) {
        this.sessions.delete(token);
      }
    }
  }

  private expireUnusedResetTokens(patientId: string) {
    for (const [tokenHash, resetToken] of this.passwordResetTokens.entries()) {
      if (resetToken.patientId === patientId && !resetToken.usedAt) {
        this.passwordResetTokens.delete(tokenHash);
      }
    }
  }

  private extractBearerToken(authorizationHeader?: string) {
    const [scheme, token] = authorizationHeader?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      return undefined;
    }

    return token;
  }

  private toPublicPatient(patient: PatientUser) {
    return {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      role: patient.role,
      createdAt: patient.createdAt,
    };
  }

  private findPatientByEmail(email: string) {
    const row = this.databaseService.db
      .prepare('SELECT * FROM patients WHERE email = ?')
      .get(email) as PatientRow | undefined;

    return row ? this.toPatientUser(row) : undefined;
  }

  private findPatientById(id: string) {
    const row = this.databaseService.db
      .prepare('SELECT * FROM patients WHERE id = ?')
      .get(id) as PatientRow | undefined;

    return row ? this.toPatientUser(row) : undefined;
  }

  private findPatientByEmailOrPhone(identifier: string) {
    const row = this.databaseService.db
      .prepare('SELECT * FROM patients WHERE email = ? OR phone = ?')
      .get(identifier, identifier) as PatientRow | undefined;

    return row ? this.toPatientUser(row) : undefined;
  }

  private toPatientUser(row: PatientRow): PatientUser {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: 'patient',
      passwordHash: row.password_hash,
      createdAt: row.created_at,
    };
  }
}

type PatientRole = 'patient';

type PatientUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: PatientRole;
  passwordHash: string;
  createdAt: string;
};

type PatientRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  password_hash: string;
  created_at: string;
};

type PatientSession = {
  token: string;
  patientId: string;
  expiresAt: string;
};

type PasswordResetToken = {
  tokenHash: string;
  patientId: string;
  expiresAt: string;
  usedAt: string | null;
};

type PasswordResetResponse = {
  success: true;
  message: string;
  resetToken?: string;
  resetUrl?: string;
  expiresAt?: string;
};
