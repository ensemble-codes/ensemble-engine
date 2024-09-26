import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WalletEntity } from '../entities/wallet.entity'
import { Step } from '../entities/step.entity'
import { ContractEntity } from '../entities/contract.entity'

@Schema({ timestamps: true })
export class Workflow extends Document {
  
  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  version: string;

  @Prop({ type: WalletEntity })
  wallet: WalletEntity;

  @Prop({ type: [Step] })
  steps: Step[];

  @Prop({ type: [ContractEntity] })
  contracts: ContractEntity[];

  @Prop({ type: 'ObjectId', ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isPublic: boolean;
}

export const WorkflowSchema = SchemaFactory.createForClass(Workflow);
