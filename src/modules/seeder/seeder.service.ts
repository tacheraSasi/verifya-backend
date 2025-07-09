import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User, UserRole } from 'src/modules/users/entities/user.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Permission } from 'src/modules/roles/entities/permission.entity';
import { predefinedPermissions } from 'src/modules/seeder/data/permissions.data';
import { LoggerService } from 'src/lib/logger/logger.service';
import { Office } from 'src/modules/offices/entities/office.entity';

@Injectable()
export class SeederService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly logger: LoggerService,
  ) {}

  async seed() {
    // Create roles
    await this.#createRoles();
    // Create a sample office and admin
    await this.#createSampleOfficeWithAdmin();
    // Create a sample employee
    await this.#createSampleEmployee();
  }

  async #createRoles() {
    this.logger.log('Creating roles...');
    const predefinedRoles = [{ name: 'Admin' }, { name: 'Employee' }];
    for (const roleData of predefinedRoles) {
      const exists = await this.entityManager.findOneBy(Role, {
        name: roleData.name,
      });
      if (!exists) {
        const role = this.entityManager.create(Role, roleData);
        await this.entityManager.save(role);
      }
    }
  }

  async #createSampleOfficeWithAdmin() {
    this.logger.log('Creating sample office and admin...');
    // Create office
    const officeName = 'Main HQ';
    let office = await this.entityManager.findOneBy(Office, {
      name: officeName,
    });
    if (!office) {
      office = this.entityManager.create(Office, {
        name: officeName,
        latitude: 40.712776,
        longitude: -74.005974,
      });
      office = await this.entityManager.save(office);
    }
    // Create admin user for office
    const adminEmail = 'admin@office.com';
    let adminUser = await this.entityManager.findOneBy(User, {
      email: adminEmail,
    });
    if (!adminUser) {
      const tempPassword = 'Admin@1234';
      adminUser = this.entityManager.create(User, {
        name: 'Office Admin',
        email: adminEmail,
        password: tempPassword,
        userRole: UserRole.ADMIN,
        office,
        verificationToken: 'seeded-token',
        isEmailVerified: true,
      });
      await this.entityManager.save(adminUser);
    }
    office.admin = adminUser;
    await this.entityManager.save(office);
  }

  async #createSampleEmployee() {
    this.logger.log('Creating sample employee...');
    const office = await this.entityManager.findOne(Office, {
      where: { name: 'Main HQ' },
    });
    if (!office) return;
    const employeeEmail = 'employee@office.com';
    let employee = await this.entityManager.findOneBy(User, {
      email: employeeEmail,
    });
    if (!employee) {
      employee = this.entityManager.create(User, {
        name: 'Sample Employee',
        email: employeeEmail,
        password: 'Employee@1234',
        userRole: UserRole.EMPLOYEE,
        office,
        verificationToken: 'seeded-employee-token',
        isEmailVerified: false,
      });
      await this.entityManager.save(employee);
    }
  }
}
