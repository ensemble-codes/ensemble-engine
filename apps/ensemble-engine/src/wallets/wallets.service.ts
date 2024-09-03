import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wallet } from './schemas/wallet.schema';
import { Wallet as EthersWallet } from 'ethers';
import { group } from 'console';
import { Workflow } from 'apps/ensemble-service/src/workflows/entities/workflow.entity';
// import { Step } from 'src/workflows/entities/step.entity';
// import { Workflow } from 'src/workflows/entities/workflow.entity';

const generateId = () =>  Math.random().toString(16).slice(2)

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>
  ) {}

  /**
   * Creates a specified number of Ethereum wallets and groups them under a unique identifier.
   * Each wallet is randomly generated.
   * 
   * @param {number} numberOfWallets - The number of wallets to create.
   * @returns {string} The identifier for the group of created wallets. This identifier can be used to retrieve the group.
   */
  createWallets(numberOfWallets: number) {
    const groupId = generateId()
    for (let i = 0; i < numberOfWallets; i++) {
      const wallet = EthersWallet.createRandom()
      console.log(`generating wallet with address ${wallet.address}`)
      const newWallet = new this.walletModel({
        groupId,
        address: wallet.address,
        privateKey: wallet.privateKey
      });
      // TODO: Maybe add await here
      newWallet.save();
    }
    return groupId
  }

  // async loadWallet(step: Step, workflow: Workflow): Promise<Wallet> {
  //   console.log(`loading wallet for workflow ${workflow.name}, wallet data: ${JSON.stringify(workflow.wallet)}`)
  //   const wallets = await this.getWalletsByGroup(workflow.wallet.group)

  //   const randomIndex = Math.floor(Math.random() * wallets.length);
  //   return wallets[randomIndex];
  // }

    /**
   * Retrieves a group of wallets by their identifier.
   * @param {string} id - The identifier of the wallet group.
   * @returns {Wallet[]} An array of wallets if the group is found.
   * @throws {NotFoundException} Throws if no group is found for the given ID.
   */
    async getWalletsByGroup(groupId: string): Promise<Wallet[]> {
      const wallets = await this.walletModel.find({ groupId }).exec();
      if (!group) {
        throw new NotFoundException(`Wallet group with ID ${groupId} not found.`);
      }
      return wallets;
    }


    /**
   * Picks a random wallet from a specified group.
   * @param {string} groupId - The identifier of the wallet group.
   * @returns {Promise<Wallet>} A randomly selected wallet from the group.
   * @throws {NotFoundException} Throws if no group is found for the given ID.
   */
  async getWalletByWorkflow(workflow: Workflow): Promise<Wallet> {
    console.log(`getting wallet by workflow  ${workflow.name}`)
    const { address } = workflow.wallet
    return this.getWallet(address);
    // const wallets = await this.getWalletsByGroup(groupId);
    // if (wallets.length === 0) {
    //   throw new NotFoundException(`No wallets found for group ${groupId}`);
    // }
    // const randomIndex = Math.floor(Math.random() * wallets.length);
    // return wallets[randomIndex];
  }

  /**
   * Retrieves a wallet by its address.
   * @param {string} address - The Ethereum address of the wallet.
   * @returns {Promise<Wallet>} The wallet document if found.
   * @throws {NotFoundException} Throws if no wallet is found for the given address.
   */
    async getWallet(address: string): Promise<Wallet> {
      const wallet = await this.walletModel.findOne({ address }).exec();
      if (!wallet) {
          throw new NotFoundException(`Wallet with address ${address} not found.`);
      }
      return wallet;
    }

    async getAllGroupIds(): Promise<string[]> {
      const groups = await this.walletModel.distinct('groupId').exec();
      return groups;
    }
}
