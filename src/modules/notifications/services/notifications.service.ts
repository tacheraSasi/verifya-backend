import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mailer.service';

interface SendSmsDto {
  phoneNumber: string;
  message: string;
}

interface SendEmailDto {
  to: string;
  subject: string;
  message: string;
  from?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  private smsApiKey = this.configService.get<string>('smsApiKey');
  private emailApiKey = this.configService.get<string>('emailApiKey');
  private smsApiUrl =
    this.configService.get<string>('smsApiUrl') ||
    'https://karibu.briq.tz/v1/message/send-instant';
  private senderId = this.configService.get<string>('senderId');

  private readonly logger = new Logger(NotificationsService.name);

  async sendSMS({ phoneNumber, message }: SendSmsDto): Promise<void> {
    console.log('Sending SMS to:', phoneNumber);
    const payload = {
      content: message,
      recipients: [phoneNumber],
      sender_id: this.senderId || '',
    };
    try {
      const response: any = await firstValueFrom(
        this.httpService.post(this.smsApiUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.smsApiKey || '',
          },
        }),
      );
      this.logger.log(`SMS sent to ${phoneNumber}: ${message}`);
      this.logger.debug(`Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phoneNumber}:`, error.message);
      throw error;
    }
  }

  async sendEmail({ to, subject, message, from }: SendEmailDto): Promise<void> {
    try {
      await this.mailService.sendMail(to, subject, message);
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error.message);
      throw error;
    }
  }
}
