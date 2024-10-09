import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Snapshot } from './schemas/snapshot.schema';
import { Balance } from './schemas/balance.schema';
const ethers = require('ethers');

@Injectable()
export class SnapshotBuilderService {
  constructor(
    @InjectModel(Snapshot.name) private snapshotModel: Model<Snapshot>,
    @InjectModel(Balance.name) private balanceModel: Model<Balance>,
  ) {}

  async buildSnapshotFromBlock(blockNumber: number): Promise<void> {
    // Fetch the previous snapshot
    const previousSnapshot = await this.snapshotModel.findOne().sort({ timestamp: -1 }).exec();

    // Fetch all ERC20 transfers from blockNumber
    const transfers = await this.fetchERC20TransfersFromBlock(blockNumber);

    // Create a new snapshot based on the previous snapshot and the new transfers
    const newSnapshot = new this.snapshotModel({
      timestamp: new Date(),
      tokenAddress: previousSnapshot.tokenAddress,
      signature: '0x1', //TODO: generate signature
      workflowWalletAddress: previousSnapshot.workflowWalletAddress,
    });

    // Update balances based on transfers
    for (const transfer of transfers) {
      const { from, to, value, tokenAddress } = transfer;

      // Update sender's balance
      await this.updateBalance(from, tokenAddress, -value, newSnapshot);

      // Update receiver's balance
      await this.updateBalance(to, tokenAddress, value, newSnapshot);
    }

    // Save the new snapshot
    await newSnapshot.save();
  }

  private async fetchERC20TransfersFromBlock(blockNumber: number): Promise<any[]> {
    const provider = new ethers.providers.JsonRpcProvider('YOUR_INFURA_OR_ALCHEMY_URL');

    const filter = {
      fromBlock: blockNumber,
      toBlock: blockNumber,
      topics: [
        ethers.utils.id("Transfer(address,address,uint256)")
      ]
    };

    const logs = await provider.getLogs(filter);
    const iface = new ethers.utils.Interface([
      "event Transfer(address indexed from, address indexed to, uint256 value)"
    ]);

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

  private async updateBalance(account: string, tokenAddress: string, value: number, snapshot: Snapshot): Promise<void> {
    const balance = await this.balanceModel.findOne({ accountAddress: account, tokenAddress }).exec();

    if (balance) {
      balance.balance += value;
      balance.timestamp = new Date();
      balance.snapshot.set(snapshot.id, snapshot.signature);
      await balance.save();
    } else {
      const newBalance = new this.balanceModel({
        balance: value,
        tokenAddress,
        accountAddress: account,
        timestamp: new Date(),
        snapshot: new Map([[snapshot.id, snapshot.signature]]),
      });
      await newBalance.save();
    }
  }
}
