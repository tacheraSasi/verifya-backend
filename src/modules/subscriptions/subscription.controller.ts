import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

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

  @Get('plans')
  async getAllPlans() {
    return this.subscriptionService.findAllPlans();
  }

  @Patch('update-plan/:officeId')
  async updatePlan(
    @Param('officeId') officeId: string,
    @Body() updateDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.updateOfficeSubscription(
      officeId,
      updateDto,
    );
  }
}
