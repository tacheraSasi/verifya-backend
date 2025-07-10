import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';

@Module({
  imports: [HttpModule],
  controllers: [SmsController],
  providers: [SmsService],
})
export class SmsModule {}
