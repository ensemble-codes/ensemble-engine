import { Module } from '@nestjs/common';
import { WorkflowProcessorModule } from './workflows/workflow-processor.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    ScheduleModule.forRoot(),
    WorkflowProcessorModule
  ],
  controllers: [],
  providers: [],
})
export class EngineAppModule {}

