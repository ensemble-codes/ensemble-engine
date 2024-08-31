import { Injectable } from '@nestjs/common';
import { JsonRpcProvider } from 'ethers';

@Injectable()
export class BlockchainProviderService {
  private providers: { [networkName: string]: JsonRpcProvider } = {};

  constructor() {
    const networkUrls = {
      fuse: process.env.PROVIDER_URL_FUSE,
      op_sepolia: process.env.PROVIDER_URL_OP_SEPOLIA,
    }
    for (const [network, url] of Object.entries(networkUrls)) {
      if (url) {
        this.providers[network] = new JsonRpcProvider(url);
        console.log(`Initialized provider for ${network} with url endpoint: ${url}`);
      } else {
        console.warn(`RPC URL for ${network} is not set`);
      }
    }
  }


  getProvider(networkName: string): JsonRpcProvider {
    return this.providers[networkName];
  }
}
