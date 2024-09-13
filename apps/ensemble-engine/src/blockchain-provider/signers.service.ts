import { Injectable } from '@nestjs/common';
import { Wallet } from 'ethers';
import { WalletsService } from '../../../../libs/shared/src/wallets/wallets.service';
import { Workflow } from 'libs/shared/src/workflows/entities/workflow.entity';

@Injectable()
export class SignersService {
  constructor(private readonly walletsService: WalletsService) {}

  async getSignerWallet(workflow: Workflow, provider: any): Promise<Wallet> {
    const walletData = await this.walletsService.getWalletByWorkflow(workflow);
    const signer = new Wallet(walletData.privateKey, provider);
    return signer;
  }
}
