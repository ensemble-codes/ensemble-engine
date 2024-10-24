import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Snapshot } from './schemas/snapshot.schema';
import { Balance } from './schemas/balance.schema';
import { SnapshotArguments } from './entities';
import { WorkflowContext } from 'libs/shared/src/workflows/entities/workflow-context.entity';
import { BlockchainProviderModule } from '../../blockchain-provider/blockchain-provider.module';
import { BlockchainProviderService } from '../../blockchain-provider/blockchain-provider.service';
import { BalancesService } from './services/balances.service';
const ethers = require('ethers');
const erc20Abi = require('./abis/erc20.abi.json');


@Injectable()
export class SnapshotBuilderV2Service {
  constructor(
    @InjectModel(Snapshot.name) private snapshotModel: Model<Snapshot>,
    @InjectModel(Balance.name) private balanceModel: Model<Balance>,
    private readonly balancesService: BalancesService,
    private readonly blockchainProvider: BlockchainProviderService
  ) {}

  async buildSnapshotFromBlock(snapshotArguments: SnapshotArguments, workflowContext: WorkflowContext): Promise<void> {
    const { tokenHolders, tokenAddress, startBlock } = snapshotArguments
    const network = workflowContext.network
    
    console.log(`building snapshot from block ${snapshotArguments.startBlock}, on ${network}`)

    const balances = [];
    const provider = this.blockchainProvider.getProvider(network);

    console.info(`Snapshot to be created properties: tokenAddress: ${tokenAddress}, network: ${network}, blockNumber: ${startBlock}`);
    const newSnapshot = new this.snapshotModel({
      timestamp: new Date(),
      tokenAddress: tokenAddress,
      network: network,
      blockNumber: startBlock,
      signature: '0x1', //TODO: generate signature
      workflowWalletAddress: workflowContext.walletAddress
    });

    for (const holder of tokenHolders) {
      const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
      const tokenBalance = await contract.balanceOf(holder, { blockTag: startBlock });
      console.debug(`Holder: ${holder}, Token Balance: ${tokenBalance.toString()}`);
      await this.balancesService.create({
        accountAddress: holder,
        balance: tokenBalance.toString(),
        snapshot: newSnapshot._id.toString(),
        tokenAddress: tokenAddress,
        network: network
      });
    }


    // Save the new snapshot
    await newSnapshot.save();
  }
}
