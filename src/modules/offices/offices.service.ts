import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { EntityManager } from 'typeorm';
import { Office } from './entities/office.entity';
import { UsersService } from '../users/users.service';
import { Employee } from 'src/modules/employees/entities/employee.entity';

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

    // Count employees in the office
    const employeesCount = await this.entityManager.count(Employee, {
      where: { office: { id: +officeId } },
    });

    // const checkedInCount = await this.entityManager.count(Employee, {
    //   where: { office: { id: +officeId }, checkedIn: true },
    // });

    return { employees: employeesCount, checkedIn: 1, lateCheckedIn: 0 };
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

  async update(id: string, updateOfficeDto: UpdateOfficeDto): Promise<Office> {
    const office = await this.findOne(id);

    // Update office properties
    if (updateOfficeDto.name) office.name = updateOfficeDto.name;
    if (updateOfficeDto.latitude) office.latitude = updateOfficeDto.latitude;
    if (updateOfficeDto.longitude) office.longitude = updateOfficeDto.longitude;

    return this.entityManager.save(office);
  }

  async remove(id: string): Promise<void> {
    const office = await this.findOne(id);
    await this.entityManager.remove(office);
  }
}
