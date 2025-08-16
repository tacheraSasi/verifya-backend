import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  REQUIRE_SUBSCRIPTION,
  SubscriptionRequirement,
} from '../decorators/require-subscription.decorator';
import { SubscriptionService } from '../subscription.service';
import { PlanType } from '../entities/subscription-plan.entity';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.get<SubscriptionRequirement>(
      REQUIRE_SUBSCRIPTION,
      context.getHandler(),
    );

    if (!requirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const schoolId = request.user?.schoolId;

    if (!schoolId) {
      throw new ForbiddenException('School ID not found in request');
    }

    const subscription =
      await this.subscriptionService.getActiveSubscription(schoolId);

    if (!subscription) {
      throw new ForbiddenException(
        requirement.message || 'This feature requires an active subscription',
      );
    }

    const plan = subscription.plan;

    // Check plan type requirement
    if (requirement.planType) {
      const planTypes = Object.values(PlanType);
      const requiredIndex = planTypes.indexOf(requirement.planType);
      const currentIndex = planTypes.indexOf(plan.type);

      if (currentIndex < requiredIndex) {
        throw new ForbiddenException(
          requirement.message ||
            `This feature requires a ${requirement.planType} plan or higher`,
        );
      }
    }

    // Check feature requirements
    if (requirement.features?.length) {
      const missingFeatures = requirement.features.filter(
        feature => !plan.features.includes(feature),
      );

      if (missingFeatures.length > 0) {
        throw new ForbiddenException(
          requirement.message ||
            `This feature requires the following subscription features: ${missingFeatures.join(
              ', ',
            )}`,
        );
      }
    }

    return true;
  }
}
