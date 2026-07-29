import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginAdminDto } from './dto/login-admin.dto';
import { ReviewDoctorVerificationDto } from './dto/review-doctor-verification.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginAdminDto: LoginAdminDto) {
    return this.adminService.login(loginAdminDto);
  }

  @Get('me')
  me(@Headers('authorization') authorizationHeader?: string) {
    return this.adminService.getAuthenticatedAdmin(authorizationHeader);
  }

  @Get('doctor-verifications')
  getDoctorVerificationQueue(@Headers('authorization') authorizationHeader?: string) {
    return this.adminService.getDoctorVerificationQueue(authorizationHeader);
  }

  @Patch('doctor-verifications/:id/decision')
  @HttpCode(HttpStatus.OK)
  reviewDoctorVerification(
    @Param('id') id: string,
    @Body() reviewDoctorVerificationDto: ReviewDoctorVerificationDto,
    @Headers('authorization') authorizationHeader?: string,
  ) {
    return this.adminService.reviewDoctorVerification(
      id,
      reviewDoctorVerificationDto,
      authorizationHeader,
    );
  }
}
