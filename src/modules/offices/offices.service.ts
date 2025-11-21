import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { EntityManager } from 'typeorm';
import { Office } from './entities/office.entity';
import { UsersService } from '../users/users.service';
import { Employee } from 'src/modules/employees/entities/employee.entity';
import { Attendance } from '../attendances/entities/attendance.entity';
import { ExcludeFromObject } from 'src/common/dto/sanitize-response.dto';

@Injectable()
export class OfficesService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly usersService: UsersService,
  ) {}

  async create(createOfficeDto: CreateOfficeDto): Promise<Office> {
    // Create the office
    const office = this.entityManager.create(Office, {
      name: createOfficeDto.name,
      latitude: createOfficeDto.latitude ?? null,
      longitude: createOfficeDto.longitude ?? null,
      phoneNumber: createOfficeDto.phoneNumber,
    });

    // Save the office to get an ID
    const savedOffice = await this.entityManager.save(office);

    // Create an admin user for the office using provided name, email, and password
    const adminEmail =
      createOfficeDto.adminEmail ||
      `admin_${createOfficeDto.name.toLowerCase().replace(/\s+/g, '_')}@ekilie.com`;
    const adminName = createOfficeDto.adminName;
    const adminPassword = createOfficeDto.adminPassword;
    const adminUser = await this.usersService.createAdminForOffice(
      savedOffice,
      adminEmail,
      adminName ?? `${createOfficeDto.name} Admin`,
      adminPassword,
      createOfficeDto.phoneNumber,
    );

    // Update the office with the admin user
    savedOffice.admin = adminUser.user;
    await this.entityManager.save(savedOffice);

    return savedOffice;
  }

  async findAll(): Promise<Office[]> {
    return this.entityManager.find(Office);
  }
  async count(officeId: string): Promise<any> {
    const office = await this.entityManager.findOneBy(Office, {
      id: officeId as any,
    });
    if (!office) {
      throw new NotFoundException(`Office with ID ${officeId} not found`);
    }

    // Count total employees in the office
    const employeesCount = await this.entityManager.count(Employee, {
      where: { office: { id: +officeId } },
    });

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    // Count unique employees who checked in today
    const checkedInCount = await this.entityManager
      .createQueryBuilder(Attendance, 'a')
      .where('a.office.id = :officeId', { officeId: +officeId })
      .andWhere('a.checkinTime >= :startOfDay', { startOfDay })
      .andWhere('a.checkinTime < :endOfDay', { endOfDay })
      .select('COUNT(DISTINCT a.user.id)', 'count')
      .getRawOne();

    // Count late check-ins (assuming late is after 9:00 AM)
    const lateTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      9,
      0,
      0,
    );
    const lateCheckedInCount = await this.entityManager
      .createQueryBuilder(Attendance, 'a')
      .where('a.office.id = :officeId', { officeId: +officeId })
      .andWhere('a.checkinTime >= :lateTime', { lateTime })
      .andWhere('a.checkinTime < :endOfDay', { endOfDay })
      .select('COUNT(DISTINCT a.user.id)', 'count')
      .getRawOne();

    return {
      employees: employeesCount,
      checkedIn: parseInt(checkedInCount?.count || '0'),
      lateCheckedIn: parseInt(lateCheckedInCount?.count || '0'),
    };
  }

  async findOne(id: string): Promise<Office> {
    const office = await this.entityManager.findOneBy(Office, {
      id: id as any,
    });
    if (!office) {
      throw new NotFoundException(`Office with ID ${id} not found`);
    }
    return office;
  }
  async updateLocation(
    id: string,
    latitude: number,
    longitude: number,
  ): Promise<Partial<Office>> {
    const office = await this.findOne(id);
    office.latitude = latitude;
    office.longitude = longitude;
    await this.entityManager.save(office);
    const updatedOffice = await this.findOne(id);
    return ExcludeFromObject(updatedOffice, ['admin']);
  }

  async update(id: string, updateOfficeDto: UpdateOfficeDto): Promise<Office> {
    const office = await this.findOne(id);

    if (updateOfficeDto.name) office.name = updateOfficeDto.name;
    if (updateOfficeDto.latitude !== undefined)
      office.latitude = updateOfficeDto.latitude;
    if (updateOfficeDto.longitude !== undefined)
      office.longitude = updateOfficeDto.longitude;

    await this.entityManager.save(office);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const office = await this.findOne(id);
    await this.entityManager.remove(office);
  }
}
