import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { AttendanceDto } from './dto/attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance } from './entities/attendance.entity';
import { Office } from 'src/modules/offices/entities/office.entity';
import { isWithinDistance } from 'src/utils/haversine.util';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Employee } from 'src/modules/employees/entities/employee.entity';

@Injectable()
export class AttendancesService {
  constructor(private readonly entityManager: EntityManager) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    const { userId, officeId, latitude, longitude } = createAttendanceDto;
    const employee = await this.entityManager.findOne(Employee, {
      where: { id: Number(userId) },
      relations: ['user'],
    });
    if (!employee) throw new NotFoundException('Employee not found');
    const office = await this.entityManager.findOne(Office, {
      where: { id: Number(officeId) },
    });
    if (!office) throw new NotFoundException('Office not found');

    if (
      office.latitude == null ||
      office.longitude == null ||
      !isWithinDistance(latitude, longitude, office.latitude, office.longitude)
    ) {
      throw new BadRequestException(
        'You are not within the allowed range to mark attendance.',
      );
    }

    const attendance = this.entityManager.create(Attendance, {
      user: employee.user,
      office,
      checkinLatitude: latitude,
      checkinLongitude: longitude,
      checkinTime: new Date(),
    });
    console.log('Created attendance entity:', attendance);
    const saved = await this.entityManager.save(attendance);
    // Map to AttendanceDto
    const dto: AttendanceDto = {
      id: saved.id, // Attendance entity uses string for id
      user: saved.user
        ? {
            id: saved.user.id,
            name: saved.user.name,
            email: saved.user.email,
            userRole: saved.user.userRole,
          }
        : {},
      office: saved.office
        ? {
            id: saved.office.id,
            name: saved.office.name,
            latitude: saved.office.latitude,
            longitude: saved.office.longitude,
          }
        : {},
      checkinLatitude: saved.checkinLatitude,
      checkinLongitude: saved.checkinLongitude,
      checkinTime: saved.checkinTime,
    };

    console.log('Created attendance dto:', dto);
    return dto;
  }

  async findAll() {
    return this.entityManager.find(Attendance);
  }

  async findOne(id: string) {
    return this.entityManager.findOne(Attendance, { where: { id: +id } });
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    const attendance = await this.findOne(id);
    if (!attendance) throw new NotFoundException('Attendance not found');
    Object.assign(attendance, updateAttendanceDto);
    return this.entityManager.save(attendance);
  }

  async remove(id: string) {
    return this.entityManager.delete(Attendance, id);
  }

  async findAllByOffice(officeId: string) {
    const officeIdNum = Number(officeId);
    const attendances = await this.entityManager.find(Attendance, {
      where: { office: { id: officeIdNum } },
      relations: ['user', 'office'],
    });
    return attendances.map(saved => ({
      id: saved.id,
      user: saved.user
        ? {
            id: saved.user.id,
            name: saved.user.name,
            email: saved.user.email,
            userRole: saved.user.userRole,
          }
        : {},
      office: saved.office
        ? {
            id: saved.office.id,
            name: saved.office.name,
            latitude: saved.office.latitude,
            longitude: saved.office.longitude,
          }
        : {},
      checkinLatitude: saved.checkinLatitude,
      checkinLongitude: saved.checkinLongitude,
      checkinTime: saved.checkinTime,
    }));
  }

  async createForOffice(
    officeId: string,
    createAttendanceDto: CreateAttendanceDto,
  ) {
    const officeIdNum = Number(officeId);
    const office = await this.entityManager.findOne(Office, {
      where: { id: officeIdNum },
    });
    if (!office) throw new NotFoundException('Office not found');
    const attendance = this.entityManager.create(Attendance, {
      ...createAttendanceDto,
      office,
    });
    return this.entityManager.save(attendance);
  }

  async findOneByOffice(officeId: string, id: string) {
    const officeIdNum = Number(officeId);
    return this.entityManager.findOne(Attendance, {
      where: { id: +id, office: { id: officeIdNum } },
      relations: ['user', 'office'],
    });
  }

  async updateForOffice(
    officeId: string,
    id: string,
    updateAttendanceDto: QueryDeepPartialEntity<Attendance>,
  ) {
    const officeIdNum = Number(officeId);
    const attendance = await this.entityManager.findOne(Attendance, {
      where: { id: +id, office: { id: officeIdNum } },
    });
    if (!attendance) throw new NotFoundException('Attendance not found');
    await this.entityManager.update(Attendance, id, updateAttendanceDto);
    return this.findOneByOffice(officeId, id);
  }

  async removeForOffice(officeId: string, id: string) {
    const officeIdNum = Number(officeId);
    const attendance = await this.entityManager.findOne(Attendance, {
      where: { id: +id, office: { id: officeIdNum } },
    });
    if (!attendance) throw new NotFoundException('Attendance not found');
    await this.entityManager.delete(Attendance, id);
    return {
      message: `Attendance with id ${id} removed from office ${officeId}`,
    };
  }
}
