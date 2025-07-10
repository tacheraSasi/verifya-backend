import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateSmDto } from './create-sm.dto';

export class UpdateSmDto extends PartialType(CreateSmDto) {}
