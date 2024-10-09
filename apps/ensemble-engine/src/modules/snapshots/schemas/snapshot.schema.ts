import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Snapshot extends Document {
  
  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: Number })
  blockNumber: number;

  @Prop({ required: true })
  tokenAddress: string;

  @Prop({ required: true })
  network: string;

  @Prop({ required: true })
  signature: string;

  @Prop({ required: true })
  workflowWalletAddress: string;
}

export const SnapshotSchema = SchemaFactory.createForClass(Snapshot);
