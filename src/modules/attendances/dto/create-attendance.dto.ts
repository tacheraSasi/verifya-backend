import { IsUUID, IsNumber, IsLatitude, IsLongitude } from 'class-validator';

export class CreateAttendanceDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  officeId: string;

  @IsNumber()
  @IsLatitude()
  latitude: number;

  @IsNumber()
  @IsLongitude()
  longitude: number;
}
