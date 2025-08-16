import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BasicEntity } from '../../../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDate, IsEnum } from 'class-validator';
import { SubscriptionPlan } from './subscription-plan.entity';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
}

@Entity('subscriptions')
export class Subscription extends BasicEntity {
  @ApiProperty({
    description:
      'School ID associated with this subscription should be the UID',
  })
  @Column()
  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @ApiProperty({ description: 'Subscription plan' })
  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn()
  plan: SubscriptionPlan;

  @ApiProperty({ description: 'Current status of the subscription' })
  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;

  @ApiProperty({ description: 'Start date of the subscription' })
  @Column()
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'End date of the subscription' })
  @Column()
  @IsDate()
  endDate: Date;

  @ApiProperty({ description: 'Last payment date' })
  @Column({ nullable: true })
  @IsDate()
  lastPaymentDate?: Date;

  @ApiProperty({ description: 'Next payment date' })
  @Column({ nullable: true })
  @IsDate()
  nextPaymentDate?: Date;

  @ApiProperty({ description: 'Payment provider reference' })
  @Column({ nullable: true })
  @IsString()
  paymentProviderRef?: string;

  @ApiProperty({ description: 'Auto-renew status' })
  @Column({ default: true })
  autoRenew: boolean;

  @ApiProperty({ description: 'Cancellation reason' })
  @Column({ nullable: true })
  @IsString()
  cancellationReason?: string;
}
