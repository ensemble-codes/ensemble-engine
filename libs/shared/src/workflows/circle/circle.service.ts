import { Injectable } from '@nestjs/common';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

@Injectable()
export class CircleService {
  private client: ReturnType<typeof initiateDeveloperControlledWalletsClient>;

  constructor() {
    console.log(`initializing circle client with api key ${process.env.CIRCLE_API_KEY} and entity secret ${process.env.CIRCLE_ENTITY_SECRET}`)
    this.client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET
    });
  }

  async createWallet() {
    console.log(`creating circle wallet`)
    const response = await this.client.createWallets({
      blockchains: ['ETH-SEPOLIA'],
      count: 1,
      walletSetId: process.env.CIRCLE_WALLET_SET_ID
    });
    const wallet = response.data.wallets[0]
    console.log(`wallet created: ${JSON.stringify(wallet)}`)
    return { address: wallet.address, groupId: wallet.walletSetId };
  }

  async sendTransaction(walletId: string, contractAddress: string, methotdArgs, methodArgs: any[]) {
    const response = await this.client.createContractExecutionTransaction({
      walletId,
      contractAddress,
      abiFunctionSignature: methotdArgs,
      abiParameters: methodArgs,
      fee: {
        type: 'level',
        config: {
          feeLevel: 'MEDIUM'
        }
      }
    });
    return response;
  }
}
