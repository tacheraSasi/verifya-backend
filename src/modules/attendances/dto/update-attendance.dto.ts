import { ApiProperty } from '@nestjs/swagger';
import {
    IsNumber,
    IsLatitude,
    IsLongitude,
    IsOptional,
    IsDateString,
} from 'class-validator';

export class UpdateAttendanceDto {
    @ApiProperty({
        description: 'Check-out time',
        example: '2024-01-15T17:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    checkOutTime?: string;

    @ApiProperty({
        description: 'Latitude of the check-out location',
        example: 40.7128,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @IsLatitude()
    checkoutLatitude?: number;

    @ApiProperty({
        description: 'Longitude of the check-out location',
        example: -74.006,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @IsLongitude()
    checkoutLongitude?: number;
}
