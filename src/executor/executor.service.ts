import { Injectable, Inject } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service'; // Adjust the import path as necessary
import { ethers, BaseWallet, SigningKey, Provider, Contract, Interface, AbiCoder } from 'ethers';
import { LoadTestCommandDto } from 'src/commands-lib/load-test.dto';
import { CallCommandDto } from 'src/commands-lib/call-command.dto';
import { BlockchainProviderService } from 'src/utils/blockchain-provider/blockchain-provider.service';

import { CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core'
import { Trade as V2TradeSDK } from '@uniswap/v2-sdk'
import { Route as V2RouteSDK, Pair } from '@uniswap/v2-sdk'

import { Pool, Route, Trade as V3Trade } from '@uniswap/v3-sdk'
import { MixedRouteTrade, MixedRouteSDK, Trade as RouterTrade } from '@uniswap/router-sdk'
import { FeeAmount } from '@uniswap/v3-sdk'
import { computePoolAddress } from '@uniswap/v3-sdk' 
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import Quoter from 'abi/Quoter.json'
import { BigintIsh } from '@uniswap/sdk-core';

import {
  SwapRouter,
  UniswapTrade,
} from "@uniswap/universal-router-sdk";

function pickRandomValue(arr) {
  if (arr.length === 0) {
      throw new Error('The array cannot be empty');
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

function fromReadableAmount(
  amount: number,
  decimals: number
) {
  return ethers.parseUnits(amount.toString(), decimals)
}

@Injectable()
export class ExecutorService {
  private depositAccount: BaseWallet;
  private provider: Provider;

  constructor(private walletService: WalletService, private blockchainProviderService: BlockchainProviderService) {
    // console.log(`Using RPC endpoint: ${process.env.PROVIDER_URL}}`);
    // this.provider = new JsonRpcProvider(process.env.PROVIDER_URL)
    // this.depositAccount = new BaseWallet(new SigningKey(process.env.DEPOSIT_ACCOUNT_PRIVATE_KEY), this.provider);
  }
  

  async getPoolInfo(poolContract) {
    const [fee, liquidity, slot0] =
    await Promise.all([
        poolContract.fee(),
        poolContract.liquidity(),
        poolContract.slot0(),
    ])

    return {
        fee,
        liquidity,
        sqrtPriceX96: slot0[0],
        tick: slot0[1],
    } 
}

  async executeSwap(tokenInAddress: string, tokenOutAddress: string, routerAddress: string, walletAddress: string, walletPk: string, network: string) {
    try {
      console.log(`Arguments - tokenInAddress: ${tokenInAddress}, tokenOutAddress: ${tokenOutAddress}, routerAddress: ${routerAddress}, walletAddress: ${walletAddress}, walletPk: ${walletPk}, network: ${network}`);
    const poolFee = FeeAmount.LOWEST;

    const provider = this.blockchainProviderService.getProvider(network);

    const currentPoolAddress = '0xA230d867572E80F69467D7B88bEB7Af2E429863f'; // Adjust this to the appropriate pool address
    console.log(`pool address: ${currentPoolAddress}`);

    const poolContract = new Contract(currentPoolAddress, IUniswapV3PoolABI.abi, provider);

    console.log(`pool contract: ${poolContract}`);

    const poolInfo = await this.getPoolInfo(poolContract);
    console.log({ poolInfo })
    // WBNB
    const token0 = new Token(56, tokenInAddress, 18, 'WBNB');
    // PAX
    const token1 = new Token(56, tokenOutAddress, 18, 'PAX');

    const pool = new Pool(token0, token1, poolFee, poolInfo.sqrtPriceX96.toString(), poolInfo.liquidity.toString(), -74192);
    const swapRoute = new Route([pool], token0, token1);

    // const amountIn = fromReadableAmount(0.00002, 18);
    // const quotedAmountOut = await provider.call({
    //   to: '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997', // Quoter contract address
    //   data: new ethers.Interface(Quoter).encodeFunctionData('quoteExactInputSingle', [tokenInAddress, tokenOutAddress, amountIn, poolFee, 0]),
    // });

    const quoterContract = new Contract(
      '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997',
      Quoter,
      provider
    )

    const amountIn = fromReadableAmount(
      0.00002,
      18
    ).toString()

    console.log(`Arguments for quoteExactInputSingle:`);
    console.log(`tokenInAddress: ${tokenInAddress}`);
    console.log(`tokenOutAddress: ${tokenOutAddress}`);
    console.log(`amountIn: ${amountIn}`);
    console.log(`poolFee: ${poolFee}`);
    console.log(`sqrtPriceLimitX96: 0`);

    const quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall([
      tokenInAddress,
      tokenOutAddress,
      amountIn,
      FeeAmount.LOWEST,
      0]
    )
    console.log( quotedAmountOut[0])
    
    const amountOut = AbiCoder.defaultAbiCoder().decode(['uint256'], 100);
    return
    const uncheckedTrade = V3Trade.createUncheckedTrade({
      route: swapRoute,
      inputAmount: CurrencyAmount.fromRawAmount(token0, amountIn.toString()),
      outputAmount: CurrencyAmount.fromRawAmount(token1, amountOut.toString()),
      tradeType: TradeType.EXACT_INPUT,
    });
    return 

    const options = { slippageTolerance: new Percent(10, 10000), deadline: Math.floor(Date.now() / 1000) + 60 * 20, recipient: walletAddress };
    const v3Routes = [{
        routev3: uncheckedTrade.route,
        inputAmount: uncheckedTrade.inputAmount,
        outputAmount: uncheckedTrade.outputAmount,
    }]
    
    console.log({ v3Routes })
    const routerTrade = new UniswapTrade(
      new RouterTrade({ v2Routes: [], v3Routes, mixedRoutes: [], tradeType: TradeType.EXACT_INPUT }),
      options
    );
    console.log({routerTrade })

    // const methodParameters = SwapRouter.swapCallParameters([routerTrade], options);

    // const wallet = new BaseWallet(new SigningKey(walletPk), provider);

    // const txResponse = await wallet.sendTransaction({
    //   to: routerAddress,
    //   data: methodParameters.calldata,
    //   value: methodParameters.value,
    //   gasLimit: 4000000, // Adjust gas limit as needed
    // });

    // console.log(`Transaction hash: ${txResponse.hash}`);
    } catch (error) {
      console.log(error)
    }
  }

  async executeSwap2(tokenInAddress: string, tokenOutAddress: string, routerAddress: string, walletAddress: string, walletPk: string, network: string) {
    console.log(`Arguments - tokenInAddress: ${tokenInAddress}, tokenOutAddress: ${tokenOutAddress}, routerAddress: ${routerAddress}, walletAddress: ${walletAddress}, walletPk: ${walletPk}, network: ${network}`);
    const poolFee = FeeAmount.LOWEST

    // const currentPoolAddress = computePoolAddress({
    //   factoryAddress: routerAddress,
    //   tokenA: PAX_TOKEN,
    //   tokenB: WBNB_TOKEN,
    //   fee: exampleConfig.tokens.poolFee,
    //   chainId: 56
    // })
    const currentPoolAddress = '0xA230d867572E80F69467D7B88bEB7Af2E429863f'
    console.log(`pool address: ${currentPoolAddress}`)

    const provider = this.blockchainProviderService.getProvider(network); 

    const poolContract = new Contract(
      currentPoolAddress,
      IUniswapV3PoolABI.abi,
      provider
    )

    console.log(`pool contract: ${poolContract}`)

    // const [token0] = await Promise.all([
    //   poolContract.token0(),
    // ])

    // console.log(`token0: ${token0}`)

    const quoterContract = new Contract(
      '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997',
      Quoter,
      provider
    )

    console.log(`quoterContract: ${quoterContract}`)
    
    const amountIn = fromReadableAmount(
      0.00002,
      18
    ).toString()
    console.log(`Arguments for quoteExactInputSingle:`);
    console.log(`tokenInAddress: ${tokenInAddress}`);
    console.log(`tokenOutAddress: ${tokenOutAddress}`);
    console.log(`amountIn: ${amountIn}`);
    console.log(`poolFee: ${poolFee}`);
    console.log(`sqrtPriceLimitX96: 0`);

    // quoterContract.QuoteExactInputSingleParams.getFragment

    // const abiDecoder = AbiCoder.defaultAbiCoder()
    // console.log( quoterContract.QuoteExactInputSingleParams)
    // abiDecoder.decode()
    const quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall([
      tokenInAddress,
      tokenOutAddress,
      amountIn,
      FeeAmount.LOWEST,
      0]
    )

    console.log(`quotedAmountOut: ${quotedAmountOut}`)

    // const options = { slippageTolerance: 0.01, recipient: walletAddress }
    // const options = { slippageTolerance: 0.01 }
    const token0 = new Token(56, tokenInAddress, 18, 't0')
    const token1 = new Token(56, tokenOutAddress, 18, 't1')


    const pair_0_1 = new Pair(CurrencyAmount.fromRawAmount(token0, '100'), CurrencyAmount.fromRawAmount(token1, '0.1'))
    const currency: CurrencyAmount<Token> = null
    const inputAmount = CurrencyAmount.fromRawAmount(token0, '0.1')
    const outputAmount = CurrencyAmount.fromRawAmount(token1, '0.1')
    const routev2: V2RouteSDK<Token, Token> = new V2RouteSDK([pair_0_1], token0, token1);
    const routeTrade = new RouterTrade({ v2Routes: [{routev2, inputAmount, outputAmount: null }], v3Routes: [], tradeType: TradeType.EXACT_INPUT });

    // Adjusting options to match expected type by converting slippageTolerance to Percent type
    const options = { slippageTolerance: new Percent(10, 10000) };
    const routerTrade = new UniswapTrade(routeTrade, options);
    console.log(routerTrade)

    const { calldata, value } = SwapRouter.swapCallParameters(routerTrade)
    console.log(calldata, value)
  
    // const wallet = new Wallet(walletPk);
    const wallet = new BaseWallet(new SigningKey(walletPk), provider);

    const txResponse = await wallet.sendTransaction({
      to: routerAddress,
      value,
      data: calldata
    });
    console.log(txResponse)
    //   inputAmount: CurrencyAmount.fromRawAmount(token0, '100'),
    //   outputAmount: CurrencyAmount.fromRawAmount(token1, '200'),
    //   tradeType: TradeType.EXACT_INPUT
    // }, options);
    //   tokenInAddress,
    //   tokenOutAddress,
    //   CurrentConfig.tokens.poolFee,
    //   poolInfo.sqrtPriceX96.toString(),
    //   poolInfo.liquidity.toString(),
    //   poolInfo.tick
    // )

    // const swapRoute = new Route(
    //   [poolContract],
    //   tokenInAddress,
    //   tokenOutAddress
    // )

  

    // console.log(`token1: ${token1}`)
    // console.log(`fee: ${fee}`)
    // console.log(`liquidity: ${liquidity}`)
    // console.log(`slot0: ${slot0}`)

//     const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
// const poolContract = new ethers.Contract(
//   currentPoolAddress,
//   IUniswapV3PoolABI.abi,
//   provider
// )

    console.log(currentPoolAddress)
  }
  

  async sendNativeBatch(groupId: string, amount: string, network: string) {
    // Implementation of task execution
    const provider = this.blockchainProviderService.getProvider(network);
    const depositAccount = new BaseWallet(new SigningKey(process.env.DEPOSIT_ACCOUNT_PRIVATE_KEY), provider);

    console.log(`Deposit account address: ${depositAccount.address}`);
    const wallets = await this.walletService.getWalletsByGroup(groupId);
    let nonce = await this.provider.getTransactionCount(this.depositAccount.address);

    const transactionPromises = wallets.map(async (wallet, index) => {
      console.log(`Transferring funds to wallet: ${wallet.address}, using nonce: ${nonce + index}`);
      const txResponse = await this.depositAccount.sendTransaction({
        to: wallet.address,
        value: amount,
        nonce: nonce + index,
        gasPrice: process.env.GAS_PRICE || undefined,
        gasLimit: 21000
      });
      console.log(`Transaction hash: ${txResponse.hash}`);
      // Wait for the transaction to be confirmed
      const receipt = await txResponse.wait();
      console.log(`Transaction confirmed: ${receipt.hash}`);
    });

    await Promise.all(transactionPromises);
    console.log('All transactions confirmed');
    // fetch a deposit account and use it to transfer funds to the wallets
    // console.log(`Onboarding wallets: ${wallets}`);
  }

  async executeLoadTest(commandDto: LoadTestCommandDto) {
    const  { groupId } = commandDto
    const wallets = await this.walletService.getWalletsByGroup(groupId);

    const start = new Date()
    
    const nOfTransctions = 100
    for (let i=0; i < nOfTransctions; i++) {
      const fromWallet = pickRandomValue(wallets)
      const toWallet = pickRandomValue(wallets)
      // const wallet = new Wallet(fromWallet.privateKey)
      const wallet = new BaseWallet(new SigningKey(fromWallet.privateKey));


      const amount = ethers.parseEther('0.000000001');
      console.log(`Transferring funds from ${fromWallet.address} to ${toWallet.address}`);
      const txResponse = await wallet.sendTransaction({
        to: toWallet.address,
        value: amount,
        gasLimit: 21000
      });
      console.log(`Transaction hash: ${txResponse.hash}`);
    }
    const end = new Date()
    
    // assogn a group ID to the command or onb  oard the command
    // take two wallets from the group
    // send a transaction from one wallet to another

  }

  async executeCall(callCommandDto: CallCommandDto) {
    // Implementation of task execution
    const fromWallet = await this.walletService.getWallet(callCommandDto.fromWalletAddress);
    const senderWallet = new BaseWallet(new SigningKey(fromWallet.privateKey));
    const abi = callCommandDto.contractAbi
    const contract = new Contract(callCommandDto.contractAddress, abi, senderWallet);
    throw new Error('Method not implemented.');
  }


  async executeSwapOld(tokenInAddress: string, tokenOutAddress: string, routerAddress: string, routerABI: any, walletPk: string, network: string) {
    console.log(`Arguments - tokenInAddress: ${tokenInAddress}, tokenOutAddress: ${tokenOutAddress}, routerAddress: ${routerAddress}, routerABI: ${routerABI}, walletPk: ${walletPk}, network: ${network}`);
    const provider = this.blockchainProviderService.getProvider(network); // Assuming 'ethereum' is the network name
    console.log(`Provider: ${provider}`);
    const wallet = new BaseWallet(new SigningKey(walletPk), provider);

    // Amounts
    const amountIn = ethers.parseUnits('0.01', 18); // Amount of tokenIn to swap (in wei)
    const amountOutMin = ethers.parseUnits('0.1', 18); // Minimum amount of tokenOut to receive (in wei)

    // Path
    const path = [tokenInAddress, tokenOutAddress]; // Path to swap from tokenIn to tokenOut

    // Deadline
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

    const router = new Contract(routerAddress, routerABI, wallet);

    // Approve tokens for spending
    const tokenIn = new Contract(tokenInAddress, ['function approve(address spender, uint amount) returns (bool)'], wallet);
    await tokenIn.approve(routerAddress, amountIn);

    // Execute swap
    const tx = await router.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        path,
        wallet.address,
        deadline,
        { gasLimit: 4000000 } // Adjust gas limit as needed
    );

    // const options = { slippageTolerance, recipient }
    // const routerTrade = new UniswapTrade(
    //   new RouterTrade({ v2Routes, v3Routes, mixedRoutes, tradeType: TradeType.EXACT_INPUT },
    //   options
    // )
    // // Use the raw calldata and value returned to call into Universal Swap Router contracts
    // const { calldata, value } = SwapRouter.swapCallParameters(routerTrade)

    // console.log('Transaction hash:', tx.hash);

    // // Wait for confirmation
    // await tx.wait();
    // console.log('Swap successful!');


  }

}
