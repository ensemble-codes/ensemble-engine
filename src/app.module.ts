import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
