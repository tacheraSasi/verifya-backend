import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';
import { BasicEntity } from 'src/common/entities/base.entity';

export enum PlanType {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

@Entity('subscription_plans')
export class SubscriptionPlan extends BasicEntity {
  @ApiProperty({ description: 'Name of the subscription plan' })
  @Column({ length: 255 })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Type of the subscription plan', enum: PlanType })
  @Column({
    type: 'enum',
    enum: PlanType,
    default: PlanType.FREE,
  })
  @IsNotEmpty()
  type: PlanType;

  @ApiProperty({ description: 'Description of the subscription plan' })
  @Column('text')
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Monthly price of the plan' })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'Maximum number of employees allowed' })
  @Column('int', { default: 0 })
  @IsNumber()
  @IsNotEmpty()
  maxEmployees: number;

  @ApiProperty({ description: 'Maximum number of users allowed' })
  @Column('int', { default: 0 })
  @IsNumber()
  @IsNotEmpty()
  maxUsers: number;

  @ApiProperty({ description: 'Maximum number of admins allowed' })
  @Column('int', { default: 0 })
  @IsNumber()
  @IsNotEmpty()
  maxAdmins: number;

  @ApiProperty({ description: 'Whether the plan includes advanced analytics' })
  @Column('boolean', { default: false })
  @IsBoolean()
  hasAnalytics: boolean;

  @ApiProperty({ description: 'Whether the plan includes custom branding' })
  @Column('boolean', { default: false })
  @IsBoolean()
  hasCustomBranding: boolean;

  @ApiProperty({ description: 'Whether the plan includes API access' })
  @Column('boolean', { default: false })
  @IsBoolean()
  hasApiAccess: boolean;

  @ApiProperty({ description: 'List of features included in the plan' })
  @Column('text')
  @IsString()
  features: string;

  @ApiProperty({ description: 'Whether this is the default plan' })
  @Column('boolean', { default: false })
  @IsBoolean()
  isDefault: boolean;

  @ApiProperty({ description: 'Whether the plan is active' })
  @Column('boolean', { default: true })
  @IsBoolean()
  isActive: boolean;
}
