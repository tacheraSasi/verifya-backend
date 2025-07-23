import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsLatitude, IsLongitude } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty({
    description: 'User ID of the employee checking in',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Office ID where the check-in is happening',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  officeId: string;

  @ApiProperty({
    description: 'Latitude of the check-in location',
    example: 40.7128,
  })
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiProperty({
    description: 'Longitude of the check-in location',
    example: -74.006,
  })
  @IsNumber()
  @IsLongitude()
  longitude: number;
}
