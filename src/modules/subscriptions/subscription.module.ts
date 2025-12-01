import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionService } from './subscription.service';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionGuard } from './guards/subscription.guard';
import { SubscriptionController } from './subscription.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, SubscriptionPlan])],
  providers: [SubscriptionService, SubscriptionGuard],
  controllers: [SubscriptionController],
  exports: [SubscriptionService, SubscriptionGuard],
})
export class SubscriptionModule {}
