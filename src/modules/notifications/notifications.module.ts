import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { MailService } from './services/mailer.service';

@Module({
  imports: [HttpModule],
  providers: [NotificationsService,MailService],
  controllers: [NotificationsController],
  exports: [NotificationsService, MailService],
})
export class NotificationsModule {}
