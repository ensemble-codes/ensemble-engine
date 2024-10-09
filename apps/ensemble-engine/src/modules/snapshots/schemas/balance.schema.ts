import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Balance extends Document {
  
  @Prop({ required: true })
  balance: number;

  @Prop({ required: true })
  tokenAddress: string;

  @Prop({ required: true })
  accountAddress: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: 'ObjectId', ref: 'Snapshot', required: true })
  snapshot: Types.ObjectId;
}

export const BalanceSchema = SchemaFactory.createForClass(Balance);
