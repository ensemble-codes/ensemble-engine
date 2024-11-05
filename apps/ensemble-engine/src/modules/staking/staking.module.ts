import { Module } from '@nestjs/common';
import { StakingService } from './staking.service';
import { StakingController } from './staking.controller';

@Module({
  controllers: [StakingController],
  providers: [StakingService],
})
export class StakingModule {}
