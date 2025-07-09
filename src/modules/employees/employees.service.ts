import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EntityManager, Equal } from 'typeorm';
import { User, UserRole } from 'src/modules/users/entities/user.entity';
import { Office } from 'src/modules/offices/entities/office.entity';
import * as crypto from 'crypto';

@Injectable()
export class EmployeesService {
  constructor(private readonly entityManager: EntityManager) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const { name, email, officeId } = createEmployeeDto;
    // Check if office exists
    const office = await this.entityManager.findOneBy(Office, { id: Equal(officeId) });
    if (!office) throw new NotFoundException('Office not found');
    // Check if email is already in use
    const existingUser = await this.entityManager.findOneBy(User, { email: Equal(email) });
    if (existingUser) throw new BadRequestException('Email already in use');
    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
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
    // Mock sending email
    // In production, integrate with an email service
    const verificationLink = `https://your-app.com/verify?token=${verificationToken}`;
    // sendEmail(email, 'Verify your account', `Click here: ${verificationLink}`)
    return { message: 'Employee invited. Verification email sent.', verificationLink };
  }

  findAll() {
    return this.entityManager.find(User, { where: { userRole: UserRole.EMPLOYEE } });
  }

  async findOne(id: number) {
    return this.entityManager.findOne(User, { where: { id, userRole: UserRole.EMPLOYEE } });
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    return this.entityManager.update(User, id, updateEmployeeDto);
  }

  async remove(id: number) {
    return this.entityManager.delete(User, id);
  }
}
