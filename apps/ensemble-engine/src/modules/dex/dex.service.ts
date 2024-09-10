import { Injectable } from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { CreateTrade } from './utils/trading';
import { BlockchainProviderService } from '../../blockchain-provider/blockchain-provider.service';
import { Dex, DexArguments, DexDefaults } from './entities';
import {getDexDefaults } from './constants/dexes';
@Injectable()
export class DexService {

  constructor(
    private readonly providerService: BlockchainProviderService,
  ) {}


  async swap(dexArguments: DexArguments) {
    console.log(dexArguments)
    const dexData = this.getDexData(dexArguments.dexName, dexArguments.network)


    const tokenIn = await this.providerService.fetchTokenDetails(dexArguments.tokenInAddress, dexData.network)
    const tokenOut = await this.providerService.fetchTokenDetails(dexArguments.tokenOutAddress, dexData.network)

    const createTradeDto : CreateTradeDto = {
      tokenIn,
      tokenOut,
      tokenInAmount: dexArguments.tokenInAmount,
      dex: dexData,
      receiverAddress: dexArguments.receiverAddress
    }

    const provider = this.providerService.getProvider(dexData.network);
    const createTrade = new CreateTrade(provider, dexData);
    const methodParams = await createTrade.create(createTradeDto);
    const methodData = methodParams.calldata;
    const target = dexData.universalRouterAddress || dexData.routerAddress;
    return [target, methodData, dexData.network]
  }

  getDexData(dexName: string, dexNetwork: string): Dex {
    const dexDefaults : DexDefaults = getDexDefaults(dexName, dexNetwork)
    return {
      ...dexDefaults,
      chainId: this.providerService.getChainId(dexDefaults.network)
    }
  }

}