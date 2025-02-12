import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SubscriptionOption, NumberPickingStrategy } from '../dto/subscription.dto';

@Schema({ timestamps: true })
export class Subscription extends Document {
  @Prop({ required: true, unique: true })
  ownerAddress: string;

  @Prop({ required: true, enum: SubscriptionOption, type: Number })
  subscriptionOption: SubscriptionOption;

  @Prop({ required: true })
  totalTickets: number;

  @Prop({ required: true })
  totalDraws: number;

  @Prop({ required: true })
  ticketsRemaining: number;

  @Prop({ required: true })
  drawsRemaining: number;

  @Prop({ required: true })
  ticketsPerDraw: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  discount: number;

  @Prop({ required: true })
  subscriptionAddress: string;

  @Prop({ required: true, enum: NumberPickingStrategy, type: Number, default: NumberPickingStrategy.RANDOM })
  numberPickingStrategy: NumberPickingStrategy;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription); 
