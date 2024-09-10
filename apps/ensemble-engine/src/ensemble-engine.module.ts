import { Module } from '@nestjs/common';
import { WorkflowProcessorModule } from './processor/workflow-processor.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

console.log('process.env.MONGODB_URI', process.env.MONGODB_URI);
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

