import {
  Currency,
  CurrencyAmount,
  Percent,
  Token,
  TradeType,
} from '@uniswap/sdk-core'

import {
  FeeAmount,
  Pool,
  Route,
  SwapQuoter,
  Trade,
} from '@uniswap/v3-sdk'
// import { ethers } from 'ethers'
import { Trade as RouterTrade } from '@uniswap/router-sdk'

import {
  UniswapTrade,
  SwapRouter
} from "@uniswap/universal-router-sdk";
import { getPoolInfo } from './pool'


export type TokenTrade = Trade<Token, Token, TradeType>
import { CreateTradeDto } from '../dto/create-trade.dto'
import { ethers, providers } from 'ethers'
import { Dex } from '../entities'

// Trading Functions

export class CreateTrade {

  constructor(private readonly provider: providers.Provider, private readonly dex: Dex) {}

  async create(createTradeDto: CreateTradeDto) {
    const poolInfo = await getPoolInfo(createTradeDto, this.provider)
    const { chainId } = createTradeDto.dex

    console.log('poolInfo', poolInfo)
    console.log('createTradeDto.tokenIn.decimals', createTradeDto.tokenIn.decimals) 
    console.log('createTradeDto.tokenIn.decimals', typeof createTradeDto.tokenIn.decimals)
    const TOKEN_IN = new Token(
      chainId,
      createTradeDto.tokenIn.address,
      createTradeDto.tokenIn.decimals,
      createTradeDto.tokenIn.symbol,
      createTradeDto.tokenIn.name
    )
    
    const TOKEN_OUT = new Token(
      chainId,
      createTradeDto.tokenOut.address,
      createTradeDto.tokenOut.decimals,
      createTradeDto.tokenOut.symbol,
      createTradeDto.tokenOut.name
    )

    const pool = new Pool(
      TOKEN_IN,
      TOKEN_OUT,
      FeeAmount.MEDIUM,
      poolInfo.sqrtPriceX96.toString(),
      poolInfo.liquidity.toString(),
      poolInfo.tick
    )

    const swapRoute = new Route(
      [pool],
      TOKEN_IN,
      TOKEN_OUT
    )

    console.log('swapRoute', swapRoute)
    const amountOut = await this.getOutputQuote(swapRoute, TOKEN_IN, createTradeDto.tokenInAmount)
    console.log('amountOut', amountOut)

    const inputAmount = CurrencyAmount.fromRawAmount(
      TOKEN_IN,
      createTradeDto.tokenInAmount)

    const outputAmount = CurrencyAmount.fromRawAmount(
      TOKEN_OUT,
      amountOut.toString()
    )

    const uncheckedTrade = Trade.createUncheckedTrade({
      route: swapRoute,
      inputAmount,
      outputAmount,
      tradeType: TradeType.EXACT_INPUT,
    })
    console.log('uncheckedTrade', uncheckedTrade)



    const options = { slippageTolerance: new Percent(50, 10_000), recipient: createTradeDto.receiverAddress }
    const routerTrade = new UniswapTrade(
      new RouterTrade({ v3Routes: [{ routev3: swapRoute, outputAmount, inputAmount }], tradeType: TradeType.EXACT_INPUT }),
      options
    )
    // // Use the raw calldata and value returned to call into Universal Swap Router contracts
    const methodParameters = SwapRouter.swapCallParameters(routerTrade)
    console.log('methodParameters', methodParameters)
    // // const options: SwapOptions = {
    // //   slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
    // //   deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    // //   recipient: createTradeDto.receiverAddress,
    // // }

    // const methodParameters = SwapRouter.swapCallParameters([uncheckedTrade], options)


    return methodParameters
  }

// Helper Quoting and Pool Functions

  async getOutputQuote(route: Route<Currency, Currency>, tokenIn: Currency, amountIn: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider required to get pool state')
    }
    console.log('rawAmount', CurrencyAmount.fromRawAmount(
      tokenIn,
      amountIn
    ).toFixed())
    const { calldata } = await SwapQuoter.quoteCallParameters(
      route,
      CurrencyAmount.fromRawAmount(
        tokenIn,
        amountIn
      ),
      TradeType.EXACT_INPUT,
      {
        useQuoterV2: true,
      }
    )

    const quoteCallReturnData = await this.provider.call({
      to: this.dex.quoterAddress,
      data: calldata,
    })

    const r = ethers.utils.defaultAbiCoder.decode(['uint256'], quoteCallReturnData)
    return r[0]
  }
}