import { Injectable } from '@nestjs/common';
import { ethers, JsonRpcProvider } from 'ethers';
import { CreateTradeDto } from './dto/create-trade.dto';
import { CreateTrade } from './utils/trading';
import { BlockchainProviderService } from '../../blockchain-provider/blockchain-provider.service';
@Injectable()
export class DexService {

  constructor(
    private readonly providerService: BlockchainProviderService,
  ) {}
  // async swap(tokenIn: Token, tokenOut: Token, amountIn: string, recipient: string) {

  // }

  async swap() {
    const createTradeDto : CreateTradeDto = {
      tokenInAddress: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
      tokenOutAddress: '0x68c9736781E9316ebf5c3d49FE0C1f45D2D104Cd',
      tokenInAmount: '1000000000000000000',
      tokenInDecimals: 18,
      poolFactoryAddress: '0xaD079548b3501C5F218c638A02aB18187F62b207'
    }
    // const tokenIn = {
    //   address: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
    //   decimals: 18,
    //   name: 'unknown',
    //   symbol: 'unknown'
    // }

    const provider = this.providerService.getProvider('fuse');
    const createTrade = new CreateTrade(provider);
    const methodParams = await createTrade.create(createTradeDto);
    const methodData = methodParams.calldata;
    const target = '0xaD079548b3501C5F218c638A02aB18187F62b207';
    return [target, methodData, 'fuse']
  }

}