import { Module } from '@nestjs/common';
import { WalletsService } from '../../../../libs/shared/src/wallets/wallets.service';
import { Wallet, WalletSchema } from 'libs/shared/src/wallets/schemas/wallet.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletsController } from './wallets.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }])
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
