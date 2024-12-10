import { Module } from '@nestjs/common';
import { StakingService } from './staking.service';
import { WalletsModule } from 'apps/ensemble-service/src/wallets/wallets.module';

@Module({
  imports: [WalletsModule],
  controllers: [],
  providers: [StakingService],
  exports: [StakingService],
})
export class StakingModule {}
