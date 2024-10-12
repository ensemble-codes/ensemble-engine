import { Module } from '@nestjs/common';
import { WalletsService } from '../../../../libs/shared/src/wallets/wallets.service';
import { Wallet, WalletSchema } from 'libs/shared/src/wallets/schemas/wallet.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletsController } from './wallets.controller';
import { CircleModule } from 'libs/shared/src/workflows/circle/circle.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }]),
    CircleModule
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
