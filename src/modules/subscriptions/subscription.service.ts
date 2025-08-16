import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionStatus } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { logger } from 'src/common/services/logger.service';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,
  ) {}

  async getActiveSubscription(schoolId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: {
        schoolId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['plan'],
    });
  }

  async createSubscription(
    schoolId: string,
    planId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Subscription> {
    const plan = await this.planRepository.findOne({
      where: { id: +planId },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    const subscription = this.subscriptionRepository.create({
      schoolId,
      plan,
      startDate,
      endDate,
      status: SubscriptionStatus.ACTIVE,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async cancelSubscription(
    subscriptionId: string,
    reason?: string,
  ): Promise<Subscription> {
    const subscription = await this.findOne(subscriptionId);
    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancellationReason = reason;
    subscription.autoRenew = false;
    return this.subscriptionRepository.save(subscription);
  }

  async getDefaultPlan(): Promise<SubscriptionPlan> {
    const plan = await this.planRepository.findOne({
      where: { isDefault: true },
    });

    if (!plan) {
      throw new NotFoundException('Default subscription plan not found');
    }

    return plan;
  }

  async checkFeatureAccess(
    officeId: string,
    feature: string,
  ): Promise<boolean> {
    const subscription = await this.getActiveSubscription(officeId);
    if (!subscription) {
      return false;
    }

    return subscription.plan.features.includes(feature);
  }

  async getUsage(officeId: string): Promise<{
    usersCount: number;
    adminsCount: number;
    employeesCount: number;
  }> {
    logger.log(`Fetching usage for office ID: ${officeId}`);
    return {
      usersCount: 0,
      adminsCount: 0,
      employeesCount: 0,
    };
  }

  async checkUsageLimits(schoolId: string): Promise<{
    isWithinLimits: boolean;
    exceededLimits: string[];
  }> {
    const subscription = await this.getActiveSubscription(schoolId);
    if (!subscription) {
      return {
        isWithinLimits: false,
        exceededLimits: ['subscription'],
      };
    }

    const usage = await this.getUsage(schoolId);
    const exceededLimits: string[] = [];

    if (usage.adminsCount > subscription.plan.maxAdmins) {
      exceededLimits.push('admins');
    }
    if (usage.employeesCount > subscription.plan.maxEmployees) {
      exceededLimits.push('employees');
    }
    if (usage.usersCount > subscription.plan.maxUsers) {
      exceededLimits.push('users');
    }

    return {
      isWithinLimits: exceededLimits.length === 0,
      exceededLimits,
    };
  }

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const subscription = this.subscriptionRepository.create(
      createSubscriptionDto,
    );
    return this.subscriptionRepository.save(subscription);
  }

  findAll() {
    return this.subscriptionRepository.find();
  }

  async findOne(id: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: +id },
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const subscription = await this.findOne(id);
    Object.assign(subscription, updateSubscriptionDto);
    return this.subscriptionRepository.save(subscription);
  }

  async remove(id: string) {
    const subscription = await this.findOne(id);
    return this.subscriptionRepository.remove(subscription);
  }
}
