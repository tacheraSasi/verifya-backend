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

  @Public()
  @Post('email/test')
  async testEmail(@Body() body: { to?: string }) {
    const testEmail = body.to || process.env.MAIL_USER || 'test@example.com';
    const testMessage = `Hello!

This is a test email from ekiliSync to verify that our email service is working correctly.

If you're reading this, congratulations! The email system is functioning properly.

Here are some details:
• Email sent at: ${new Date().toLocaleString()}
• Service: ekiliSync Mail Service
• Status: Active and operational

Thank you for testing our email service!`;

    await this.notificationsService.sendEmail({
      to: testEmail,
      subject: 'Test Email from ekiliSync',
      message: testMessage,
    });
    
    return { 
      message: 'Test email sent successfully',
      sentTo: testEmail 
    };
  }
}
