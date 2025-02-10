import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DrawResponseDto } from './dto/draw.dto';
import { Draw, DrawStatus } from './entities/draw.entity';

@Injectable()
export class DrawsService {
  constructor(
    @InjectModel(Draw.name)
    private drawModel: Model<Draw>,
  ) {}

  async getDraw(drawId: number): Promise<DrawResponseDto> {
    const draw = await this.drawModel.findOne({ drawId }).exec();
    
    if (!draw) {
      throw new NotFoundException(`Draw with ID ${drawId} not found`);
    }

    return {
      drawId: draw.drawId,
      winningNumbers: draw.winningNumbers,
      drawDate: draw.drawDate,
      prizePool: draw.prizePool,
      status: draw.status,
    };
  }

  async getLatestDraw(): Promise<DrawResponseDto> {
    const draw = await this.drawModel
      .findOne({ status: DrawStatus.COMPLETED })
      .sort({ drawId: -1 })
      .exec();

    if (!draw) {
      throw new NotFoundException('No completed draws found');
    }

    return {
      drawId: draw.drawId,
      winningNumbers: draw.winningNumbers,
      drawDate: draw.drawDate,
      prizePool: draw.prizePool,
      status: draw.status,
    };
  }

  async getAllDraws(ownerAddress: string): Promise<DrawResponseDto[]> {
    if (!ownerAddress || !ownerAddress.startsWith('0x')) {
      throw new Error('Invalid owner address');
    }

    // Here we would typically join with a tickets collection to get draws
    // where the user participated, but for now we'll just get all completed draws
    const draws = await this.drawModel
      .find({ status: DrawStatus.COMPLETED })
      .sort({ drawId: -1 })
      .exec();

    return draws.map(draw => ({
      drawId: draw.drawId,
      winningNumbers: draw.winningNumbers,
      drawDate: draw.drawDate,
      prizePool: draw.prizePool,
      status: draw.status,
    }));
  }
} 