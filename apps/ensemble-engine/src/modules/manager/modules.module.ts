import { Module } from '@nestjs/common';
import { DividentsModule } from '../dividents/dividents.module';
import { ModulesManagerService } from './modules-manager.service';
import { DexModule } from '../dex/dex.module';
import { SnapshotsModule } from '../snapshots/snapshots.module';
import { StakingModule } from '../staking/staking.module';

@Module({
  imports: [DividentsModule, DexModule, SnapshotsModule, StakingModule],
  providers: [ModulesManagerService],
  exports: [ModulesManagerService],
})
export class ModulesModule {}
