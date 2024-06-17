import { Injectable } from '@nestjs/common';
import {  } from 'src/queries/gas-price/gas-price.service';
import { Command } from '../commands/schemas/command.schema';
import { ExecutorService } from 'src/executor/executor.service';
import { BaseCommandExecutor } from './base-command-executor';
import { CommandsService } from '../commands/commands.service';
import { VolumeService } from 'src/queries/volume/volume.service';
import ethers, { BaseWallet, SigningKey } from 'ethers';
const routerABI = ['function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory)'];

@Injectable()
export class DexActivityCommandExecutor extends BaseCommandExecutor {
  constructor(private readonly volumeService: VolumeService,
    private readonly executorService: ExecutorService,
    commandsService: CommandsService
  ) {
    super(commandsService);
  }

  async executeImpl(command: Command) : Promise<void> {
    const { network, goal } = command
    const firstTokenAddress = goal.params['first_token_address']
    const secondTokenAddress = goal.params['second_token_address']
    const contractAddress = goal.params['contract_address']
    console.log((`Dex activity for ${contractAddress}, tokens: ${firstTokenAddress} and ${secondTokenAddress}`))
    console.log('Checking Command Gas');
    const walletPk = process.env.DEPOSIT_ACCOUNT_PRIVATE_KEY;
    const walletAddress = '0x2c37691967de1A1E4eE68ae4D745059720A6dB7F'
    if (!walletPk) {
      throw new Error('WALLET_PRIVATE_KEY is not set in the environment variables');
    }

    try {
      await this.executorService.executeSwap(
        firstTokenAddress,
        secondTokenAddress,
        contractAddress,
        walletAddress,
        walletPk,
        network
      );
    } catch (error) {
      console.log(error)
    }



    // const volume = await this.volumeService.fetch(contractAddress, tokenAddress, network)
    // console.log({ volume })
    // console.log(maxGasPrice)
    // const diff = gasPrice - BigInt(maxGasPrice);
    // if (diff > 0) {
      // console.log(`Gas price is ${diff} over the limit`);
      // await this.executorService.sendNativeBatch(command.groupId, process.env.DEPOSIT_AMOUNT, network)
    // }
  }
}
