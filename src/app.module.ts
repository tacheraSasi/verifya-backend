import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from 'src/database/database.module';
import { ConfigModule } from 'src/config/config.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { LoggerModule } from 'src/lib/logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { OfficesModule } from './modules/offices/offices.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { AttendancesModule } from './modules/attendances/attendances.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SubscriptionModule } from 'src/modules/subscriptions/subscription.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UsersModule,
    RolesModule,
    SeederModule,
    LoggerModule,
    AuthModule,
    OfficesModule,
    EmployeesModule,
    AttendancesModule,
    NotificationsModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
