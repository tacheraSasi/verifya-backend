import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User, UserRole } from 'src/modules/users/entities/user.entity';
import { Role } from 'src/modules/roles/entities/role.entity';

import { LoggerService } from 'src/lib/logger/logger.service';
import { Office } from 'src/modules/offices/entities/office.entity';
import { Employee } from 'src/modules/employees/entities/employee.entity';
import { SubscriptionPlan } from 'src/modules/subscriptions/entities/subscription-plan.entity';
import { subscriptionPlansData } from './data/subscription-plans.data';
import { officesData } from 'src/modules/seeder/data/office.data';

@Injectable()
export class SeederService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly logger: LoggerService,
  ) {}

  async seed() {
    try {
      // Create roles
      await this.#createRoles();
      // Create subscription plans
      await this.#createSubscriptionPlans();
      // Create sample offices and users
      await this.#createOfficesWithUsers();
      this.logger.log('Seeding completed successfully');
    } catch (error) {
      this.logger.error('Seeding failed:', error);
      throw error;
    }
  }

  async #createSubscriptionPlans() {
    this.logger.log('Creating subscription plans...');
    for (const planData of subscriptionPlansData) {
      const exists = await this.entityManager.findOneBy(SubscriptionPlan, {
        type: planData.type,
      });
      if (!exists) {
        const plan = this.entityManager.create(SubscriptionPlan, planData);
        await this.entityManager.save(plan);
      }
    }
    this.logger.log('Finished seeding subscrpition plans');
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
    this.logger.log('Finished seeding subscrpition plans');
  }

  async #createOfficesWithUsers() {
    this.logger.log('Creating offices with admins and employees...');

    // Check if seeding has already been done
    const existingOfficeCount = await this.entityManager.count(Office);
    if (existingOfficeCount > 0) {
      this.logger.log('Offices already exist, skipping office seeding...');
      return;
    }

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
          phoneNumber: officeData.phoneNumber,
        });
        office = await this.entityManager.save(office);
      }
      // Create admin
      let adminUser = await this.entityManager.findOneBy(User, {
        email: officeData.admin.email,
      });
      if (!adminUser) {
        try {
          adminUser = this.entityManager.create(User, {
            name: officeData.admin.name,
            email: officeData.admin.email,
            password: officeData.admin.password,
            userRole: UserRole.ADMIN,
            office,
            verificationToken: 'seeded-admin-token',
            isVerified: true,
            ...(adminRole ? { role: adminRole } : {}),
          });
          await this.entityManager.save(adminUser);
          this.logger.log(`Created admin user: ${adminUser.email}`);
        } catch (error) {
          this.logger.error(
            `Failed to create admin user ${officeData.admin.email}:`,
            error,
          );
          throw error;
        }
      } else {
        this.logger.log(`Admin user already exists: ${adminUser.email}`);
      }

      // Update office admin if needed
      if (office.admin?.id !== adminUser.id) {
        office.admin = adminUser;
        await this.entityManager.save(office);
      }
      // Create employees
      for (const emp of officeData.employees) {
        let employeeUser = await this.entityManager.findOneBy(User, {
          email: emp.email,
        });
        if (!employeeUser) {
          try {
            employeeUser = this.entityManager.create(User, {
              name: emp.name,
              email: emp.email,
              password: emp.password,
              userRole: UserRole.EMPLOYEE,
              office,
              verificationToken: 'seeded-employee-token',
              isVerified: emp.isVerified,
              ...(employeeRole ? { role: employeeRole } : {}),
            });
            await this.entityManager.save(employeeUser);
            this.logger.log(`Created employee user: ${employeeUser.email}`);
          } catch (error) {
            this.logger.error(
              `Failed to create employee user ${emp.email}:`,
              error,
            );
            throw error;
          }
        } else {
          this.logger.log(
            `Employee user already exists: ${employeeUser.email}`,
          );
        }

        // Create Employee entity - check both by user and by userId to avoid duplicates
        let employeeEntity = await this.entityManager.findOne(Employee, {
          where: { user: { id: employeeUser.id } },
          relations: ['user'],
        });

        if (!employeeEntity) {
          try {
            employeeEntity = this.entityManager.create(Employee, {
              user: employeeUser,
              office,
            });
            await this.entityManager.save(employeeEntity);
            this.logger.log(
              `Created employee entity for user: ${employeeUser.email}`,
            );
          } catch (error) {
            // Handle duplicate entry error gracefully
            if (error.code === 'ER_DUP_ENTRY') {
              this.logger.warn(
                `Employee entity already exists for user ${employeeUser.email}, skipping...`,
              );
              // Try to fetch the existing entity
              employeeEntity = await this.entityManager.findOne(Employee, {
                where: { user: { id: employeeUser.id } },
                relations: ['user'],
              });
            } else {
              this.logger.error(
                `Failed to create employee entity for user ${employeeUser.email}:`,
                error,
              );
              throw error;
            }
          }
        } else {
          this.logger.log(
            `Employee entity already exists for user: ${employeeUser.email}`,
          );
        }
      }
    }
    this.logger.log('Finished creating offices with admins and employees');
  }
}
