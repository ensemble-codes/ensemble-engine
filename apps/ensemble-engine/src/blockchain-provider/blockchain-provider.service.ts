import { Injectable } from '@nestjs/common';
import { AbiService } from 'apps/ensemble-service/src/abi/abi.service';
import { Workflow } from 'apps/ensemble-service/src/workflows/entities/workflow.entity';
import { ethers, JsonRpcProvider } from 'ethers';

@Injectable()
export class BlockchainProviderService {
  private providers: { [networkName: string]: JsonRpcProvider } = {};

  constructor(
    private readonly abiService: AbiService,
  ) {
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


  async loadContract(contractName: string, workflow: Workflow) {
    console.log(`loading contract ${contractName} for workflow ${workflow.name}`);
    const { contracts } = workflow;
    const contractEntity = contracts.find(c => c.name === contractName);
    const contractABI = await this.abiService.findByName(contractEntity.abi)
    const provider = this.getProvider(contractEntity.network);
    const contract = new ethers.Contract(contractEntity.address, contractABI.abi, provider);
    return contract
  }
}
