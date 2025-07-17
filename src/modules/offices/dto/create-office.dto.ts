import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateOfficeDto {
  @ApiProperty({ description: 'Name of the office', example: 'Headquarters' })
  @IsNotEmpty()
  @IsString()
  name: string;

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

  @ApiProperty({
    description: 'Latitude of the office location',
    example: 40.7128,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({
    description: 'Longitude of the office location',
    example: -74.006,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    description: 'Name for the office admin account',
    example: 'John Admin',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  adminName?: string;
}
