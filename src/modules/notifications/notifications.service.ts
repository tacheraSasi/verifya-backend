import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

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
  constructor(private readonly httpService: HttpService) {}

  async sendSMS({ phoneNumber, message }: SendSmsDto): Promise<void> {
    const payload = {
      sender_id: 17,
      schedule: 'none',
      sms: message,
      recipients: [{ number: Number(phoneNumber) }],
    };
    try {
      const response: any = await firstValueFrom(
        this.httpService.post(
          'https://api.notify.africa/v2/send-sms',
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization:
                'Bearer 148|aALck45bqeeFCxAH2OLJneyCiqq4Bj7NFJS7n9ML5d6e6d0c',
            },
          },
        ),
      );
      console.log(`Notify Africa response [${phoneNumber}]:`, response.data);
    } catch (error) {
      console.error(`Failed to send SMS to ${phoneNumber}:`, error.message);
    }
  }

  async sendEmail({ to, subject, message, from }: SendEmailDto): Promise<void> {
    const payload = {
      apikey: 'relay-6087f8c42d70f0650b9f023adc',
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
