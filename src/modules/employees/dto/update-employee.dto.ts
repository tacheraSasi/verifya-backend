import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
