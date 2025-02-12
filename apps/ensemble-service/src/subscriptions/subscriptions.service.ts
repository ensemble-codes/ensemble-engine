import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSubscriptionDto, SubscriptionResponseDto, SubscriptionOption } from './dto/subscription.dto';
import { Subscription } from './entities/subscription.entity';
import { Wallet } from 'ethers';
import { DrawsService } from '../draws/draws.service';

@Injectable()
export class SubscriptionsService {
  private readonly subscriptionDetails = {
    [SubscriptionOption.SMALL]: {
      totalTickets: 50,
      totalDraws: 10,
      ticketsRemaining: 50,
      drawsRemaining: 10,
      ticketsPerDraw: 5,
      price: 60,
      discount: 15,
    },
    [SubscriptionOption.MEDIUM]: {
      totalTickets: 75,
      totalDraws: 15,
      ticketsRemaining: 75,
      drawsRemaining: 15,
      ticketsPerDraw: 5,
      price: 80,
      discount: 20,
    },
    [SubscriptionOption.LARGE]: {
      totalTickets: 100,
      totafDraws: 20,
      drawsRemaining: 100,
      totalDraws: 20,
      ticketsPerDraw: 5,
      price: 150,
      discount: 30,
    },
  };

  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    private drawService: DrawsService,
  ) {}

  async createSubscription(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    // TODO: Implement blockchain interaction to create subscription
    const subscriptionAddress = Wallet.createRandom().address;

    const details = this.subscriptionDetails[createSubscriptionDto.subscriptionOption];
    
    const subscription = new this.subscriptionModel({
      ownerAddress: createSubscriptionDto.ownerAddress,
      subscriptionOption: createSubscriptionDto.subscriptionOption,
      subscriptionAddress,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      ...details,
    });
  
    await subscription.save();

    await this.drawService.createDraw(subscription);

    return subscription;
  }

  async getSubscription(ownerAddress: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel
      .findOne({ ownerAddress, isActive: true })
      .exec();

    if (!subscription) {
      return null;
    }

    return subscription;
  }
} 