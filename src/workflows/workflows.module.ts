import { Module } from '@nestjs/common';
import { WorkflowsService } from './services/workflows.service';
import { WorkflowsController } from './controllers/workflows.controller';
import { WorkflowInstancesController } from './controllers/instances.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Workflow, WorkflowSchema } from './schemas/workflow.schema';
import { WorkflowInstancesService } from './services/instances.service';
import { WorkflowInstance, WorkflowInstanceSchema } from './schemas/instance.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Workflow.name, schema: WorkflowSchema }]),
    MongooseModule.forFeature([{ name: WorkflowInstance.name, schema: WorkflowInstanceSchema }]),
  ],
  controllers: [WorkflowsController, WorkflowInstancesController],
  providers: [WorkflowsService, WorkflowInstancesService],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
