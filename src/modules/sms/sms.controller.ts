import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SmsService } from './sms.service';
import { CreateSmDto } from './dto/create-sm.dto';
import { UpdateSmDto } from './dto/update-sm.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

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

  @Get()
  @ApiOperation({ summary: 'Get all SMS records' })
  @ApiResponse({ status: 200, description: 'Returns all SMS records' })
  findAll() {
    return this.smsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an SMS record by ID' })
  @ApiParam({ name: 'id', type: String, description: 'SMS record ID' })
  @ApiResponse({ status: 200, description: 'Returns the SMS record' })
  @ApiResponse({ status: 404, description: 'SMS record not found' })
  findOne(@Param('id') id: string) {
    return this.smsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an SMS record' })
  @ApiParam({ name: 'id', type: String, description: 'SMS record ID' })
  @ApiBody({ type: UpdateSmDto })
  @ApiResponse({ status: 200, description: 'SMS record updated' })
  @ApiResponse({ status: 404, description: 'SMS record not found' })
  update(@Param('id') id: string, @Body() updateSmDto: UpdateSmDto) {
    return this.smsService.update(+id, updateSmDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an SMS record' })
  @ApiParam({ name: 'id', type: String, description: 'SMS record ID' })
  @ApiResponse({ status: 204, description: 'SMS record deleted' })
  @ApiResponse({ status: 404, description: 'SMS record not found' })
  remove(@Param('id') id: string) {
    return this.smsService.remove(+id);
  }
}
