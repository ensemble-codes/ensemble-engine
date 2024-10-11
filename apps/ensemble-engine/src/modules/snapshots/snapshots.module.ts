import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SnapshotBuilderService } from './snapshot-builder.service';
import { Snapshot, SnapshotSchema } from './schemas/snapshot.schema';
import { Balance, BalanceSchema } from './schemas/balance.schema';
import { SnapshotModuleEntry } from './snapshots.entry';
import { SnapshotsService } from './snapshots.service';
import { BlockchainProviderModule } from '../../blockchain-provider/blockchain-provider.module';
import { BalancesService } from './services/balances.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Snapshot.name, schema: SnapshotSchema }]),
    MongooseModule.forFeature([{ name: Balance.name, schema: BalanceSchema }]),
    BlockchainProviderModule,
  ],
  providers: [SnapshotBuilderService, SnapshotModuleEntry, SnapshotsService, BalancesService],
  exports: [SnapshotModuleEntry],
})
export class SnapshotsModule {}
