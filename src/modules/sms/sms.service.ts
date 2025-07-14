import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateSmDto } from './dto/create-sm.dto';
import { NotificationsService } from '../notifications/notifications.service';

interface SendSmsDto {
  phoneNumber: string;
  message: string;
}

@Injectable()
export class SmsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async sendSMS({ phoneNumber, message }: SendSmsDto): Promise<void> {
    await this.notificationsService.sendSMS({ phoneNumber, message });
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
