import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

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
    description: 'Phone number of the employee',
    example: '+1234567890',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Office ID the employee belongs to',
    example: '1',
  })
  @IsNotEmpty()
  @IsString()
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
