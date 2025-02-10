import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, SubscriptionResponseDto } from './dto/subscription.dto';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a lottery subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
    type: SubscriptionResponseDto 
  })
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    console.log('createSubscriptionDto', createSubscriptionDto);
    return this.subscriptionsService.createSubscription(createSubscriptionDto);
  }

  @Get(':ownerAddress')
  @ApiOperation({ summary: 'Get subscription by owner address' })
  @ApiResponse({
    status: 200, 
    description: 'Returns the subscription details',
    type: SubscriptionResponseDto 
  })
  async getSubscription(
    @Param('ownerAddress') ownerAddress: string,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.getSubscription(ownerAddress);
  }
}