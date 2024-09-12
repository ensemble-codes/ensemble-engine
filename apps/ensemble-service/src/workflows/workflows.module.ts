import { Module } from '@nestjs/common';
import { WorkflowsService } from 'libs/shared/src/workflows/services/workflows.service';
import { WorkflowInstancesService } from 'libs/shared/src/workflows/services/instances.service';
import { WorkflowsController } from './controllers/workflows.controller';
import { WorkflowInstancesController } from './controllers/instances.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Workflow, WorkflowSchema } from 'libs/shared/src/workflows/schemas/workflow.schema';
import { WorkflowInstance, WorkflowInstanceSchema } from 'libs/shared/src/workflows/schemas/instance.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Workflow.name, schema: WorkflowSchema }]),
    MongooseModule.forFeature([{ name: WorkflowInstance.name, schema: WorkflowInstanceSchema }]),
  ],
  controllers: [WorkflowsController, WorkflowInstancesController],
  providers: [WorkflowsService, WorkflowInstancesService],
  exports: [WorkflowsService, WorkflowInstancesService],
})
export class WorkflowsModule {}
