import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEmail, IsOptional } from 'class-validator';

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
    example: 40.7128,
  })
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Longitude of the office location',
    example: -74.0060,
  })
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'Email for the office admin account',
    example: 'admin@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  adminEmail?: string;
}
