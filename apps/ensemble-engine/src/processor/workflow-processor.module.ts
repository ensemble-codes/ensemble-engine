import { Module } from '@nestjs/common';
import { WorkflowProcessorService } from './workflow-processor.service';
import { WorkflowsModule } from 'apps/ensemble-service/src/workflows/workflows.module';
import { BlockchainProviderModule } from '../blockchain-provider/blockchain-provider.module';
import { AbiModule } from 'apps/ensemble-service/src/abi/abi.module';
import { WalletsModule } from '../wallets/wallets.module';
@Module({
  imports: [
    WorkflowsModule,
    BlockchainProviderModule,
    AbiModule,
    WalletsModule,
  ],
  providers: [WorkflowProcessorService]
})

export class WorkflowProcessorModule {}
