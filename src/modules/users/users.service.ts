import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { EntityManager, Equal } from 'typeorm';
import { LoggerService } from 'src/lib/logger/logger.service';
import { User, UserRole } from 'src/modules/users/entities/user.entity';
import { Office } from 'src/entities/office.entity';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly logger: LoggerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { officeId, ...userData } = createUserDto;

    // Check if office exists
    const office = await this.entityManager.findOneBy(Office, { id: Equal(officeId) });
    if (!office) {
      throw new NotFoundException(`Office with ID ${officeId} not found`);
    }

    // Check if email is already in use
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new BadRequestException(`Email ${userData.email} is already in use`);
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = this.entityManager.create(User, {
      ...userData,
      office,
      verificationToken,
    });

    return this.entityManager.save(user);
  }

  async createAdminForOffice(office: Office, email: string): Promise<User> {
    // Generate a temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');

    // Create admin user
    const adminUser = this.entityManager.create(User, {
      name: `Admin ${office.name}`,
      email,
      password: tempPassword,
      userRole: UserRole.ADMIN,
      office,
      verificationToken: crypto.randomBytes(32).toString('hex'),
    });

    const savedUser = await this.entityManager.save(adminUser);

    // Return the user with the plain text password for email notification
    return { ...savedUser, plainPassword: tempPassword };
  }

  async findAll() {
    return await this.entityManager.find(User);
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return await this.entityManager.findOneBy(User, { email: Equal(email) });
  }

  async findById(id: number) {
    return await this.entityManager.findOneBy(User, { id: Equal(id) });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
