import { SetMetadata } from '@nestjs/common';
import { PlanType } from '../entities/subscription-plan.entity';

export interface SubscriptionRequirement {
  planType?: PlanType;
  features?: string[];
  message?: string;
}

export const REQUIRE_SUBSCRIPTION = 'require_subscription';
export const RequireSubscription = (requirement: SubscriptionRequirement) =>
  SetMetadata(REQUIRE_SUBSCRIPTION, requirement);
