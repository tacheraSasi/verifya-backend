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

    // Calculate distance (Haversine formula)
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(latitude - Number(office.latitude));
    const dLon = toRad(longitude - Number(office.longitude));
    const lat1 = toRad(Number(office.latitude));
    const lat2 = toRad(latitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    if (distance > 100) {
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
