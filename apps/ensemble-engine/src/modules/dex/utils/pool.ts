// import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { ethers, Provider } from 'ethers'
import { CreateTradeDto } from '../dto/create-trade.dto'

// import { SupportedChainId, Token } from '@uniswap/sdk-core'
// import { SUPPORTED_CHAINS, Token } from '@uniswap/sdk-core'
// import { FeeAmount, computePoolAddress } from '@uniswap/v3-sdk'

import { SUPPORTED_CHAINS, Token } from '@voltage-finance/sdk-core'
import { FeeAmount, computePoolAddress } from '@voltage-finance/v3-sdk'
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

export async function getPoolInfo(createTradeDto: CreateTradeDto, provider: Provider) {
  const chainId = 122
  const WETH_TOKEN = new Token(
    chainId,
    createTradeDto.tokenInAddress,
    18,
    'WETH',
    'Wrapped Ether'
  )
  
  const USDC_TOKEN = new Token(
    chainId,
    createTradeDto.tokenOutAddress,
    6,
    'USDC',
    'USD//C'
  )

  let poolAddress
  if (chainId === 122) {
    console.log('chainId', chainId)
    console.log('createTradeDto.poolFactoryAddress', createTradeDto.poolFactoryAddress)
    const factoryContract = new ethers.Contract(createTradeDto.poolFactoryAddress, IUniswapFactroyABI, provider)
    console.log(WETH_TOKEN.address, USDC_TOKEN.address, FeeAmount.MEDIUM)
    poolAddress = await factoryContract.getPool(WETH_TOKEN.address, USDC_TOKEN.address, FeeAmount.MEDIUM)
    console.log('poolAddress', poolAddress)
  
  } else {
    poolAddress = computePoolAddress({
      factoryAddress: createTradeDto.poolFactoryAddress,
      tokenA: WETH_TOKEN,
      tokenB: USDC_TOKEN,
      fee: FeeAmount.MEDIUM,  
    })
  }


  console.log('currentPoolAddress', poolAddress)

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