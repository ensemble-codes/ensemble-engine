import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum DrawStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Draw extends Document {
  @Prop({ required: true })
  lotteryId: number;

  @Prop({ required: true })
  subscriptionId: string;

  @Prop({ required: true, type: [[Number]] })
  selectedNumbers: number[][];

  @Prop({ required: true })
  drawDate: Date;

  @Prop({ required: true })
  prizePool: string;

  @Prop({ required: true, enum: DrawStatus, default: DrawStatus.PENDING })
  status: DrawStatus;

  @Prop({ type: Map, of: String })
  winningNumbers: number[];
}

export const DrawSchema = SchemaFactory.createForClass(Draw); 