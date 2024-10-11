import { Module } from '@nestjs/common';
import { DividentsService } from './services/dividents.service';
import { DividentsController } from './dividents.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { Snapshot, SnapshotSchema } from '../snapshots/schemas/snapshot.schema';
import { Balance, BalanceSchema } from '../snapshots/schemas/balance.schema';
import { SnapshotBuilderService } from '../snapshots/snapshot-builder.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Snapshot.name, schema: SnapshotSchema }]),
    MongooseModule.forFeature([{ name: Balance.name, schema: BalanceSchema }]),
  ],
  controllers: [DividentsController],
  providers: [DividentsService],
})

export class DividentsModule {}
