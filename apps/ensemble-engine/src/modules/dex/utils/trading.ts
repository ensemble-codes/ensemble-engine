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
  SwapOptions,
  SwapQuoter,
  SwapRouter,
  TickMath,
  Trade,
} from '@uniswap/v3-sdk'
// import { ethers } from 'ethers'
import JSBI from 'jsbi' 

// // import {
// //   ERC20_ABI,
// //   QUOTER_CONTRACT_ADDRESS,
// //   SWAP_ROUTER_ADDRESS,
// //   TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER,
// // } from './constants'
// // import { MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS } from './constants'
import { getPoolInfo } from './pool'
// // import {
// //   getProvider,
// //   getWalletAddress,
// //   sendTransaction,
// //   TransactionState,
// // } from './providers'
// import { fromReadableAmount } from './utils'

export type TokenTrade = Trade<Token, Token, TradeType>
// import { FeeAmount } from '@uniswap/v3-sdk'
import { CreateTradeDto } from '../dto/create-trade.dto'
import { AbiCoder, ethers, Provider } from 'ethers'

// Trading Functions

export class CreateTrade {

  constructor(private readonly provider: Provider) {}

  async create(createTradeDto: CreateTradeDto) {
    const poolInfo = await getPoolInfo(createTradeDto, this.provider)
    const chainId = 122

    console.log('poolInfo', poolInfo)
    
    // const tokenIn = {
    //   address: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
    //   decimals: 18,
    //   name: 'unknown',
    //   symbol: 'unknown'
    // }


    const TOKEN_IN = new Token(
      chainId,
      createTradeDto.tokenInAddress,
      18,
      'WETH',
      'Wrapped Ether'
    )
    
    const TOKEN_OUT = new Token(
      chainId,
      createTradeDto.tokenOutAddress,
      6,
      'USDC',
      'USD//C'
    )
    // console.log(poolInfo.tick >= TickMath.MIN_TICK)
    // console.log(poolInfo.tick <= TickMath.MAX_TICK)
    // console.log(Number.isInteger(poolInfo.tick))
    // console.log(!(poolInfo.tick >= TickMath.MIN_TICK && poolInfo.tick <= TickMath.MAX_TICK && Number.isInteger(poolInfo.tick)) ?  'ERRROR'  : void 0)

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
    console.log(amountOut.constructor.name)
    const uncheckedTrade = Trade.createUncheckedTrade({
      route: swapRoute,
      inputAmount: CurrencyAmount.fromRawAmount(
        TOKEN_IN,
        createTradeDto.tokenInAmount),
      outputAmount: CurrencyAmount.fromRawAmount(
        TOKEN_OUT,
        // amountOut.toBigInt()
        amountOut.toString()
        // JSBI.BigInt(amountOut.toBigInt())
      ),
      tradeType: TradeType.EXACT_INPUT,
    })
    console.log('uncheckedTrade', uncheckedTrade)


    const options: SwapOptions = {
      slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
      deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
      recipient: '0x42f090f0Bf7aA467b16BB75633F3F8160647A7f6',
    }

    const methodParameters = SwapRouter.swapCallParameters([uncheckedTrade], options)


    return methodParameters
  }

  // async executeTrade(
  //   trade: TokenTrade
  // ): Promise<TransactionState> {
  //   const walletAddress = getWalletAddress()
  //   const provider = getProvider()

  //   if (!walletAddress || !provider) {
  //     throw new Error('Cannot execute a trade without a connected wallet')
  //   }

  //   // // Give approval to the router to spend the token
  //   // const tokenApproval = await getTokenTransferApproval(tokenIn)

  //   // // Fail if transfer approvals do not go through
  //   // if (tokenApproval !== TransactionState.Sent) {
  //   //   return TransactionState.Failed
  //   // }

  //   const options: SwapOptions = {
  //     slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
  //     deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
  //     recipient: walletAddress,
  //   }

  //   const methodParameters = SwapRouter.swapCallParameters([trade], options)

  //   const tx = {
  //     data: methodParameters.calldata,
  //     to: SWAP_ROUTER_ADDRESS,
  //     value: methodParameters.value,
  //     from: walletAddress,
  //     // maxFeePerGas: MAX_FEE_PER_GAS,
  //     // maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  //   }

  //   const res = await sendTransaction(tx)

  //   return res
  // }

// Helper Quoting and Pool Functions

async getOutputQuote(route: Route<Currency, Currency>, tokenIn: Currency, amountIn: string): Promise<string> {
  if (!this.provider) {
    throw new Error('Provider required to get pool state')
  }
  console.log('rawAmount',     CurrencyAmount.fromRawAmount(
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
    to: '0x10c8a73987069b366c2bea9c8070DCF2F3E73e9D',
    data: calldata,
  })

  const r = AbiCoder.defaultAbiCoder().decode(['uint256'], quoteCallReturnData)
  return r[0]
}

// export async function getTokenTransferApproval(
//   token: Token
// ): Promise<TransactionState> {
//   const provider = getProvider()
//   const address = getWalletAddress()
//   if (!provider || !address) {
//     console.log('No Provider Found')
//     return TransactionState.Failed
//   }

//   try {
//     const tokenContract = new ethers.Contract(
//       token.address,
//       ERC20_ABI,
//       provider
//     )

//     const transaction = await tokenContract.populateTransaction.approve(
//       SWAP_ROUTER_ADDRESS,
//       fromReadableAmount(
//         TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER,
//         token.decimals
//       ).toString()
//     )

//     return sendTransaction({
//       ...transaction,
//       from: address,
//     })
//   } catch (e) {
//     console.error(e)
//     return TransactionState.Failed
//   }
}