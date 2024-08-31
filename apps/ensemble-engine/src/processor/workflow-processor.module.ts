import { Module } from '@nestjs/common';
import { WorkflowProcessorService } from './workflow-processor.service';
import { WorkflowInstancesService } from 'apps/ensemble-service/src/workflows/services/instances.service';
// import { WorkflowsModule } from 'apps/ensemble-service/src/workflows/workflows.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Workflow, WorkflowSchema } from 'apps/ensemble-service/src/workflows/schemas/workflow.schema';
import { WorkflowInstance, WorkflowInstanceSchema } from 'apps/ensemble-service/src/workflows/schemas/instance.schema';
import { WorkflowsModule } from 'apps/ensemble-service/src/workflows/workflows.module';
import { BlockchainProviderModule } from '../blockchain-provider/blockchain-provider.module';
import { Abi } from 'apps/ensemble-service/src/abi/schemas/abi.schema';
import { AbiModule } from 'apps/ensemble-service/src/abi/abi.module';
// import { WorkflowsModule } from 'src/workflows/workflows.module';
// import { WorkflowEngineService } from './workflow-engine.service';
// import { BlockchainProviderModule } from 'src/utils/blockchain-provider/blockchain-provider.module';
// import { WalletModule } from 'src/wallet/wallet.module';
@Module({
  imports: [
    // MongooseModule.forFeature([{ name: Workflow.name, schema: WorkflowSchema }]),
    // MongooseModule.forFeature([{ name: WorkflowInstance.name, schema: WorkflowInstanceSchema }]),
    WorkflowsModule,
    BlockchainProviderModule,
    AbiModule
  ],
  providers: [WorkflowProcessorService]
})

export class WorkflowProcessorModule {}
