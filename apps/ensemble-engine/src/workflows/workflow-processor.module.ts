import { Module } from '@nestjs/common';
import { WorkflowProcessorService } from './workflow-processor.service';
import { WorkflowsModule } from 'apps/ensemble-service/src/workflows/workflows.module';
import { BlockchainProviderModule } from '../blockchain-provider/blockchain-provider.module';
import { AbiModule } from 'apps/ensemble-service/src/abi/abi.module';
import { DexModule } from '../modules/dex/dex.module';
import { TriggersService } from './triggers.service';
import { ConditionsService } from './conditions.service';
import { TransactionsManagerModule } from '../transactions/transactions-manager.module';
import { ModulesModule } from '../modules/manager/modules.module';
import { CircleModule } from 'libs/shared/src/workflows/circle/circle.module';
@Module({
  imports: [
    WorkflowsModule,
    BlockchainProviderModule,
    AbiModule,
    DexModule,
    TransactionsManagerModule,
    ModulesModule,
    CircleModule,
  ],
  providers: [TriggersService, WorkflowProcessorService, ConditionsService],
})
export class WorkflowProcessorModule {}
