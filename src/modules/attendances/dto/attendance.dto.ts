import { ApiProperty } from '@nestjs/swagger';
import { Office } from 'src/modules/offices/entities/office.entity';
import { User } from 'src/modules/users/entities/user.entity';

export class AttendanceDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: () => User })
  user: Partial<User>;

  @ApiProperty({ type: () => Office })
  office: Partial<Office>;

  @ApiProperty({ example: 40.7128 })
  checkinLatitude: number;

  @ApiProperty({ example: -74.006 })
  checkinLongitude: number;

  @ApiProperty({ example: '2025-11-20T13:29:21.424Z' })
  checkinTime: Date;
}
