import { Injectable } from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { CreateTrade } from './utils/trading';
import { BlockchainProviderService } from '../../blockchain-provider/blockchain-provider.service';
import { Dex, DexArguments, DexDefaults } from './entities';
import {getDexDefaults } from './constants/dexes';
import { BigNumber, ethers } from 'ethers';
import Permit2ABI from './abis/Permit2.abi.json';
import { WorkflowInstanceEntity } from 'libs/shared/src/workflows/entities/instance.entity';
import { TransactionsManagerService } from '../../transactions/transactions-manager.service';
@Injectable()
export class DexService {

  constructor(
    private readonly providerService: BlockchainProviderService,
    private readonly transactionsManagerService: TransactionsManagerService,
  ) {}


  async swap(dexArguments: DexArguments, instance: WorkflowInstanceEntity) {
    console.info(`Swapping ${dexArguments.tokenInAmount} ${dexArguments.tokenInAddress} for ${dexArguments.tokenOutAddress} on ${dexArguments.dexName} dex. network: ${dexArguments.network}`)
    const dexData = this.getDexData(dexArguments.dexName, dexArguments.network)
    console.debug('dexData', dexData)

    const tokenIn = await this.providerService.fetchTokenDetails(dexArguments.tokenInAddress, dexData.network)
    const tokenOut = await this.providerService.fetchTokenDetails(dexArguments.tokenOutAddress, dexData.network)

    const createTradeDto : CreateTradeDto = {
      tokenIn,
      tokenOut,
      tokenInAmount: dexArguments.tokenInAmount,
      dex: dexData,
      receiverAddress: dexArguments.receiverAddress
    }

    const isFulfilled = await this.checkPreconditions(dexData, createTradeDto, instance)
    if (!isFulfilled) {
      console.error('Preconditions not met, waiting for approval')
      return
    }
    const provider = this.providerService.getProvider(dexData.network);
    const createTrade = new CreateTrade(provider, dexData);
    const methodParams = await createTrade.create(createTradeDto);
    const methodData = methodParams.calldata;
    const target = dexData.universalRouterAddress || dexData.routerAddress;


    const txRequest = {
      to: target,
      value: methodParams.value,
      data: methodData
    };

    await this.transactionsManagerService.sendTransaction(txRequest, instance);
  }

  // async process(method: string, dexArguments: DexArguments) {
  //   switch (method) {
  //     case 'swap':
  //       return this.swap(dexArguments)
  //     default:
  //       console.error(`Unknown method: ${method}`);
  //       return false;
  //   }
  // }

  async checkPreconditions(dex: Dex, createTradeDto: CreateTradeDto, instance: WorkflowInstanceEntity) {
    const provider = this.providerService.getProvider(dex.network)
    const permit2Contract = new ethers.Contract(dex.permit2Address, Permit2ABI, provider);
    console.info(`calling allowance on permit2 contract [${permit2Contract.address}], args: ${createTradeDto.receiverAddress}, ${createTradeDto.tokenIn.address}, ${dex.routerAddress}`)
    const allowance = await permit2Contract.allowance(createTradeDto.receiverAddress, createTradeDto.tokenIn.address, dex.universalRouterAddress)
    if (allowance < createTradeDto.tokenInAmount) {
      console.error(`Insufficient allowance for ${createTradeDto.tokenInAmount} ${createTradeDto.tokenIn.symbol}`)
      
      const maxAmount = BigNumber.from(2).pow(160).sub(1);
      const maxExpiration = BigNumber.from(2).pow(48).sub(1);

      console.info(`Encoding appprove for permit2 [${permit2Contract.address}], args: ${createTradeDto.tokenIn.address} ${dex.universalRouterAddress} ${maxAmount}, ${maxExpiration}`)
      const methodData = permit2Contract.interface.encodeFunctionData('approve', [createTradeDto.tokenIn.address, dex.universalRouterAddress, maxAmount, maxExpiration]);

      const txRequest = {
        to: permit2Contract.address,
        value: 0,
        data: methodData
      };

      this.transactionsManagerService.sendTransaction(txRequest, instance);
      return false;
    }
    return true
  }

  getDexData(dexName: string, dexNetwork: string): Dex {
    const dexDefaults : DexDefaults = getDexDefaults(dexName, dexNetwork)
    return {
      ...dexDefaults,
      chainId: this.providerService.getChainId(dexDefaults.network)
    }
  }

}