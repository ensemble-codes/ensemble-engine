import { ApiProperty } from '@nestjs/swagger';

export enum NumberPickingStrategy {
  RANDOM = 0,
  MANUAL = 1,
}

export enum SubscriptionOption {
  SMALL = 0,  // 50 tickets, 10 draws
  MEDIUM = 1, // 75 tickets, 15 draws
  LARGE = 2,  // 100 tickets, 20 draws
}

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Address of the lottery player',
  })
  ownerAddress: string;

  @ApiProperty({
    enum: SubscriptionOption,
    description: 'Subscription package option',
  })
  subscriptionOption: SubscriptionOption;

  @ApiProperty({
    enum: NumberPickingStrategy,
    description: 'How numbers are picked for tickets',
  })
  numberPickingStrategy: NumberPickingStrategy;
}

export class SubscriptionResponseDto {
  @ApiProperty()
  ownerAddress: string;

  @ApiProperty({
    enum: SubscriptionOption,
    type: Number,
  })
  subscriptionOption: SubscriptionOption;

  @ApiProperty()
  subscriptionAddress: string;
} 