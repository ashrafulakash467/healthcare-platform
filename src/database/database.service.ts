import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { scryptSync } from 'crypto';
import { DatabaseSync } from 'node:sqlite';
import { join } from 'path';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly database: DatabaseSync;

  constructor() {
    const dataDirectory = join(process.cwd(), 'data');
    if (!existsSync(dataDirectory)) {
      mkdirSync(dataDirectory, { recursive: true });
    }

    this.database = new DatabaseSync(join(dataDirectory, 'healthcare.sqlite'));
    this.database.exec('PRAGMA journal_mode = WAL;');
    this.database.exec('PRAGMA foreign_keys = ON;');
    this.createDoctorTable();
    this.createPatientTable();
    this.createClinicTable();
    this.createScheduleTable();
    this.createAppointmentTable();
    this.createAppointmentPaymentTable();
    this.createPatientDoctorTable();
    this.createAppointmentHistoryTable();
    this.createAppointmentCancellationHistoryTable();
    this.createAdminTable();
    this.createDoctorMessageTable();
    this.ensureAppointmentCancellationColumns();
    this.ensureDoctorAccountColumns();
    this.ensureAppointmentPaymentColumns();
    this.seedDoctors();
    this.seedDemoAccounts();
    this.seedDoctorClinicsAndSchedules();
  }

  get db() {
    return this.database;
  }

  onModuleDestroy() {
    this.database.close();
  }

  private createDoctorTable() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'doctor',
        email TEXT,
        phone TEXT,
        password_hash TEXT,
        specialty TEXT NOT NULL,
        qualifications TEXT,
        experience_years INTEGER,
        license_number TEXT,
        license_issued_by TEXT,
        profile_summary TEXT,
        location TEXT NOT NULL,
        gender TEXT NOT NULL,
        verification_status TEXT NOT NULL DEFAULT 'pending',
        rejection_reason TEXT,
        reviewed_at TEXT,
        verified_at TEXT,
        is_available INTEGER NOT NULL DEFAULT 1,
        is_verified INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        image_url TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private createPatientTable() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'patient',
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private createClinicTable() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS doctor_clinics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doctor_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id)
      );
    `);
  }

  private createScheduleTable() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS doctor_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doctor_id INTEGER NOT NULL,
        clinic_id INTEGER NOT NULL,
        weekday INTEGER NOT NULL,
        slot_time TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id),
        FOREIGN KEY (clinic_id) REFERENCES doctor_clinics(id)
      );
    `);
  }

  private createAppointmentTable() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        doctor_id INTEGER NOT NULL,
        clinic_id INTEGER NOT NULL,
        appointment_date TEXT NOT NULL,
        slot_time TEXT NOT NULL,
        status TEXT NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'unpaid',
        payment_id TEXT,
        payment_amount_cents INTEGER NOT NULL DEFAULT 0,
        payment_currency TEXT NOT NULL DEFAULT 'BDT',
        payment_created_at TEXT,
        payment_updated_at TEXT,
        payment_succeeded_at TEXT,
        payment_failed_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (doctor_id) REFERENCES doctors(id),
        FOREIGN KEY (clinic_id) REFERENCES doctor_clinics(id)
      );

      CREATE UNIQUE INDEX IF NOT EXISTS appointment_slot_unique
      ON appointments (doctor_id, clinic_id, appointment_date, slot_time)
      WHERE status IN ('requested', 'confirmed');
    `);
  }

  private createAppointmentPaymentTable() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS appointment_payments (
        id TEXT PRIMARY KEY,
        appointment_id TEXT NOT NULL UNIQUE,
        patient_id TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        currency TEXT NOT NULL,
        provider TEXT NOT NULL,
        provider_reference TEXT NOT NULL,
        status TEXT NOT NULL,
        attempt_count INTEGER NOT NULL DEFAULT 1,
        failure_reason TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        paid_at TEXT,
        failed_at TEXT,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id),
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      );

      CREATE INDEX IF NOT EXISTS appointment_payments_status_index
      ON appointment_payments (status);
    `);
  }

  private createPatientDoctorTable() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS patient_doctors (
        patient_id TEXT NOT NULL,
        doctor_id INTEGER NOT NULL,
        first_appointment_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (patient_id, doctor_id),
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (doctor_id) REFERENCES doctors(id),
        FOREIGN KEY (first_appointment_id) REFERENCES appointments(id)
      );
    `);
  }

  private createAppointmentHistoryTable() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS appointment_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointment_id TEXT NOT NULL,
        action TEXT NOT NULL,
        old_date TEXT,
        old_slot_time TEXT,
        new_date TEXT,
        new_slot_time TEXT,
        old_status TEXT,
        new_status TEXT,
        changed_by_patient_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id),
        FOREIGN KEY (changed_by_patient_id) REFERENCES patients(id)
      );
    `);
  }

  private createAppointmentCancellationHistoryTable() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS appointment_cancellation_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointment_id TEXT NOT NULL,
        old_status TEXT NOT NULL,
        new_status TEXT NOT NULL,
        cancellation_reason TEXT NOT NULL,
        cancelled_by_role TEXT NOT NULL,
        cancelled_by_user_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id)
      );
    `);
  }

  private createAdminTable() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'admin',
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private createDoctorMessageTable() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS doctor_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doctor_id INTEGER NOT NULL,
        appointment_id TEXT,
        patient_name TEXT,
        message_type TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        read_at TEXT,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id),
        FOREIGN KEY (appointment_id) REFERENCES appointments(id)
      );

      CREATE INDEX IF NOT EXISTS doctor_messages_doctor_created_at_index
      ON doctor_messages (doctor_id, created_at DESC);
    `);
  }

  private ensureAppointmentCancellationColumns() {
    this.ensureColumn('appointments', 'cancelled_at', 'TEXT');
    this.ensureColumn('appointments', 'cancelled_by_role', 'TEXT');
    this.ensureColumn('appointments', 'cancelled_by_user_id', 'TEXT');
    this.ensureColumn('appointments', 'cancellation_reason', 'TEXT');
  }

  private ensureDoctorAccountColumns() {
    this.ensureColumn('doctors', 'role', "TEXT NOT NULL DEFAULT 'doctor'");
    this.ensureColumn('doctors', 'email', 'TEXT');
    this.ensureColumn('doctors', 'phone', 'TEXT');
    this.ensureColumn('doctors', 'password_hash', 'TEXT');
    this.ensureColumn('doctors', 'qualifications', 'TEXT');
    this.ensureColumn('doctors', 'experience_years', 'INTEGER');
    this.ensureColumn('doctors', 'license_number', 'TEXT');
    this.ensureColumn('doctors', 'license_issued_by', 'TEXT');
    this.ensureColumn('doctors', 'profile_summary', 'TEXT');
    this.ensureColumn('doctors', 'verification_status', "TEXT NOT NULL DEFAULT 'pending'");
    this.ensureColumn('doctors', 'rejection_reason', 'TEXT');
    this.ensureColumn('doctors', 'reviewed_at', 'TEXT');
    this.ensureColumn('doctors', 'verified_at', 'TEXT');

    this.database.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS doctors_email_unique
      ON doctors (email)
      WHERE email IS NOT NULL;

      CREATE UNIQUE INDEX IF NOT EXISTS doctors_phone_unique
      ON doctors (phone)
      WHERE phone IS NOT NULL;
    `);

    this.database.exec(`
      UPDATE doctors
      SET role = 'doctor'
      WHERE role IS NULL OR role = '';

      UPDATE doctors
      SET verification_status = 'verified'
      WHERE is_verified = 1 AND (verification_status IS NULL OR verification_status = 'pending');

      UPDATE doctors
      SET verified_at = COALESCE(verified_at, created_at)
      WHERE is_verified = 1 AND verified_at IS NULL;
    `);
  }

  private ensureAppointmentPaymentColumns() {
    this.ensureColumn('appointments', 'payment_status', "TEXT NOT NULL DEFAULT 'unpaid'");
    this.ensureColumn('appointments', 'payment_id', 'TEXT');
    this.ensureColumn('appointments', 'payment_amount_cents', 'INTEGER NOT NULL DEFAULT 0');
    this.ensureColumn('appointments', 'payment_currency', "TEXT NOT NULL DEFAULT 'BDT'");
    this.ensureColumn('appointments', 'payment_created_at', 'TEXT');
    this.ensureColumn('appointments', 'payment_updated_at', 'TEXT');
    this.ensureColumn('appointments', 'payment_succeeded_at', 'TEXT');
    this.ensureColumn('appointments', 'payment_failed_at', 'TEXT');
  }

  private ensureColumn(tableName: string, columnName: string, definition: string) {
    const columns = this.database
      .prepare(`PRAGMA table_info(${tableName})`)
      .all() as { name: string }[];

    if (columns.some((column) => column.name === columnName)) {
      return;
    }

    this.database.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }

  private seedDoctors() {
    const count = this.database
      .prepare('SELECT COUNT(*) as count FROM doctors')
      .get() as { count: number };

    if (count.count > 0) {
      return;
    }

    const insertDoctor = this.database.prepare(`
      INSERT INTO doctors (
        name,
        role,
        verification_status,
        specialty,
        location,
        gender,
        is_available,
        is_verified,
        is_active,
        image_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const doctor of initialDoctors) {
      insertDoctor.run(
        doctor.name,
        'doctor',
        doctor.isVerified ? 'verified' : 'pending',
        doctor.specialty,
        doctor.location,
        doctor.gender,
        doctor.isAvailable ? 1 : 0,
        doctor.isVerified ? 1 : 0,
        doctor.isActive ? 1 : 0,
        doctor.imageUrl,
      );
    }
  }

  private seedDemoAccounts() {
    this.seedDemoPatient();
    this.seedDemoDoctor();
    this.seedDemoAdmin();
  }

  private seedDemoPatient() {
    const existing = this.database
      .prepare('SELECT id FROM patients WHERE email = ? OR phone = ?')
      .get('user@healthcare.com', '+8801000000001');

    if (existing) {
      return;
    }

    const passwordHash = this.hashPasswordForSeed('User@12345');
    this.database
      .prepare(
        `
        INSERT INTO patients (id, name, email, phone, role, password_hash, created_at)
        VALUES (?, ?, ?, ?, 'patient', ?, ?)
      `,
      )
      .run(
        'patient_demo_user',
        'Demo User',
        'user@healthcare.com',
        '+8801000000001',
        passwordHash,
        new Date().toISOString(),
      );
  }

  private seedDemoDoctor() {
    const existing = this.database
      .prepare('SELECT id FROM doctors WHERE email = ? OR phone = ?')
      .get('doctor@healthcare.com', '+8801000000002');

    if (existing) {
      return;
    }

    const passwordHash = this.hashPasswordForSeed('Doctor@12345');
    const createdAt = new Date().toISOString();
    const result = this.database
      .prepare(
        `
        INSERT INTO doctors (
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
          reviewed_at,
          verified_at,
          is_available,
          is_verified,
          is_active,
          image_url,
          created_at
        )
        VALUES (?, 'doctor', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', ?, ?, 1, 1, 1, ?, ?)
      `,
      )
      .run(
        'Dr. Demo',
        'doctor@healthcare.com',
        '+8801000000002',
        passwordHash,
        'General physician',
        JSON.stringify(['MBBS', 'FCPS']),
        8,
        'BMDC-DEMO-001',
        'Bangladesh Medical and Dental Council',
        'Demo doctor account for quick login and testing.',
        'Dhaka',
        'male',
        createdAt,
        createdAt,
        '/images/doctors/doc1.png',
        createdAt,
      );

    const doctorId = Number(result.lastInsertRowid);
    this.seedDemoDoctorClinicsAndSchedules(doctorId, 'Dhaka');
  }

  private seedDemoAdmin() {
    const existing = this.database
      .prepare('SELECT id FROM admins WHERE email = ?')
      .get('admin@healthcare.com');

    if (existing) {
      return;
    }

    const passwordHash = this.hashPasswordForSeed('Admin@12345');
    this.database
      .prepare(
        `
        INSERT INTO admins (id, name, email, role, password_hash, created_at)
        VALUES (?, ?, ?, 'admin', ?, ?)
      `,
      )
      .run(
        'admin_demo_admin',
        'Demo Admin',
        'admin@healthcare.com',
        passwordHash,
        new Date().toISOString(),
      );
  }

  private seedDoctorClinicsAndSchedules() {
    const count = this.database
      .prepare('SELECT COUNT(*) as count FROM doctor_clinics')
      .get() as { count: number };

    if (count.count > 0) {
      return;
    }

    const doctors = this.database
      .prepare('SELECT id, name, location FROM doctors WHERE is_verified = 1 AND is_active = 1')
      .all() as { id: number; name: string; location: string }[];
    const insertClinic = this.database.prepare(`
      INSERT INTO doctor_clinics (doctor_id, name, location, is_active)
      VALUES (?, ?, ?, 1)
    `);
    const insertSchedule = this.database.prepare(`
      INSERT INTO doctor_schedules (doctor_id, clinic_id, weekday, slot_time, is_active)
      VALUES (?, ?, ?, ?, 1)
    `);

    for (const doctor of doctors) {
      const clinicName = `${doctor.location} Health Clinic`;
      const result = insertClinic.run(doctor.id, clinicName, doctor.location);
      const clinicId = Number(result.lastInsertRowid);
      const weekdays = doctor.id % 2 === 0 ? [1, 3, 5] : [0, 2, 4];
      const slotTimes =
        doctor.id % 3 === 0 ? ['10:00', '10:30', '11:00'] : ['16:00', '16:30', '17:00'];

      for (const weekday of weekdays) {
        for (const slotTime of slotTimes) {
          insertSchedule.run(doctor.id, clinicId, weekday, slotTime);
        }
      }
    }
  }

  private seedDemoDoctorClinicsAndSchedules(doctorId: number, location: string) {
    const existingClinic = this.database
      .prepare('SELECT id FROM doctor_clinics WHERE doctor_id = ? LIMIT 1')
      .get(doctorId) as { id: number } | undefined;

    if (existingClinic) {
      return;
    }

    const insertClinic = this.database.prepare(`
      INSERT INTO doctor_clinics (doctor_id, name, location, is_active)
      VALUES (?, ?, ?, 1)
    `);
    const insertSchedule = this.database.prepare(`
      INSERT INTO doctor_schedules (doctor_id, clinic_id, weekday, slot_time, is_active)
      VALUES (?, ?, ?, ?, 1)
    `);

    const clinicName = `${location} Health Clinic`;
    const clinicResult = insertClinic.run(doctorId, clinicName, location);
    const clinicId = Number(clinicResult.lastInsertRowid);

    for (const weekday of [1, 3, 5]) {
      for (const slotTime of ['10:00', '10:30', '11:00']) {
        insertSchedule.run(doctorId, clinicId, weekday, slotTime);
      }
    }
  }

  private hashPasswordForSeed(password: string) {
    const salt = 'demo-seed-salt';
    const derivedKey = scryptSync(password, salt, 64);

    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
  }
}

const initialDoctors = [
  {
    name: 'Dr. Richard James',
    specialty: 'General physician',
    location: 'Dhaka',
    gender: 'male',
    isAvailable: true,
    isVerified: true,
    isActive: true,
    imageUrl: '/images/doctors/doc1.png',
  },
  {
    name: 'Dr. Emily Larson',
    specialty: 'Gynecologist',
    location: 'Dhaka',
    gender: 'female',
    isAvailable: true,
    isVerified: true,
    isActive: true,
    imageUrl: '/images/doctors/doc2.png',
  },
  {
    name: 'Dr. Sarah Patel',
    specialty: 'Dermatologist',
    location: 'Chattogram',
    gender: 'female',
    isAvailable: true,
    isVerified: true,
    isActive: true,
    imageUrl: '/images/doctors/doc3.png',
  },
  {
    name: 'Dr. Christopher Lee',
    specialty: 'Pediatricians',
    location: 'Sylhet',
    gender: 'male',
    isAvailable: true,
    isVerified: true,
    isActive: true,
    imageUrl: '/images/doctors/doc4.png',
  },
  {
    name: 'Dr. Jennifer Garcia',
    specialty: 'Neurologist',
    location: 'Dhaka',
    gender: 'female',
    isAvailable: true,
    isVerified: true,
    isActive: true,
    imageUrl: '/images/doctors/doc5.png',
  },
  {
    name: 'Dr. Andrew Williams',
    specialty: 'Gastroenterologist',
    location: 'Rajshahi',
    gender: 'male',
    isAvailable: true,
    isVerified: true,
    isActive: true,
    imageUrl: '/images/doctors/doc6.png',
  },
  {
    name: 'Dr. Christopher Davis',
    specialty: 'General physician',
    location: 'Khulna',
    gender: 'male',
    isAvailable: true,
    isVerified: true,
    isActive: true,
    imageUrl: '/images/doctors/doc7.png',
  },
  {
    name: 'Dr. Timothy White',
    specialty: 'Gynecologist',
    location: 'Barishal',
    gender: 'male',
    isAvailable: true,
    isVerified: true,
    isActive: true,
    imageUrl: '/images/doctors/doc8.png',
  },
  {
    name: 'Dr. Ava Mitchell',
    specialty: 'Dermatologist',
    location: 'Dhaka',
    gender: 'female',
    isAvailable: true,
    isVerified: true,
    isActive: true,
    imageUrl: '/images/doctors/doc9.png',
  },
  {
    name: 'Dr. Jeffrey King',
    specialty: 'Pediatricians',
    location: 'Rangpur',
    gender: 'male',
    isAvailable: true,
    isVerified: true,
    isActive: true,
    imageUrl: '/images/doctors/doc10.png',
  },
  {
    name: 'Dr. Zoe Kelly',
    specialty: 'Neurologist',
    location: 'Chattogram',
    gender: 'female',
    isAvailable: true,
    isVerified: true,
    isActive: true,
    imageUrl: '/images/doctors/doc11.png',
  },
  {
    name: 'Dr. Patrick Harris',
    specialty: 'Gastroenterologist',
    location: 'Dhaka',
    gender: 'male',
    isAvailable: true,
    isVerified: true,
    isActive: true,
    imageUrl: '/images/doctors/doc12.png',
  },
  {
    name: 'Dr. Chloe Evans',
    specialty: 'General physician',
    location: 'Sylhet',
    gender: 'female',
    isAvailable: true,
    isVerified: true,
    isActive: true,
    imageUrl: '/images/doctors/doc13.png',
  },
  {
    name: 'Dr. Ryan Martinez',
    specialty: 'Gynecologist',
    location: 'Dhaka',
    gender: 'male',
    isAvailable: false,
    isVerified: true,
    isActive: true,
    imageUrl: '/images/doctors/doc14.png',
  },
  {
    name: 'Dr. Amelia Hill',
    specialty: 'Dermatologist',
    location: 'Khulna',
    gender: 'female',
    isAvailable: true,
    isVerified: true,
    isActive: true,
    imageUrl: '/images/doctors/doc15.png',
  },
];
