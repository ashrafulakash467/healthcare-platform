import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { AppointmentService } from './appointment.service';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get('booking-options')
  getBookingOptions(@Query('doctorId') doctorId?: string) {
    return this.appointmentService.getBookingOptions(doctorId);
  }

  @Get('available-dates')
  getAvailableDates(
    @Query('doctorId') doctorId?: string,
    @Query('clinicId') clinicId?: string,
  ) {
    return this.appointmentService.getAvailableDates(doctorId, clinicId);
  }

  @Get('available-slots')
  getAvailableSlots(
    @Query('doctorId') doctorId?: string,
    @Query('clinicId') clinicId?: string,
    @Query('date') date?: string,
  ) {
    return this.appointmentService.getAvailableSlots(doctorId, clinicId, date);
  }

  @Get('my')
  getMyAppointments(@Headers('authorization') authorizationHeader?: string) {
    return this.appointmentService.getMyAppointments(authorizationHeader);
  }

  @Get('reschedule-options')
  getRescheduleOptions(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Query('appointmentId') appointmentId?: string,
  ) {
    return this.appointmentService.getRescheduleOptions(
      authorizationHeader,
      appointmentId,
    );
  }

  @Get('reschedule-slots')
  getRescheduleSlots(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Query('appointmentId') appointmentId?: string,
    @Query('date') date?: string,
  ) {
    return this.appointmentService.getRescheduleSlots(
      authorizationHeader,
      appointmentId,
      date,
    );
  }

  @Post('book')
  @HttpCode(HttpStatus.CREATED)
  book(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentService.book(authorizationHeader, createAppointmentDto);
  }

  @Post('reschedule')
  @HttpCode(HttpStatus.OK)
  reschedule(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Body() rescheduleAppointmentDto: RescheduleAppointmentDto,
  ) {
    return this.appointmentService.reschedule(
      authorizationHeader,
      rescheduleAppointmentDto,
    );
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  cancel(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Body() cancelAppointmentDto: CancelAppointmentDto,
  ) {
    return this.appointmentService.cancel(authorizationHeader, cancelAppointmentDto);
  }
}
