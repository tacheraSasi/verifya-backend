import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Name of the office',
    example: 'Headquarters',
  })
  @IsNotEmpty()
  @IsString()
  officeName: string;

  @ApiProperty({
    description: 'Latitude of the office location',
    example: 40.7128,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({
    description: 'Longitude of the office location',
    example: -74.006,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    description: 'Email for the office admin account',
    example: 'admin@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  adminEmail: string;

  @ApiProperty({
    description: 'Name for the office admin account',
    example: 'John Admin',
  })
  @IsNotEmpty()
  @IsString()
  adminName: string;

  @ApiProperty({
    description: 'Password for the office admin account',
    example: 'StrongPassword123!',
  })
  @IsNotEmpty()
  @IsString()
  adminPassword: string;
}
