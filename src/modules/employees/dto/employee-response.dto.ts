import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User role' })
  userRole: string;

  @ApiProperty({ description: 'Phone number' })
  phoneNumber?: string;

  @ApiProperty({ description: 'Verification status' })
  isVerified: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}

class OfficeResponseDto {
  @ApiProperty({ description: 'Office ID' })
  id: number;

  @ApiProperty({ description: 'Office name' })
  name: string;

  @ApiProperty({ description: 'Office latitude' })
  latitude: number;

  @ApiProperty({ description: 'Office longitude' })
  longitude: number;

  @ApiProperty({ description: 'Office phone number' })
  phoneNumber?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}

export class EmployeeResponseDto {
  @ApiProperty({ description: 'Employee ID' })
  id: string;

  @ApiProperty({ description: 'User information', type: UserResponseDto })
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @ApiProperty({ description: 'Office information', type: OfficeResponseDto })
  @Type(() => OfficeResponseDto)
  office: OfficeResponseDto;

  @ApiProperty({ description: 'Employee phone number' })
  phoneNumber?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Update date' })
  updatedAt: Date;
}
