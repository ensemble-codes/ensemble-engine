import { Module } from '@nestjs/common';
import { WorkflowsModule } from 'apps/ensemble-service/src/workflows/workflows.module';
import { BlockchainProviderModule } from '../blockchain-provider/blockchain-provider.module';
import { TransactionsManagerService } from './transactions-manager.service';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    WorkflowsModule,
    BlockchainProviderModule,
    WalletsModule
  ],
  providers: [TransactionsManagerService],
  exports: [TransactionsManagerService]
})

export class TransactionsManagerModule {}
