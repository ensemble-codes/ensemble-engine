import { Module } from '@nestjs/common';
import { WorkflowProcessorService } from './workflow-processor.service';
import { WorkflowsModule } from 'apps/ensemble-service/src/workflows/workflows.module';
import { BlockchainProviderModule } from '../blockchain-provider/blockchain-provider.module';
import { AbiModule } from 'apps/ensemble-service/src/abi/abi.module';
import { DexModule } from '../modules/dex/dex.module';
import { TriggersService } from './triggers.service';
import { ConditionsService } from './conditions.service';
@Module({
  imports: [
    WorkflowsModule,
    BlockchainProviderModule,
    AbiModule,
    DexModule,
  ],
  providers: [TriggersService, WorkflowProcessorService, ConditionsService],
})

export class WorkflowProcessorModule {}
