import { Controller, Get, Param } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('current-plan/:officeId')
  async getCurrentPlan(@Param('officeId') officeId: string) {
    const subscription =
      await this.subscriptionService.getActiveSubscription(officeId);
    if (!subscription) {
      return { plan: null };
    }
    return { plan: subscription.plan };
  }
}
