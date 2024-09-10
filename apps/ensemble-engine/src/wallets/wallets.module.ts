import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { Wallet, WalletSchema } from './schemas/wallet.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }])
  ],
  controllers: [],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
