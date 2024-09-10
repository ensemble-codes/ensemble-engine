import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Abi extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Object, required: true })
  abi: object[];
}

export const AbiSchema = SchemaFactory.createForClass(Abi);
