import { Injectable } from '@nestjs/common';
import { CreateStakingDto } from './dto/create-staking.dto';
import { UpdateStakingDto } from './dto/update-staking.dto';
import { Staking } from './entities/staking.entity';

import { networkIDs } from '@avalabs/avalanchejs';
import { addTxSignatures } from '@avalabs/avalanchejs';
import { utils } from '@avalabs/avalanchejs';
import { Context } from '@avalabs/avalanchejs';
import { pvm } from '@avalabs/avalanchejs';
import { WorkflowInstanceEntity } from 'libs/shared/src/workflows/entities/instance.entity';
import { WalletsService } from 'libs/shared/src/wallets/wallets.service';


@Injectable()
export class StakingService {
  private readonly stakings: Staking[] = [];

  constructor(private readonly walletsService: WalletsService) {
    console.log('StakingService created');
  }
  create(createStakingDto: CreateStakingDto) {
    // TODO: Implement staking creation logic
    return 'This action adds a new staking';
  }

  findAll() {
    return this.stakings;
  }

  findOne(id: number) {
    // TODO: Implement find one staking logic
    return `This action returns a #${id} staking`;
  }

  update(id: number, updateStakingDto: UpdateStakingDto) {
    // TODO: Implement update staking logic
    return `This action updates a #${id} staking`;
  }

  remove(id: number) {
    // TODO: Implement remove staking logic
    return `This action removes a #${id} staking`;
  }

    // TODO: Implement staking with AVAX logic
  async stake(createStakingDto: CreateStakingDto, instance: WorkflowInstanceEntity) {
    console.log('Staking DTO:', createStakingDto);
    const pChainAddress = createStakingDto.P_CHAIN_ADDRESS;
    const avaxPublicUrl = "https://api.avax-test.network"
    if (!pChainAddress) {
      throw new Error('Missing staking parameters.');
    }

    const walletAddress = instance.getWalletAddress();
    const walletData = await this.walletsService.findOne(walletAddress, true);
    const { privateKey } = walletData;
    const pvmapi = new pvm.PVMApi(avaxPublicUrl);
    const { utxos } = await pvmapi.getUTXOs({ addresses: [pChainAddress] });
    const context = await Context.getContextFromURI(avaxPublicUrl);
    const startTime = await new pvm.PVMApi().getTimestamp();
    const startDate = new Date(startTime.timestamp);
    const start = BigInt(startDate.getTime() / 1000);
    const endTime = new Date(startTime.timestamp);
    endTime.setDate(endTime.getDate() + 2);
    const end = BigInt(endTime.getTime() / 1000);
    const nodeID = 'NodeID-3JPvbn4J4TxpUHwe8giH7HK1uzQnNUPYJ';

    const tx = pvm.newAddPermissionlessDelegatorTx(
      context,
      utxos,
      [utils.bech32ToBytes(pChainAddress)],
      nodeID,
      networkIDs.PrimaryNetworkID.toString(),
      start,
      end,
      BigInt(1e9),
      [utils.bech32ToBytes(pChainAddress)],
    );

    await addTxSignatures({
      unsignedTx: tx,
      privateKeys: [utils.hexToBuffer(privateKey)],
    });

    return pvmapi.issueSignedTx(tx.getSignedTx());
  }
}
