import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Name of the office',
    example: 'Headquarters',
  })
  @IsNotEmpty()
  @IsString()
  officeName: string;

  @ApiProperty({
    description: 'Email for the office admin account',
    example: 'admin@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  adminEmail: string;

  @ApiProperty({
    description: 'Password for the office admin account',
    example: 'StrongPassword123!',
  })
  @IsNotEmpty()
  @IsString()
  adminPassword: string;

  @ApiProperty({
    description: 'Phone number for the office admin',
    example: '+1234567890',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}
