import { Controller, Post, Body } from '@nestjs/common';
import { SmsService } from './sms.service';
import { CreateSmDto } from './dto/create-sm.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('SMS')
@ApiBearerAuth('JWT')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post()
  @ApiOperation({ summary: 'Send an SMS message' })
  @ApiBody({ type: CreateSmDto })
  @ApiResponse({ status: 201, description: 'SMS sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createSmDto: CreateSmDto) {
    return this.smsService.create(createSmDto);
  }
}
