import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Public } from 'src/modules/auth/decorator/public.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Public()
  @Post('sms')
  async sendSms(@Body() body: { phoneNumber: string; message: string }) {
    await this.notificationsService.sendSMS(body);
    return { message: 'SMS sent successfully' };
  }

  @Post('email')
  async sendEmail(
    @Body()
    body: {
      to: string;
      subject: string;
      message: string;
      from?: string;
    },
  ) {
    await this.notificationsService.sendEmail(body);
    return { message: 'Email sent successfully' };
  }
}
