import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { CreateSmDto } from './dto/create-sm.dto';

interface SendSmsDto {
  phoneNumber: string;
  message: string;
}

@Injectable()
export class SmsService {
  constructor(private readonly httpService: HttpService) {}

  private async sendSMS({ phoneNumber, message }: SendSmsDto): Promise<void> {
    const payload = {
      sender_id: 17,
      schedule: 'none',
      sms: message,
      recipients: [{ number: Number(phoneNumber) }],
    };

    try {
      const response: AxiosResponse = await firstValueFrom(
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

  async create(
    createSmDto: CreateSmDto & { phoneNumber: string; message: string },
  ) {
    await this.sendSMS({
      phoneNumber: createSmDto.phoneNumber,
      message: createSmDto.message,
    });
    return { message: 'SMS sent successfully' };
  }
}
