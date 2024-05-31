import { Injectable } from '@nestjs/common';
import { ethers, EventFragment, JsonRpcProvider } from 'ethers';
// import fs from 'fs';
import { BlockchainProviderService } from 'src/utils/blockchain-provider/blockchain-provider.service';
import * as fs from 'fs';
// fs.readFileSync('foo.txt','utf8');

@Injectable()
export class VolumeService {
  provider: JsonRpcProvider;
  contract: ethers.Contract;
  tokenAbi: any;

  constructor(private blockchainProviderService: BlockchainProviderService) {
    console.log('GasStrategyService initialized');
    console.log(`Using RPC endpoint: ${process.env.PROVIDER_URL}}`);
    this.provider = blockchainProviderService.getProvider('fuse')

    const abiPath = './abi/erc20.abi.json'
    this.tokenAbi = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
    // this.contract = new ethers.Contract(tokenAddress, abi);

    // this.contract.on('Transfer', (from: string, to: string, value: ethers.BigNumberish, event) => {
    //   console.log(`Transfer event detected: from ${from} to ${to} value ${value.toString()}`);
    // });
  }

  // private async loadAbi() {
  //   const abiPath = './abi/erc20.abi.json';
  //   try {
  //     const abiContent = await fs.readFile(abiPath, 'utf-8');
  //     this.tokenAbi = JSON.parse(abiContent);
  //     console.log('ABI loaded successfully');
  //   } catch (error) {
  //     console.error('Error reading ABI file:', error);
  //   }
  // }

  async fetch(contractAddress: string, tokenAddress: string, network: string): Promise<bigint> {
    const provider = this.blockchainProviderService.getProvider(network);
    const contract = new ethers.Contract(tokenAddress, this.tokenAbi, provider);

    const filter = {
      address: tokenAddress,
      topics: [
        ethers.utils.id('Transfer(address,address,uint256)'),
        ethers.utils.hexZeroPad(contractAddress, 32),
        ethers.utils.hexZeroPad(contractAddress, 32)
      ].filter(Boolean), // Remove null values
    };

    // const transferEventFragment: EventFragment = ethers.EventFragment.fromString('Transfer(address,address,uint256)');
    
    const events = await contract.queryFilter();
    console.log(`Transfer events: ${events.length}`);
    return BigInt(events.length) as bigint;
    // const feeData = await this.provider.getFeeData();
    // console.log(`Gas price: ${feeData.gasPrice}`)
    // return feeData.gasPrice;
  }
}
