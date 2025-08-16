import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

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
  ) {}

  private smsApiKey = this.configService.get<string>('smsApiKey');
  private emailApiKey = this.configService.get<string>('emailApiKey');
  private smsApiUrl =
    this.configService.get<string>('smsApiUrl') ||
    'https://api.notify.africa/v2/send-sms';
  private senderId = this.configService.get<string>('senderId');

  private readonly logger = new Logger(NotificationsService.name);

  async sendSMS({ phoneNumber, message }: SendSmsDto): Promise<void> {
    const payload = {
      sender_id: this.senderId,
      schedule: 'none',
      sms: message,
      recipients: [{ number: Number(phoneNumber) }],
    };
    try {
      const response: any = await firstValueFrom(
        this.httpService.post(this.smsApiUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.smsApiKey,
          },
        }),
      );
      this.logger.log(`SMS sent to ${phoneNumber}: ${message}`);
      this.logger.debug(`Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phoneNumber}:`, error.message);
    }
  }

  async sendEmail({ to, subject, message, from }: SendEmailDto): Promise<void> {
    const payload = {
      apikey: '',
      to,
      subject,
      message,
      headers: from ? `From: ${from}` : undefined,
    };
    try {
      const response: any = await firstValueFrom(
        this.httpService.post(
          'https://relay.ekilie.com/api/index.php',
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      console.log(`Ekilie Relay response [${to}]:`, response.data);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error.message);
    }
  }
}
