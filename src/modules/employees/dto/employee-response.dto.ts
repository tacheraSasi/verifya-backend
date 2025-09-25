import { ApiProperty } from '@nestjs/swagger';

export class EmployeeResponseDto {
  @ApiProperty({ description: 'Employee ID' })
  id: string;

  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Phone number' })
  phoneNumber: string;

  @ApiProperty({
    description: 'Employee status',
    enum: ['active', 'inactive', 'invited', 'suspended'],
  })
  status: 'active' | 'inactive' | 'invited' | 'suspended';

  @ApiProperty({
    description: 'Employee role',
    enum: ['superadmin', 'admin', 'cashier', 'manager'],
  })
  role: 'superadmin' | 'admin' | 'cashier' | 'manager';

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Update date' })
  updatedAt: Date;
}
