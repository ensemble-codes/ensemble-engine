import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Balance } from '../schemas/balance.schema';
import { SnapshotArguments } from '../entities';

@Injectable()
export class BalancesService {
  constructor(
    @InjectModel(Balance.name) private balanceModel: Model<Balance>
  ) {}

  async getBalances(tokenAddress: string, accountAddress: string): Promise<Balance[]> {
    return this.balanceModel.find({ tokenAddress, accountAddress }).exec();
  }

  async getLatestBalance(tokenAddress: string, accountAddress: string): Promise<Balance> {
    return this.balanceModel.findOne({ tokenAddress, accountAddress }).sort({ timestamp: -1 }).exec();
  }


  async getLatestBalances(tokenAddress: string): Promise<Balance[]> {
    return this.balanceModel.aggregate([
      { $match: { tokenAddress } },
      { $sort: { accountAddress: 1, timestamp: -1 } },
      {
        $group: {
          _id: "$accountAddress",
          latestBalance: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$latestBalance" } }
    ]).exec();
  }

  async getAllBalances(): Promise<Balance[]> {
    return this.balanceModel.find().exec();
  }

  async getBalancesBySnapshot(snapshotId: string): Promise<Balance[]> {
    return this.balanceModel.find({ snapshot: snapshotId }).exec();
  }

  async create(balance: Object): Promise<Balance> {
    const newBalance = new this.balanceModel(balance);
    return newBalance.save();
  }


  async update(accountAddress: string, value: number, snapshotId: string, snapshotArguments: SnapshotArguments): Promise<Balance> {
    if (accountAddress === '0x0000000000000000000000000000000000000000') {
      console.log(`accountAddress is 0x0000000000000000000000000000000000000000, mint - skipping update`);
      return;
    }
    const latestBalance = await this.getLatestBalance(snapshotArguments.tokenAddress, accountAddress);
    const balanceValue = latestBalance ? latestBalance.balance + value : value;
    if (latestBalance && latestBalance.snapshot.toString() === snapshotId) {
      latestBalance.balance = balanceValue;
      latestBalance.timestamp = new Date();
      return latestBalance.save();
    } else {
      const newBalance = {
        balance: balanceValue,
        tokenAddress: snapshotArguments.tokenAddress,
        network: snapshotArguments.network,
        accountAddress,
        timestamp: new Date(),
        snapshot: snapshotId
      };
      return this.create(newBalance);
    }


  }

  async getTokenHolders(timestamp: Date): Promise<{ accountAddress: string, balance: number }[]> {
    return this.balanceModel.aggregate([
      { $match: { timestamp: { $lte: timestamp } } },
      { $sort: { accountAddress: 1, timestamp: -1 } },
      {
        $group: {
          _id: "$accountAddress",
          latestBalance: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$latestBalance" } },
      { $match: { balance: { $gt: 0 } } },
      { $project: { _id: 0, accountAddress: 1, balance: 1 } }
    ]).exec();
  }
}
