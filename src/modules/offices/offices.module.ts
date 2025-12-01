import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficesService } from './offices.service';
import { OfficesController } from './offices.controller';
import { UsersModule } from '../users/users.module';
import { Office } from './entities/office.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Attendance } from '../attendances/entities/attendance.entity';
import { SubscriptionModule } from 'src/modules/subscriptions/subscription.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Office, Employee, Attendance]),
    UsersModule,
    forwardRef(() => SubscriptionModule),
  ],
  controllers: [OfficesController],
  providers: [OfficesService],
})
export class OfficesModule {}
