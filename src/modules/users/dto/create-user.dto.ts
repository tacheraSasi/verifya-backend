import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'Name of the user.',
    example: 'John Doe',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Email address of the user.',
    example: 'user@example.com',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    description: 'Password for the user account. Will be hashed before saving.',
    example: 'SafePassword123!',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  password: string;

  @ApiProperty({
    description: 'Role of the user (admin or employee).',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  @IsOptional()
  @IsEnum(UserRole)
  userRole?: UserRole;

  @ApiProperty({
    description: 'ID of the role assigned to the user.',
    example: 'd3e54abc-91e1-4e2b-812a-91a863e2f344',
    required: false,
  })
  @IsOptional()
  @IsString()
  roleId?: string;

  @ApiProperty({
    description: 'ID of the office the user belongs to.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  officeId: string;
}
