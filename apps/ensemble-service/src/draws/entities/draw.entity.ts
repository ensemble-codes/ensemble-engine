import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum DrawStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Draw extends Document {
  @Prop({ required: true, unique: true })
  drawId: number;

  @Prop({ required: true, type: [Number] })
  winningNumbers: number[];

  @Prop({ required: true })
  drawDate: Date;

  @Prop({ required: true })
  prizePool: string;

  @Prop({ required: true, enum: DrawStatus, default: DrawStatus.PENDING })
  status: DrawStatus;

  @Prop({ type: Map, of: String })
  prizes: Map<string, string>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const DrawSchema = SchemaFactory.createForClass(Draw); 