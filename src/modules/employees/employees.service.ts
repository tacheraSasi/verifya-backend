import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EntityManager, Equal } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { User, UserRole } from 'src/modules/users/entities/user.entity';
import { Office } from 'src/modules/offices/entities/office.entity';
import * as crypto from 'crypto';
import { Employee } from './entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const { name, email, officeId } = createEmployeeDto;
    // Check if office exists
    const office = await this.entityManager.findOneBy(Office, {
      id: officeId as any,
    });
    if (!office) throw new NotFoundException('Office not found');
    // Check if email is already in use
    const existingUser = await this.entityManager.findOneBy(User, {
      email: Equal(email),
    });
    if (existingUser) throw new BadRequestException('Email already in use');
    // Create verification token
    const verificationToken = this.getVerifcationToken();
    // Create user with no password yet
    const user = this.entityManager.create(User, {
      name,
      email,
      userRole: UserRole.EMPLOYEE,
      office,
      isEmailVerified: false,
      verificationToken,
    });
    await this.entityManager.save(user);
    // Create Employee entity
    const employee = this.entityManager.create(Employee, {
      user,
      office,
    });
    await this.entityManager.save(employee);
    // TODO:Mock sending email
    // TODO:integrate with an email service
    const verificationLink = `https://ekilie.com/verify?token=${verificationToken}`;
    await this.notificationsService.sendEmail({
      to: email,
      subject: 'Verify your account',
      message: `Click here to verify your account: ${verificationLink}`,
    });
    return {
      message: 'Employee invited. Verification email sent.',
      verificationLink,
    };
  }

  findAll() {
    return this.entityManager.find(User, {
      where: { userRole: UserRole.EMPLOYEE },
    });
  }

  async findAllByOffice(officeId: string) {
    const officeIdNum = Number(officeId);
    return this.entityManager.find(Employee, {
      where: { office: { id: officeIdNum } },
      relations: ['user', 'office'],
    });
  }

  async createForOffice(
    officeId: string,
    createEmployeeDto: CreateEmployeeDto,
  ) {
    const officeIdNum = Number(officeId);
    const office = await this.entityManager.findOne(Office, {
      where: { id: officeIdNum },
    });
    if (!office) throw new NotFoundException('Office not found');
    const user = this.entityManager.create(User, {
      ...createEmployeeDto,
      office,
      userRole: UserRole.EMPLOYEE,
    });
    await this.entityManager.save(user);
    const employee = this.entityManager.create(Employee, { user, office });
    return this.entityManager.save(employee);
  }

  async findOneByOffice(officeId: string, id: string) {
    const officeIdNum = Number(officeId);
    return this.entityManager.findOne(Employee, {
      where: { id, office: { id: officeIdNum } },
      relations: ['user', 'office'],
    });
  }

  async updateForOffice(
    officeId: string,
    id: string,
    updateEmployeeDto: QueryDeepPartialEntity<Employee>,
  ) {
    const officeIdNum = Number(officeId);
    const employee = await this.entityManager.findOne(Employee, {
      where: { id, office: { id: officeIdNum } },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    await this.entityManager.update(Employee, id, updateEmployeeDto);
    return this.findOneByOffice(officeId, id);
  }

  async removeForOffice(officeId: string, id: string) {
    const officeIdNum = Number(officeId);
    const employee = await this.entityManager.findOne(Employee, {
      where: { id, office: { id: officeIdNum } },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    await this.entityManager.delete(Employee, id);
    return {
      message: `Employee with id ${id} removed from office ${officeId}`,
    };
  }

  async findOne(id: string) {
    return this.entityManager.findOne(User, {
      where: { id, userRole: UserRole.EMPLOYEE },
    });
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    return this.entityManager.update(User, id, updateEmployeeDto);
  }

  async remove(id: string) {
    return this.entityManager.delete(User, id);
  }

  async verifyEmployee(token: string, password: string) {
    // Find user by verification token
    const user = await this.entityManager.findOne(User, {
      where: { verificationToken: token, userRole: UserRole.EMPLOYEE },
    });
    if (!user)
      throw new NotFoundException('Invalid or expired verification token');
    // Set password and mark as verified
    user.password = password;
    user.isEmailVerified = true;
    user.verificationToken = '';
    await this.entityManager.save(user);
    return { message: 'Account verified. You can now log in.' };
  }

  private getVerifcationToken(): string {
    return String(crypto.randomBytes(32).toString('hex'));
  }
}
