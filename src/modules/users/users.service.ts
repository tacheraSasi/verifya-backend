import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { EntityManager, Equal } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { LoggerService } from 'src/lib/logger/logger.service';
import { User, UserRole } from 'src/modules/users/entities/user.entity';
import { Office } from 'src/modules/offices/entities/office.entity';
import * as crypto from 'crypto';
import { Role } from 'src/modules/roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly logger: LoggerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { officeId, roleId, ...userData } = createUserDto;

    // Check if office exists
    const office = await this.entityManager.findOneBy(Office, {
      id: officeId as any,
    });
    if (!office) {
      throw new NotFoundException(`Office with ID ${officeId} not found`);
    }

    // Check if email is already in use
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new BadRequestException(
        `Email ${userData.email} is already in use`,
      );
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Assign role if provided
    let role = undefined;
    if (roleId) {
      const roleIdNum = Number(roleId);
      if (isNaN(roleIdNum)) {
        throw new NotFoundException(`Role ID must be a number`);
      }
      role = await this.entityManager.findOneBy(Role, { id: roleIdNum });
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }
    }

    // Create user
    const user = this.entityManager.create(User, {
      ...userData,
      office,
      verificationToken,
      ...(role ? { role } : {}),
    });

    return this.entityManager.save(user);
  }

  async createAdminForOffice(
    office: Office,
    email: string,
    name: string,
    password: string,
    phoneNumber: string,
  ): Promise<{ user: User; tempPassword: string }> {
    // Use provided password
    const tempPassword = password;

    // Create admin user
    const adminUser = this.entityManager.create(User, {
      name,
      email,
      password: tempPassword,
      userRole: UserRole.ADMIN,
      office,
      phoneNumber,
      verificationToken: crypto.randomBytes(32).toString('hex'),
    });

    const savedUser = await this.entityManager.save(adminUser);

    // Return the user and the plain text password for email notification
    return { user: savedUser, tempPassword };
  }

  async findAll() {
    return await this.entityManager.find(User);
  }

  async findAllByOffice(officeId: string) {
    const officeIdNum = Number(officeId);
    return this.entityManager.find(User, {
      where: { office: { id: officeIdNum } },
      relations: ['office', 'role'],
    });
  }

  async createForOffice(officeId: string, createUserDto: CreateUserDto) {
    const officeIdNum = Number(officeId);
    const office = await this.entityManager.findOne(Office, {
      where: { id: officeIdNum },
    });
    if (!office) throw new NotFoundException('Office not found');
    const user = this.entityManager.create(User, {
      ...createUserDto,
      office,
    });
    return this.entityManager.save(user);
  }

  async findOneByOffice(officeId: string, id: string) {
    const officeIdNum = Number(officeId);
    return this.entityManager.findOne(User, {
      where: { id, office: { id: officeIdNum } },
      relations: ['office', 'role'],
    });
  }

  async updateForOffice(
    officeId: string,
    id: string,
    updateUserDto: QueryDeepPartialEntity<User>,
  ) {
    const officeIdNum = Number(officeId);
    const user = await this.entityManager.findOne(User, {
      where: { id, office: { id: officeIdNum } },
    });
    if (!user) throw new NotFoundException('User not found');
    await this.entityManager.update(User, id, updateUserDto);
    return this.findOneByOffice(officeId, id);
  }

  async removeForOffice(officeId: string, id: string) {
    const officeIdNum = Number(officeId);
    const user = await this.entityManager.findOne(User, {
      where: { id, office: { id: officeIdNum } },
    });
    if (!user) throw new NotFoundException('User not found');
    await this.entityManager.delete(User, id);
    return {
      message: `User with id ${id} removed from office ${officeId}`,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return await this.entityManager.findOne(User, {
      where: { email: Equal(email) },
      relations: ['office', 'role'],
    });
  }

  async findById(id: string) {
    return await this.entityManager.findOne(User, {
      where: { id },
      relations: ['office', 'role'],
    });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.entityManager.findOne(User, {
      where: { verificationToken: token },
      relations: ['office', 'role'],
    });
  }

  async save(user: User): Promise<User> {
    return this.entityManager.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.entityManager.update(User, id, updateUserDto);
    return this.findById(id);
  }

  async remove(id: string) {
    await this.entityManager.delete(User, id);
    return { message: `User with id ${id} removed` };
  }
}
