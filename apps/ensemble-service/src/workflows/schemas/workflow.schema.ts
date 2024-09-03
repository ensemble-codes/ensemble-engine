import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { WalletEntity } from '../entities/wallet.entity'
import { Step } from '../entities/step.entity'
import { ContractEntity } from '../entities/contract.entity'

@Schema({ timestamps: true })
export class Workflow extends Document {
  
  @Prop()
  name: string;

  @Prop()
  version: string;

  @Prop()
  wallet: WalletEntity;

  @Prop()
  steps: [ Step ];

  @Prop()
  contracts: [ ContractEntity ];
}

export const WorkflowSchema = SchemaFactory.createForClass(Workflow);
