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

@Injectable()
export class SnapshotBuilderService {
  constructor(
    @InjectModel(Snapshot.name) private snapshotModel: Model<Snapshot>,
    @InjectModel(Balance.name) private balanceModel: Model<Balance>,
    private readonly balancesService: BalancesService,
    private readonly blockchainProvider: BlockchainProviderService
  ) {}

  async buildSnapshotFromBlock(snapshotArguments: SnapshotArguments, workflowContext: WorkflowContext): Promise<void> {
    const timestamp = new Date();
    const tokenHolders = await this.balancesService.getTokenHolders(timestamp);
    // const tokenHoldersAccounts = tokenHolders.map(holder => holder.accountAddress).join(', ');
    // console.log(`tokenHoldersAccounts: ${tokenHoldersAccounts}`)
    // Fetch the previous snapshot
    
    console.log(`building snapshot from block ${snapshotArguments.startBlock}, on ${workflowContext.network}`)
    // const previousSnapshot = await this.snapshotModel.findOne().sort({ timestamp: -1 }).exec();
    const latestBalances = await this.balancesService.getLatestBalances(snapshotArguments.tokenAddress)
    console.log(`latestBalances: ${latestBalances}`)
    const provider = this.blockchainProvider.getProvider(workflowContext.network);

    // const blockNumber = snapshotArguments.startBlock;
    const startBlock = snapshotArguments.startBlock;
    const latestBlock = await provider.getBlockNumber();
    if (startBlock > latestBlock) { 
      console.warn(`startBlock ${startBlock} is greater than latestBlock ${latestBlock}, skipping snapshot creation`);
      return;
    }
    const toBlock = latestBlock
    // Fetch all ERC20 transfers from blockNumber
    const transfers = await this.fetchERC20Transfers(snapshotArguments.startBlock, toBlock, snapshotArguments.tokenAddress, workflowContext);

    // Create a new snapshot based on the previous snapshot and the new transfers
    console.info(`Snapshot to be created properties: tokenAddress: ${snapshotArguments.tokenAddress}, metwork: ${snapshotArguments.network}, blockNumber: ${snapshotArguments.startBlock}`);
    const newSnapshot = new this.snapshotModel({
      timestamp: new Date(),
      tokenAddress: snapshotArguments.tokenAddress,
      network: snapshotArguments.network,
      blockNumber: toBlock,
      signature: '0x1', //TODO: generate signature
      workflowWalletAddress: workflowContext.walletAddress
    });
    
    const updatedBalances = [];

    // Update balances based on transfers
    for (const transfer of transfers) {
      const { from, to, value, tokenAddress } = transfer;

      // Update sender's balance
      const updatedSenderBalance = await this.balancesService.update(from, -value, newSnapshot._id.toString(), snapshotArguments);
      updatedBalances.push(updatedSenderBalance);

      // Update receiver's balance
      const updatedReceiverBalance = await this.balancesService.update(to, value, newSnapshot._id.toString(), snapshotArguments);
      updatedBalances.push(updatedReceiverBalance);
    }

    // Put balances in the DB for the rest of the token holders
    for (const holder of tokenHolders.filter(holder => !updatedBalances.some(ub => ub.accountAddress === holder.accountAddress))) {
      const { accountAddress, balance } = holder;
      await this.balancesService.update(accountAddress, balance, newSnapshot._id.toString(), snapshotArguments);
    }

    // Save the new snapshot
    await newSnapshot.save();
  }

  private async fetchERC20Transfers(fromBlock: number, toBlock: number, tokenAddress: string, workflowContext: WorkflowContext): Promise<any[]> {
    const provider = this.blockchainProvider.getProvider(workflowContext.network);

    const iface = new ethers.utils.Interface([
      "event Transfer(address indexed from, address indexed to, uint256 value)"
    ]);
    const logs = [];
    const blockLimit = 1000; // Define the block limit per fetch
    let currentBlock = fromBlock;

    while (true) {
      const toBlockTmp = Math.min(currentBlock + blockLimit, toBlock);
      const filter = {
        fromBlock: currentBlock,
        toBlock: toBlockTmp,
        address: tokenAddress,
        topics: [
          ethers.utils.id("Transfer(address,address,uint256)")
        ]
      };
      console.log(`fetching ERC20 transfers from block ${currentBlock} to ${toBlockTmp}, on ${workflowContext.network}`)
      const fetchedLogs = await provider.getLogs(filter);
      console.log(`fetched ${fetchedLogs.length} logs from block ${currentBlock} to ${toBlockTmp}, on ${workflowContext.network}`)
      logs.push(...fetchedLogs);

      if (toBlock === toBlockTmp) {
        break;
      }

      currentBlock += blockLimit;
    }

    const transfers = logs.map(log => {
      const parsedLog = iface.parseLog(log);
      return {
        from: parsedLog.args.from,
        to: parsedLog.args.to,
        value: parsedLog.args.value.toString(),
        tokenAddress: log.address
      };
    });

    return transfers;
  }
}
