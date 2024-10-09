import { WorkflowInstanceEntity } from 'libs/shared/src/workflows/entities/instance.entity';
import { SnapshotBuilderService } from './snapshot-builder.service';
import { SnapshotArguments } from './entities';
import { SnapshotsService } from './snapshots.service';

export class SnapshotModuleEntry {
  constructor(
    private readonly snapshotService: SnapshotsService,
    private readonly snapshotBuilderService: SnapshotBuilderService
  ) {}

  async build(snapshotArguments: SnapshotArguments, instance: WorkflowInstanceEntity): Promise<void> {
    console.log(`Building snapshot for token address: ${snapshotArguments.tokenAddress}`);
    const latestSnapshot = await this.snapshotService.findLatest(snapshotArguments.tokenAddress, snapshotArguments.network);
    if (latestSnapshot) {
      console.log(`Latest snapshot found for token address: ${snapshotArguments.tokenAddress}`);
      const blockNumber = latestSnapshot.blockNumber + 1;
      console.log(`Building snapshot for block number: ${blockNumber}`);
      await this.snapshotBuilderService.buildSnapshotFromBlock(blockNumber);
      console.log(`Snapshot for block number ${blockNumber} built successfully`);
    } else {
      console.log(`No latest snapshot found for token address: ${snapshotArguments.tokenAddress}`);
      await this.snapshotBuilderService.buildSnapshotFromBlock(snapshotArguments.startBlock);
    }
    // get token address contracr blocknumber
    // console.log(`Building snapshot for block number: ${blockNumber}`);
    // await this.snapshotBuilderService.buildSnapshotFromBlock(blockNumber);
    // console.log(`Snapshot for block number ${blockNumber} built successfully`);
  }
}
