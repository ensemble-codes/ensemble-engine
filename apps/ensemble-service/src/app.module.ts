import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { WorkflowsModule } from './workflows/workflows.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AbiModule } from './abi/abi.module';
import { WalletsModule } from './wallets/wallets.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    WorkflowsModule,
    WalletsModule,
    AbiModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
