import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { WorkflowsModule } from './workflows/workflows.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AbiModule } from './abi/abi.module';
import { WalletsModule } from './wallets/wallets.module';
import { AuthModule } from './auth/auth.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { DrawsModule } from './draws/draws.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    AuthModule,
    WorkflowsModule,
    WalletsModule,
    AbiModule,
    SubscriptionsModule,
    DrawsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
