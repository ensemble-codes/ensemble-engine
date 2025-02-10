import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto, SubscriptionOption, NumberPickingStrategy } from './dto/subscription.dto';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let model: Model<Subscription>;

  const mockSubscription = {
    ownerAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    subscriptionOption: SubscriptionOption.SMALL,
    subscriptionAddress: '0x1234567890123456789012345678901234567890',
    numberPickingStrategy: NumberPickingStrategy.RANDOM,
    ticketsRemaining: 50,
    drawsRemaining: 10,
    isActive: true,
    save: jest.fn(),
  };

  const mockSubscriptionModel = {
    new: jest.fn().mockResolvedValue(mockSubscription),
    constructor: jest.fn().mockResolvedValue(mockSubscription),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: getModelToken(Subscription.name),
          useValue: mockSubscriptionModel,
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    model = module.get<Model<Subscription>>(getModelToken(Subscription.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSubscription', () => {
    it('should create a new subscription successfully', async () => {
      const createSubscriptionDto: CreateSubscriptionDto = {
        ownerAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        subscriptionOption: SubscriptionOption.SMALL,
        numberPickingStrategy: NumberPickingStrategy.RANDOM,
      };

      mockSubscriptionModel.new.mockImplementation(() => ({
        ...mockSubscription,
        save: () => mockSubscription,
      }));

      const result = await service.createSubscription(createSubscriptionDto);

      expect(result).toEqual({
        ownerAddress: mockSubscription.ownerAddress,
        subscriptionOption: mockSubscription.subscriptionOption,
        subscriptionAddress: mockSubscription.subscriptionAddress,
      });
    });

    it('should set correct number of tickets and draws based on subscription option', async () => {
      const createSubscriptionDto: CreateSubscriptionDto = {
        ownerAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        subscriptionOption: SubscriptionOption.MEDIUM,
        numberPickingStrategy: NumberPickingStrategy.RANDOM,
      };

      let savedData;
      mockSubscriptionModel.new.mockImplementation((data) => ({
        ...data,
        save: () => {
          savedData = data;
          return data;
        },
      }));

      await service.createSubscription(createSubscriptionDto);

      expect(savedData.ticketsRemaining).toBe(75);
      expect(savedData.drawsRemaining).toBe(15);
    });
  });

  describe('getSubscription', () => {
    it('should return a subscription if found', async () => {
      const ownerAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      
      mockSubscriptionModel.findOne.mockImplementation(() => ({
        exec: () => mockSubscription,
      }));

      const result = await service.getSubscription(ownerAddress);

      expect(mockSubscriptionModel.findOne).toHaveBeenCalledWith({
        ownerAddress,
        isActive: true,
      });
      expect(result).toEqual({
        ownerAddress: mockSubscription.ownerAddress,
        subscriptionOption: mockSubscription.subscriptionOption,
        subscriptionAddress: mockSubscription.subscriptionAddress,
      });
    });

    it('should return null if no subscription is found', async () => {
      const ownerAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      
      mockSubscriptionModel.findOne.mockImplementation(() => ({
        exec: () => null,
      }));

      const result = await service.getSubscription(ownerAddress);

      expect(result).toBeNull();
    });
  });

  describe('subscription details', () => {
    it('should have correct details for SMALL subscription', () => {
      const details = service['subscriptionDetails'][SubscriptionOption.SMALL];
      expect(details).toEqual({
        tickets: 50,
        draws: 10,
        price: 60,
        discount: 15,
      });
    });

    it('should have correct details for MEDIUM subscription', () => {
      const details = service['subscriptionDetails'][SubscriptionOption.MEDIUM];
      expect(details).toEqual({
        tickets: 75,
        draws: 15,
        price: 80,
        discount: 20,
      });
    });

    it('should have correct details for LARGE subscription', () => {
      const details = service['subscriptionDetails'][SubscriptionOption.LARGE];
      expect(details).toEqual({
        tickets: 100,
        draws: 20,
        price: 150,
        discount: 30,
      });
    });
  });

  describe('error handling', () => {
    it('should handle database errors during creation', async () => {
      const createSubscriptionDto: CreateSubscriptionDto = {
        ownerAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        subscriptionOption: SubscriptionOption.SMALL,
        numberPickingStrategy: NumberPickingStrategy.RANDOM,
      };

      mockSubscriptionModel.new.mockImplementation(() => ({
        save: () => {
          throw new Error('Database error');
        },
      }));

      await expect(service.createSubscription(createSubscriptionDto))
        .rejects
        .toThrow('Database error');
    });

    it('should handle database errors during retrieval', async () => {
      const ownerAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      
      mockSubscriptionModel.findOne.mockImplementation(() => ({
        exec: () => {
          throw new Error('Database error');
        },
      }));

      await expect(service.getSubscription(ownerAddress))
        .rejects
        .toThrow('Database error');
    });
  });
}); 