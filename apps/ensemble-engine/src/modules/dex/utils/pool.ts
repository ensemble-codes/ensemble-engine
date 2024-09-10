// import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { ethers, providers } from 'ethers'
import { CreateTradeDto } from '../dto/create-trade.dto'

// import { SupportedChainId, Token } from '@uniswap/sdk-core'
// import { SUPPORTED_CHAINS, Token } from '@uniswap/sdk-core'
import { FeeAmount, computePoolAddress } from '@uniswap/v3-sdk'

import { SUPPORTED_CHAINS, Token } from '@voltage-finance/sdk-core'
// import { FeeAmount, computePoolAddress } from '@voltage-finance/v3-sdk'
import IUniswapV3PoolABI from '../abis/IUniswapV3Pool.abi.json'
import IUniswapFactroyABI from '../abis/IUniswapV3Factory.abi.json'

// import { POOL_FACTORY_CONTRACT_ADDRESS } from './constants'
// import { getProvider } from './providers'

// interface PoolInfo {
//   token0: string
//   token1: string
//   fee: number
//   tickSpacing: number
//   sqrtPriceX96: ethers.BigNumber
//   liquidity: ethers.BigNumber
//   tick: number
// }

export async function getPoolInfo(createTradeDto: CreateTradeDto, provider: providers.Provider) {
  const chainId = createTradeDto.dex.chainId

  console.log(createTradeDto.tokenIn.decimals)
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

  let poolAddress
  if (chainId === 122) {
    console.log('chainId', chainId)
    console.log('factoryAddress', createTradeDto.dex.factoryAddress)
    const factoryContract = new ethers.Contract(createTradeDto.dex.factoryAddress, IUniswapFactroyABI, provider)
    // console.log(createTradeDto.tokenIn.address, createTradeDto.tokenOut.address, FeeAmount.MEDIUM)
    poolAddress = await factoryContract.getPool(TOKEN_IN.address, TOKEN_OUT.address, FeeAmount.MEDIUM)
    console.log('poolAddress', poolAddress)
  
  } else {
    console.log('using uniswap sdk')
    poolAddress = computePoolAddress({
      factoryAddress: createTradeDto.dex.factoryAddress,
      tokenA: TOKEN_IN,
      tokenB: TOKEN_OUT,
      fee: FeeAmount.MEDIUM,  
    })
  }


  console.log('currentPoolAddress ', poolAddress)

  const poolContract = new ethers.Contract(
    poolAddress,
    IUniswapV3PoolABI,
    provider
  )

  const [token0, token1, fee, tickSpacing, liquidity, slot0] =
    await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
      poolContract.tickSpacing(),
      poolContract.liquidity(),
      poolContract.slot0(),
    ])

  console.log('token0:', token0)
  console.log('token1:', token1)
  console.log('fee:', fee)
  console.log('tickSpacing:', tickSpacing)
  console.log('liquidity:', liquidity)
  console.log('slot0:', slot0[0].toString())

  return {
    token0,
    token1,
    fee,
    tickSpacing,
    liquidity,
    sqrtPriceX96: slot0[0],
    tick: parseInt(slot0[1].toString()),
  }
}