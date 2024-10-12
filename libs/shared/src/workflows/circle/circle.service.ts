import { Injectable } from '@nestjs/common';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

@Injectable()
export class CircleService {
  private client: ReturnType<typeof initiateDeveloperControlledWalletsClient>;

  constructor() {
    // console.log(`initializing circle client with api key ${process.env.CIRCLE_API_KEY} and entity secret ${process.env.CIRCLE_ENTITY_SECRET}`)
    this.client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET
    });
    this.init()
    
  }

  async init() {
    const response = await this.client.getPublicKey()
    const pem = response.data.publicKey
    
    const forge = require('node-forge')

    const entitySecret = forge.util.hexToBytes('YOUR_ENTITY_SECRET');

    const publicKey = forge.pki.publicKeyFromPem(pem);

    const encryptedData = publicKey.encrypt(entitySecret, 'RSA-OAEP', { md: forge.md.sha256.create(), mgf1: { md: forge.md.sha256.create(), }, });

    console.log(forge.util.encode64(encryptedData)) 


  }

  async createWallet(walletSetId: string) {
    const response = await this.client.createWallets({
      blockchains: ['ETH-SEPOLIA'],
      count: 1,
      walletSetId: walletSetId
    });
    return response[0];
  }
}