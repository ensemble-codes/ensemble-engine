import { Injectable, Inject } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service'; // Adjust the import path as necessary
import { LoadTestCommandDto } from 'src/commands-lib/load-test.dto';
import { CallCommandDto } from 'src/commands-lib/call-command.dto';
import { BlockchainProviderService } from 'src/utils/blockchain-provider/blockchain-provider.service';
import ethers from 'ethers';

function pickRandomValue(arr) {
  if (arr.length === 0) {
      throw new Error('The array cannot be empty');
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
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
      const wallet = new Wallet(fromWallet.privateKey)

      const amount = ethers.utils.parseEther('0.000000001');
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
    const senderWallet = new Wallet(fromWallet.privateKey);
    
    const abi = callCommandDto.contractAbi
    const contract = new Contract(callCommandDto.contractAddress, abi, senderWallet);
    throw new Error('Method not implemented.');
  }
}
