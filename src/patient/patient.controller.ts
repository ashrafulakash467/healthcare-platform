import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { LoginPatientDto } from './dto/login-patient.dto';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PatientService } from './patient.service';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerPatientDto: RegisterPatientDto) {
    return this.patientService.register(registerPatientDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginPatientDto: LoginPatientDto) {
    return this.patientService.login(loginPatientDto);
  }

  @Get('me')
  me(@Headers('authorization') authorizationHeader?: string) {
    return this.patientService.getAuthenticatedPatient(authorizationHeader);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    return this.patientService.requestPasswordReset(requestPasswordResetDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.patientService.resetPassword(resetPasswordDto);
  }
}
