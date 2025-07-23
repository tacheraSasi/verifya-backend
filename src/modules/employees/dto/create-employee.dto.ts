import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsUUID, IsString } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'Name of the employee', example: 'Jane Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address of the employee',
    example: 'jane.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Office ID the employee belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  officeId: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email address of the employee',
    example: 'jane.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'OTP for email verification',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  otp: string;
}
