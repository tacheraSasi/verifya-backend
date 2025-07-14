import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User, UserRole } from 'src/modules/users/entities/user.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { LoggerService } from 'src/lib/logger/logger.service';
import { Office } from 'src/modules/offices/entities/office.entity';
import { Employee } from 'src/modules/employees/entities/employee.entity';

@Injectable()
export class SeederService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly logger: LoggerService,
  ) {}

  async seed() {
    // Create roles
    await this.#createRoles();
    // Create sample offices and users
    await this.#createOfficesWithUsers();
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

  async #createOfficesWithUsers() {
    this.logger.log('Creating offices with admins and employees...');
    const officesData = [
      {
        name: 'Main HQ',
        latitude: 40.712776,
        longitude: -74.005974,
        admin: {
          name: 'Office Admin',
          email: 'admin@office.com',
          password: 'Admin@1234',
        },
        employees: [
          {
            name: 'Verified Employee',
            email: 'verified@office.com',
            password: 'Verified@1234',
            isEmailVerified: true,
          },
          {
            name: 'Non-Verified Employee',
            email: 'nonverified@office.com',
            password: 'NonVerified@1234',
            isEmailVerified: false,
          },
        ],
      },
      {
        name: 'Branch Office',
        latitude: 34.052235,
        longitude: -118.243683,
        admin: {
          name: 'Branch Admin',
          email: 'admin@branch.com',
          password: 'BranchAdmin@1234',
        },
        employees: [
          {
            name: 'Branch Verified',
            email: 'branch.verified@office.com',
            password: 'BranchVerified@1234',
            isEmailVerified: true,
          },
          {
            name: 'Branch Non-Verified',
            email: 'branch.nonverified@office.com',
            password: 'BranchNonVerified@1234',
            isEmailVerified: false,
          },
        ],
      },
    ];
    const adminRole = await this.entityManager.findOneBy(Role, {
      name: 'Admin',
    });
    const employeeRole = await this.entityManager.findOneBy(Role, {
      name: 'Employee',
    });
    for (const officeData of officesData) {
      let office = await this.entityManager.findOneBy(Office, {
        name: officeData.name,
      });
      if (!office) {
        office = this.entityManager.create(Office, {
          name: officeData.name,
          latitude: officeData.latitude,
          longitude: officeData.longitude,
        });
        office = await this.entityManager.save(office);
      }
      // Create admin
      let adminUser = await this.entityManager.findOneBy(User, {
        email: officeData.admin.email,
      });
      if (!adminUser) {
        adminUser = this.entityManager.create(User, {
          name: officeData.admin.name,
          email: officeData.admin.email,
          password: officeData.admin.password,
          userRole: UserRole.ADMIN,
          office,
          verificationToken: 'seeded-admin-token',
          isEmailVerified: true,
          ...(adminRole ? { role: adminRole } : {}),
        });
        await this.entityManager.save(adminUser);
      }
      office.admin = adminUser;
      await this.entityManager.save(office);
      // Create employees
      for (const emp of officeData.employees) {
        let employeeUser = await this.entityManager.findOneBy(User, {
          email: emp.email,
        });
        if (!employeeUser) {
          employeeUser = this.entityManager.create(User, {
            name: emp.name,
            email: emp.email,
            password: emp.password,
            userRole: UserRole.EMPLOYEE,
            office,
            verificationToken: 'seeded-employee-token',
            isEmailVerified: emp.isEmailVerified,
            ...(employeeRole ? { role: employeeRole } : {}),
          });
          await this.entityManager.save(employeeUser);
        }
        // Create Employee entity
        let employeeEntity = await this.entityManager.findOneBy(Employee, {
          user: employeeUser,
        });
        if (!employeeEntity) {
          employeeEntity = this.entityManager.create(Employee, {
            user: employeeUser,
            office,
          });
          await this.entityManager.save(employeeEntity);
        }
      }
    }
  }
}
