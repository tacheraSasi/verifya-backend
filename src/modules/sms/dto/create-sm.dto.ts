import { ApiProperty } from '@nestjs/swagger';

export class CreateSmDto {
  @ApiProperty({ description: 'Recipient phone number', example: '+1234567890' })
  phoneNumber: string;

  @ApiProperty({ description: 'Message content', example: 'Hello, this is a test SMS.' })
  message: string;
}
