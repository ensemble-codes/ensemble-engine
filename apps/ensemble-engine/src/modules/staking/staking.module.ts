import { Module } from '@nestjs/common';
import { StakingService } from './staking.service';

@Module({
  controllers: [],
  providers: [StakingService],
  exports: [StakingService],
})
export class StakingModule {}
