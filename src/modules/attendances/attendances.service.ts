import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance } from './entities/attendance.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Office } from 'src/modules/offices/entities/office.entity';
import { isWithinDistance } from 'src/utils/haversine.util';

@Injectable()
export class AttendancesService {
  constructor(private readonly entityManager: EntityManager) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    const { userId, officeId, latitude, longitude } = createAttendanceDto;
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    const office = await this.entityManager.findOne(Office, {
      where: { id: officeId },
    });
    if (!office) throw new NotFoundException('Office not found');

    if (
      !isWithinDistance(latitude, longitude, office.latitude, office.longitude)
    ) {
      throw new BadRequestException(
        'You are not within the allowed range to mark attendance.',
      );
    }

    const attendance = this.entityManager.create(Attendance, {
      user,
      office,
      checkinLatitude: latitude,
      checkinLongitude: longitude,
      checkinTime: new Date(),
    });
    return this.entityManager.save(attendance);
  }

  async findAll() {
    return this.entityManager.find(Attendance);
  }

  async findOne(id: string) {
    return this.entityManager.findOne(Attendance, { where: { id } });
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
}
