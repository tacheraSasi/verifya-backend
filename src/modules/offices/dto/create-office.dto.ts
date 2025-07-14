import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEmail,
  IsOptional,
} from 'class-validator';

export class CreateOfficeDto {
  @ApiProperty({
    description: 'Name of the office',
    example: 'Headquarters',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Latitude of the office location',
    example: "40.7128",
  })
  @IsString()
  latitude: string;

  @ApiProperty({
    description: 'Longitude of the office location',
    example: "-74.006",
  })
  @IsString()
  longitude: string;

  @ApiProperty({
    description: 'Email for the office admin account',
    example: 'admin@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  adminEmail?: string;

  @ApiProperty({
    description: 'Name for the office admin account',
    example: 'John Admin',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  adminName: string;

  @ApiProperty({
    description: 'Password for the office admin account',
    example: 'StrongPassword123!',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  adminPassword: string;
}
