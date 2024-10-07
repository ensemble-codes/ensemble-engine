import { Injectable } from '@nestjs/common';
import { Wallet } from 'ethers';
import { WalletsService } from 'libs/shared/src/wallets/wallets.service';
import { BlockchainProviderService } from '../blockchain-provider/blockchain-provider.service';
import { WorkflowInstanceEntity } from 'libs/shared/src/workflows/entities/instance.entity';

@Injectable()
export class TransactionsManagerService {

  constructor(
    private readonly walletsService: WalletsService,
    private readonly providerService: BlockchainProviderService,
  ) {}

  
  async sendTransaction(tx: any, workflowInstance: WorkflowInstanceEntity) {
    const provider = this.providerService.getProvider(workflowInstance.getCurrentNetwork());
    const wallet = await this.getSignerWallet(workflowInstance.getWalletAddress(), provider);

    // Send the signed transaction
    try {
      console.log(`Sending transaction: ${JSON.stringify(tx)}. from wallet: ${wallet.address}`);
      const txResponse = await wallet.sendTransaction(tx);
      console.log('Transaction sent:', txResponse.hash);
  
      // Wait for the transaction to be mined
      const receipt = await txResponse.wait();
      console.log('Transaction mined:', receipt);
    } catch (error) {
      console.error('Error sending transaction:', error);
    }

  }

  async getSignerWallet(walletAddress: string, provider: any): Promise<Wallet> {
    const walletData = await this.walletsService.findOne(walletAddress, true);
    const signer = new Wallet(walletData.privateKey, provider);
    return signer;
  }
  
}