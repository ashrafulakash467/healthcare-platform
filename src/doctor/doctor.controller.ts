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
import { LoginDoctorDto } from './dto/login-doctor.dto';
import { SearchDoctorsDto } from './dto/search-doctors.dto';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { DoctorService } from './doctor.service';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDoctorDto: RegisterDoctorDto) {
    return this.doctorService.register(registerDoctorDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDoctorDto: LoginDoctorDto) {
    return this.doctorService.login(loginDoctorDto);
  }

  @Get('me')
  me(@Headers('authorization') authorizationHeader?: string) {
    return this.doctorService.getAuthenticatedDoctor(authorizationHeader);
  }

  @Get('dashboard')
  dashboard(
    @Headers('authorization') authorizationHeader?: string,
    @Query('doctorId') doctorId?: string,
  ) {
    return this.doctorService.getDashboard(authorizationHeader, doctorId);
  }

  @Get('search')
  search(@Query() query: SearchDoctorsDto) {
    return this.doctorService.search(query);
  }
}
