import { PartialType, PickType } from '@nestjs/swagger';
import { CreateOfficeDto } from './create-office.dto';

// Only allow updating office profile fields, not admin credentials
export class UpdateOfficeDto extends PartialType(
  PickType(CreateOfficeDto, [
    'name',
    'phoneNumber',
    'latitude',
    'longitude',
    'address',
    'email',
    'logoUrl',
  ] as const),
) {}
