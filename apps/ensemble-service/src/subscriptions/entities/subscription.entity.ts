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
  subscriptionAddress: string;

  @Prop({ required: true, enum: NumberPickingStrategy, type: Number })
  numberPickingStrategy: NumberPickingStrategy;

  @Prop({ required: true })
  ticketsRemaining: number;

  @Prop({ required: true })
  drawsRemaining: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription); 