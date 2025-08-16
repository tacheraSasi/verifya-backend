import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { SubscriptionStatus } from '../entities/subscription.entity';

export class UpdateSubscriptionDto {
  @ApiProperty({ description: 'Plan ID', required: false })
  @IsString()
  @IsOptional()
  planId?: string;

  @ApiProperty({
    description: 'Subscription status',
    enum: SubscriptionStatus,
    required: false,
  })
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;
}
