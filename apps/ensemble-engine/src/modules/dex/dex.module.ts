import { Module } from '@nestjs/common';
import { DexService } from './dex.service';
import { BlockchainProviderModule } from '../../blockchain-provider/blockchain-provider.module';
import { TransactionsManagerModule } from '../../transactions/transactions-manager.module';

@Module({
  imports: [BlockchainProviderModule, TransactionsManagerModule],
  providers: [DexService],
  exports: [DexService]
})
export class DexModule {}
