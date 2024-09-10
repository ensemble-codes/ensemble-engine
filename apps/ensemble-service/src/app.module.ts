import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { WorkflowsModule } from './workflows/workflows.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AbiModule } from './abi/abi.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    WorkflowsModule,
    AbiModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
