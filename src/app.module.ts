import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AppointmentModule } from './appointment/appointment.module';
import { DatabaseModule } from './database/database.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';

@Module({
  imports: [
    DatabaseModule,
    AdminModule,
    AppointmentModule,
    DoctorModule,
    PatientModule,
  ],
})
export class AppModule {}
