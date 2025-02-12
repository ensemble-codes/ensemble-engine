import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DrawResponseDto } from './dto/draw.dto';
import { Draw, DrawStatus } from './entities/draw.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';

@Injectable()
export class DrawsService {
  constructor(
    @InjectModel(Draw.name)
    private drawModel: Model<Draw>,
  ) {}

  async getDraw(lotteryId: number): Promise<DrawResponseDto> {
    const draw = await this.drawModel.findOne({ lotteryId }).exec();
    
    if (!draw) {
      throw new NotFoundException(`Draw with ID ${lotteryId} not found`);
    }

    return {
      lotteryId: draw.lotteryId,
      selectedNumbers: draw.selectedNumbers,
      winningNumbers: draw.winningNumbers,
      drawDate: draw.drawDate,
      prizePool: draw.prizePool,
      status: draw.status,
    };
  }

  async getLatestDraw(subscriptionId: string): Promise<DrawResponseDto> {
    const draw = await this.drawModel
      .findOne({ subscriptionId })
      .sort({ drawId: -1 })
      .exec();

    if (!draw) {
      throw new NotFoundException('No completed draws found');
    }

    return {
      lotteryId: draw.lotteryId,
      selectedNumbers: draw.selectedNumbers,
      winningNumbers: draw.winningNumbers,
      drawDate: draw.drawDate,
      prizePool: draw.prizePool,
      status: draw.status,
    };
  }

  async getAllDraws(subscriptionId: string): Promise<DrawResponseDto[]> {

    // Here we would typically join with a tickets collection to get draws
    // where the user participated, but for now we'll just get all completed draws
    const draws = await this.drawModel
      .find({ subscriptionId })
      .sort({ drawId: -1 })
      .exec();

    return draws
  }

  private generateRandomNumbers(ticketsPerDraw: number): number[] {
    const numbers = [];
    const ticketSize = 6;
    for (let i = 0; i < ticketsPerDraw; i++) {
      const ticket = [];
      while (ticket.length < ticketSize) {
        const randomNumber = Math.floor(Math.random() * 10); // Generate a random digit between 0 and 9
        ticket.push(randomNumber);
      }
      numbers.push(ticket);
    }
    return numbers;
  }

  async createDraw(subscription: Subscription): Promise<DrawResponseDto> {

    const selectedNumbers = this.generateRandomNumbers(subscription.ticketsPerDraw)
    console.log('Selected Numbers:', selectedNumbers);
    const draw = new this.drawModel({
      lotteryId: Math.floor(Math.random() * 1000000), // Generate a random lotteryId
      subscriptionId: subscription._id,
      selectedNumbers,
      drawDate: new Date(),
      prizePool: '0', // Initial prize pool set to 0
      status: 'PENDING',
      winningNumbers: [],
    });

    await draw.save();

    return {
      lotteryId: draw.lotteryId,
      selectedNumbers: draw.selectedNumbers,
      winningNumbers: draw.winningNumbers,
      drawDate: draw.drawDate,
      prizePool: draw.prizePool,
      status: draw.status,
    };
  }
} 