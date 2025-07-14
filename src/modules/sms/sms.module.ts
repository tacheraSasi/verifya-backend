import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [HttpModule, NotificationsModule],
  controllers: [SmsController],
  providers: [SmsService],
})
export class SmsModule {}
