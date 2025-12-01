import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EntityManager, Equal } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { User, UserRole } from 'src/modules/users/entities/user.entity';
import { Office } from 'src/modules/offices/entities/office.entity';
import * as crypto from 'crypto';
import { Employee } from './entities/employee.entity';
import { Otp } from 'src/modules/auth/entities/otp.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { JwtService } from '@nestjs/jwt';
import OTPX from 'otpx';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
  ) {}

  private logger = new Logger(EmployeesService.name);
  async inviteEmployee(createEmployeeDto: CreateEmployeeDto) {
    const { name, email, officeId, phoneNumber } = createEmployeeDto;
    // Check if office exists
    const office = await this.entityManager.findOneBy(Office, {
      id: Equal(typeof officeId === 'string' ? Number(officeId) : officeId),
    });
    if (!office) throw new NotFoundException('Office not found');
    // Check if email is already in use
    const existingUser = await this.entityManager.findOneBy(User, {
      email: Equal(email), //TODO:Fix this logic here what if user exists in more than one office
    });
    if (existingUser) throw new BadRequestException('Email already in use');
    // Generate OTP
    const otpCode = this.generateOtp();
    const otpExpires = new Date(Date.now() + 1000 * 60 * 10); // 10 min
    // Create user (not verified)
    const user = this.entityManager.create(User, {
      name,
      email,
      userRole: UserRole.EMPLOYEE,
      office,
      isVerified: false,
      phoneNumber,
    });
    await this.entityManager.save(user);
    // Create employee
    const employee = this.entityManager.create(Employee, {
      user,
      office,
      phoneNumber,
    });
    await this.entityManager.save(employee);
    // Save OTP entity
    const otpEntity = this.entityManager.create(Otp, {
      code: otpCode,
      expiresAt: otpExpires,
      user,
      userId: user.id,
    });
    this.logger.log(`Saving OTP entity: ${JSON.stringify(otpEntity)}`);
    console.log('Saving OTP entity:', otpEntity);
    await this.entityManager.save(otpEntity);
    // Send email and SMS
    const message = `Hi ${name},\n\nYou have been invited to join ${office.name} on ekiliSync!\n\nYour OTP is: ${otpCode}\n\nThis OTP is valid for 10 minutes.\n\nWelcome aboard!`;
    await this.notificationsService.sendEmail({
      to: email,
      subject: 'You are invited to ekiliSync',
      message,
    });
    await this.notificationsService.sendSMS({
      phoneNumber,
      message: `Welcome to ekiliSync! You've been invited to join ${office.name}. Your verification code is ${otpCode}. This code expires in 10 minutes. Please enter it to complete your registration.`,
    });
    return { message: 'Invitation sent via email and SMS.' };
  }

  async reInviteEmployee(id: string) {
    const employee = await this.entityManager.findOne(Employee, {
      where: { id: Number(id) },
      relations: ['user', 'office'],
    });
    if (!employee) throw new NotFoundException('Employee not found');
    const user = employee.user;
    const office = employee.office;
    if (user.isVerified) {
      throw new BadRequestException('Employee is already verified');
    }

    const otpCode = this.generateOtp();
    const otpExpires = new Date(Date.now() + 1000 * 60 * 10); // 10 min
    const otpEntity = this.entityManager.create(Otp, {
      code: otpCode,
      expiresAt: otpExpires,
      user,
      userId: user.id,
    });

    this.logger.log(`Saving OTP entity: ${JSON.stringify(otpEntity)}`);
    console.log('Saving OTP entity:', otpEntity);
    await this.entityManager.save(otpEntity);
    // Send email and SMS
    const message = `Hi ${user.name},\n\nYou have been re-invited to join ${office.name} on ekiliSync!\n\nYour new OTP is: ${otpCode}\n\nThis OTP is valid for 10 minutes.\n\nWelcome back!`;
    await this.notificationsService.sendEmail({
      to: user.email,
      subject: 'You are re-invited to ekiliSync',
      message,
    });
    if (user.phoneNumber) {
      await this.notificationsService.sendSMS({
        phoneNumber: user.phoneNumber,
        message: `Welcome back to ekiliSync! You've been re-invited to join ${office.name}. Your new verification code is ${otpCode}. This code expires in 10 minutes. Please enter it to complete your registration.`,
      });
    }
    return { message: 'Re-invitation sent via email and SMS.' };
  }

  async verifyOtp(email: string, otp: string) {
    // Find user by email
    const user = await this.entityManager.findOne(User, {
      where: { email },
      relations: ['office'],
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.isVerified) throw new BadRequestException('User already verified');

    // Find latest OTP for user
    const otpEntity = await this.entityManager.findOne(Otp, {
      where: { user: { id: user.id }, code: otp },
      order: { createdAt: 'DESC' },
    });
    if (!otpEntity) throw new BadRequestException('Invalid OTP');
    if (!otpEntity.expiresAt || otpEntity.expiresAt < new Date())
      throw new BadRequestException('OTP expired');
    // Mark as verified
    user.isVerified = true;
    this.logger.log(`User verified: ${JSON.stringify(user)}`);
    await this.entityManager.save(user);

    // Issue JWT
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.userRole,
    };
    const access_token = this.jwtService.sign(payload);
    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.userRole,
        office: user.office
          ? {
              id: user.office.id,
              name: user.office.name,
              latitude: user.office.latitude,
              longitude: user.office.longitude,
              createdAt: user.office.createdAt,
            }
          : null,
      },
    };
  }

  private generateOtp(): string {
    return OTPX.numeric(4);
  }

  async create(createEmployeeDto: CreateEmployeeDto) {
    const { name, email, officeId, phoneNumber } = createEmployeeDto;
    // Check if office exists
    const office = await this.entityManager.findOneBy(Office, {
      id: Equal(+officeId),
    });
    if (!office) throw new NotFoundException('Office not found');
    // Check if email is already in use
    const existingUser = await this.entityManager.findOneBy(User, {
      email: Equal(email),
    });
    if (existingUser) throw new BadRequestException('Email already in use');
    // Create user with password
    const user = this.entityManager.create(User, {
      name,
      email,
      userRole: UserRole.EMPLOYEE,
      office,
      isVerified: true,
      phoneNumber,
      password: this.generateRandomPassword(),
    });
    await this.entityManager.save(user);
    // Create Employee entity
    const employee = this.entityManager.create(Employee, {
      user,
      office,
      phoneNumber,
    });
    await this.entityManager.save(employee);
    // Send email and SMS with password
    const passwordMsg = `Hi ${name},\n\nYour account for ekiliSync has been created.\n\nThis is your password: ${user.password}\n\nYou can change it in the ekiliSync app.`;
    await this.notificationsService.sendEmail({
      to: email,
      subject: 'Your ekiliSync account password',
      message: passwordMsg,
    });
    await this.notificationsService.sendSMS({
      phoneNumber,
      message: `ekiliSync: Your password is ${user.password}. You can change it in the app.`,
    });
    return {
      message: 'Employee created and notified with password.',
    };
  }
  private generateRandomPassword(): string {
    return OTPX.alphanumeric(6);
  }

  async findAll() {
    const users = await this.entityManager.find(User, {
      where: { userRole: UserRole.EMPLOYEE },
      relations: ['office'],
    });

    // Transform entities to match frontend expectations
    return users.map(user => {
      // Split name into firstName and lastName
      const nameParts = user.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Map user role to frontend role enum
      const roleMapping = {
        admin: 'admin' as const,
        employee: 'manager' as const,
      };

      // Map verification status to frontend status
      const status = user.isVerified ? 'active' : 'invited';

      return {
        id: user.id,
        firstName,
        lastName,
        username: user.email.split('@')[0],
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        status: status as 'active' | 'inactive' | 'invited' | 'suspended',
        role: roleMapping[user.userRole] || ('manager' as const),
        createdAt: user.createdAt,
        updatedAt: user.createdAt, // Users don't have updatedAt, using createdAt
      };
    });
  }

  async findAllByOffice(officeId: string) {
    const officeIdNum = Number(officeId);
    const employees = await this.entityManager.find(Employee, {
      where: { office: { id: officeIdNum } },
      relations: ['user', 'office'],
    });

    // Transform entities to match frontend expectations
    return employees.map(employee => {
      // Split name into firstName and lastName
      const nameParts = employee.user.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Map user role to frontend role enum
      const roleMapping = {
        admin: 'admin' as const,
        employee: 'manager' as const, // Map employee to manager for frontend
      };

      // Map verification status to frontend status
      const status = employee.user.isVerified ? 'active' : 'invited';

      return {
        id: employee.id.toString(),
        firstName,
        lastName,
        username: employee.user.email.split('@')[0], // Generate username from email
        email: employee.user.email,
        phoneNumber: employee.user.phoneNumber || employee.phoneNumber || '',
        status: status as 'active' | 'inactive' | 'invited' | 'suspended',
        role: roleMapping[employee.user.userRole] || ('manager' as const),
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
      };
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
    const employee = await this.entityManager.findOne(Employee, {
      where: { id: +id, office: { id: officeIdNum } },
      relations: ['user', 'office'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Transform entity to plain object to avoid validation issues
    return {
      id: employee.id,
      phoneNumber: employee.phoneNumber,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      user: {
        id: employee.user.id,
        name: employee.user.name,
        email: employee.user.email,
        userRole: employee.user.userRole,
        phoneNumber: employee.user.phoneNumber,
        isVerified: employee.user.isVerified,
        createdAt: employee.user.createdAt,
      },
      office: {
        id: employee.office.id,
        name: employee.office.name,
        latitude: employee.office.latitude,
        longitude: employee.office.longitude,
        phoneNumber: employee.office.phoneNumber,
        createdAt: employee.office.createdAt,
      },
    };
  }

  async updateForOffice(
    officeId: string,
    id: string,
    updateEmployeeDto: QueryDeepPartialEntity<Employee>,
  ) {
    const officeIdNum = Number(officeId);
    const employee = await this.entityManager.findOne(Employee, {
      where: { id: Number(id), office: { id: officeIdNum } },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    await this.entityManager.update(Employee, id, updateEmployeeDto);
    return this.findOneByOffice(officeId, id);
  }

  async removeForOffice(officeId: string, id: string) {
    const officeIdNum = Number(officeId);
    const employee = await this.entityManager.findOne(Employee, {
      where: { id: Number(id), office: { id: officeIdNum } },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    await this.entityManager.delete(Employee, id);
    return {
      message: `Employee with id ${id} removed from office ${officeId}`,
    };
  }

  async findOne(id: string) {
    const user = await this.entityManager.findOne(User, {
      where: { id, userRole: UserRole.EMPLOYEE },
      relations: ['office'],
    });

    if (!user) {
      throw new NotFoundException('Employee not found');
    }

    // Transform entity to match frontend expectations
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const roleMapping = {
      admin: 'admin' as const,
      employee: 'manager' as const,
    };

    const status = user.isVerified ? 'active' : 'invited';

    return {
      id: user.id,
      firstName,
      lastName,
      username: user.email.split('@')[0],
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      status: status as 'active' | 'inactive' | 'invited' | 'suspended',
      role: roleMapping[user.userRole] || ('manager' as const),
      createdAt: user.createdAt,
      updatedAt: user.createdAt,
    };
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
    user.isVerified = true;
    user.verificationToken = '';
    await this.entityManager.save(user);
    return { message: 'Account verified. You can now log in.' };
  }

  private getVerifcationToken(): string {
    return String(crypto.randomBytes(32).toString('hex'));
  }
}
