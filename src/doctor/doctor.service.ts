import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SearchDoctorsDto } from './dto/search-doctors.dto';

@Injectable()
export class DoctorService {
  constructor(private readonly databaseService: DatabaseService) {}

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

  private toDoctorResult(row: DoctorRow) {
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
}

type DoctorRow = {
  id: number;
  name: string;
  specialty: string;
  location: string;
  gender: string;
  isAvailable: number;
  imageUrl: string;
};
