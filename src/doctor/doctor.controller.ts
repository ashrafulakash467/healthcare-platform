import { Controller, Get, Query } from '@nestjs/common';
import { SearchDoctorsDto } from './dto/search-doctors.dto';
import { DoctorService } from './doctor.service';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get('search')
  search(@Query() query: SearchDoctorsDto) {
    return this.doctorService.search(query);
  }
}
