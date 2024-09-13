import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WalletDocument = Wallet & Document;

@Schema({ timestamps: true })
export class Wallet {
    @Prop({ required: true })
    groupId: string;

    @Prop({ required: true, unique: true })
    address: string;

    @Prop({ required: true })
    privateKey: string;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);