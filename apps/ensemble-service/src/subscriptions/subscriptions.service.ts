import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSubscriptionDto, SubscriptionResponseDto, SubscriptionOption } from './dto/subscription.dto';
import { Subscription } from './entities/subscription.entity';
import { Wallet } from 'ethers';

@Injectable()
export class SubscriptionsService {
  private readonly subscriptionDetails = {
    [SubscriptionOption.SMALL]: {
      tickets: 50,
      draws: 10,
      price: 60,
      discount: 15,
    },
    [SubscriptionOption.MEDIUM]: {
      tickets: 75,
      draws: 15,
      price: 80,
      discount: 20,
    },
    [SubscriptionOption.LARGE]: {
      tickets: 100,
      draws: 20,
      price: 150,
      discount: 30,
    },
  };

  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
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
      numberPickingStrategy: createSubscriptionDto.numberPickingStrategy,
      ticketsRemaining: details.tickets,
      drawsRemaining: details.draws,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
    });

    await subscription.save();

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