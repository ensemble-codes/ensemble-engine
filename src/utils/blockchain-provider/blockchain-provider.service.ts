import { Injectable } from '@nestjs/common';
import ethers from 'ethers';

@Injectable()
export class BlockchainProviderService {
  private providers: { [networkName: string]: ethers.providers.JsonRpcProvider } = {};

  constructor() {
    const networkUrls = {
      fuse: process.env.PROVIDER_URL_FUSE,
      op_sepolia: process.env.PROVIDER_URL_OP_SEPOLIA,
    }
    for (const [network, url] of Object.entries(networkUrls)) {
      if (url) {
        this.providers[network] = new ethers.providers.JsonRpcProvider(url);
        console.log(`Initialized provider for ${network}`);
      } else {
        console.warn(`RPC URL for ${network} is not set`);
      }
    }
  }


  getProvider(networkName: string): ethers.providers.JsonRpcProvider {
    return this.providers[networkName];
  }
}
