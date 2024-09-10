import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Wallet extends Document {
    @Prop({ required: true })
    groupId: string;

    @Prop({ required: true, unique: true })
    address: string;

    @Prop({ required: true })
    privateKey: string;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);