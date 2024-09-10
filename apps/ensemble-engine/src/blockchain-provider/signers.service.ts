import { Injectable } from '@nestjs/common';
import { Wallet } from 'ethers';
import { WalletsService } from '../wallets/wallets.service';
import { Workflow } from 'apps/ensemble-service/src/workflows/entities/workflow.entity';

@Injectable()
export class SignersService {
  constructor(private readonly walletsService: WalletsService) {}

  async getSignerWallet(workflow: Workflow, provider: any): Promise<Wallet> {
    const walletData = await this.walletsService.getWalletByWorkflow(workflow);
    const signer = new Wallet(walletData.privateKey, provider);
    return signer;
  }
}
