import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SetPasswordDto {
  @ApiProperty({
    description: 'The new password for the user',
    example: 'NewStrongPassword123!',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
