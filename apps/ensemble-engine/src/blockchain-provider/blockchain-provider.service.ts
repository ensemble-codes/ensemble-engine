import { Injectable } from '@nestjs/common';
import { AbiService } from 'apps/ensemble-service/src/abi/abi.service';
import { ContractEntity } from 'libs/shared/src/workflows/entities/contract.entity';
import { Contract, ethers } from 'ethers';
import { getNetwork } from './networks';

@Injectable()
export class BlockchainProviderService {
  private providers: { [networkName: string]: ethers.providers.JsonRpcProvider } = {};
  
  private networkUrls = {
    fuse: process.env.PROVIDER_URL_FUSE,
    sepolia: process.env.PROVIDER_URL_SEPOLIA,
    base_sepolia: process.env.PROVIDER_URL_BASE_SEPOLIA,
    op_sepolia: process.env.PROVIDER_URL_OP_SEPOLIA,
  }

  constructor(
    private readonly abiService: AbiService,
  ) {
    for (const [network, url] of Object.entries(this.networkUrls)) {
      if (url) {
        console.log(`Initializing provider for ${network}.`);
        this.providers[network] = new ethers.providers.JsonRpcProvider(url);
        console.log(`Initialized provider for ${network} with url endpoint: ${url}.`);
      } else {
        console.warn(`RPC URL for ${network} is not set`);
      }
    }
  }


  getProvider(networkName: string): ethers.providers.JsonRpcProvider {
    if (!this.networkUrls[networkName]) {
      const errorMessage = `RPC URL for ${networkName} is not set`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return this.providers[networkName];
  }

  getChainId(networkName: string): number {
    const network = getNetwork(networkName);
    return network.chainId
  }


  async loadContract(contractName: string, contracts: ContractEntity[]) {
    console.log(`loading contract ${contractName}`);
    const contractEntity = contracts.find(c => c.name === contractName);
    if (!contractEntity) {
      throw new Error(`Contract ${contractName} not found`);
    }
    const contractABI = await this.abiService.findByName(contractEntity.abi)
    const provider = this.getProvider(contractEntity.network);
    const contract = new ethers.Contract(contractEntity.address, contractABI.abi, provider);
    console.log(`contract ${contractName} loaded, address: ${contractEntity.address}, network: ${contractEntity.network}`);

    return contract
  }

  async loadEvent(contractName: string, eventName: string, contracts: ContractEntity[]): Promise<string> {
    const contractEntity = contracts.find(c => c.name === contractName);
    if (!contractEntity) {
      throw new Error(`Contract ${contractName} not found`);
    }
    const contractABI = await this.abiService.findByName(contractEntity.abi)
    const eventSignature = this.getEventSignature(contractABI.abi, eventName);
    console.log(`event ${eventName} signature: ${eventSignature}`);
    return eventSignature;
  }

  async fetchTokenDetails(tokenAddress: string, network: string) {
    const provider = this.getProvider(network);
    const chainId = this.getChainId(network);
    const tokenContract = new ethers.Contract(tokenAddress, ['function name() view returns (string)', 'function symbol() view returns (string)', 'function decimals() view returns (uint8)'], provider);
    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const decimals = Number(await tokenContract.decimals());
    return { name, symbol, decimals, address: tokenAddress, chainId }
  }


  // async fetchEvents(tokenAddress: string, network: string, fromBlock: number, toBlock: number) {
  //   const provider = this.getProvider(network);
  //   const tokenContract = new ethers.Contract(tokenAddress, ['event Transfer(address indexed from, address indexed to, uint256 value)'], provider);

  //   const filter = tokenContract.filters.Transfer();
  //   const events = await tokenContract.queryFilter(filter, fromBlock, toBlock);

  //   return events.map(event => ({
  //     from: event.args.from,
  //     to: event.args.to,
  //     value: event.args.value.toString(),
  //     blockNumber: event.blockNumber,
  //     transactionHash: event.transactionHash
  //   }));
  // }


  async fetchEvents(contract: Contract, network: string, eventSignature: string, fromBlock: number, toBlock: number, eventLimit: number = 1000): Promise<any[]> {
    const provider = this.getProvider(network);
    toBlock = Number(toBlock);
    fromBlock = Number(fromBlock);

    // const iface = new ethers.utils.Interface([
    //   "event Transfer(address indexed from, address indexed to, uint256 value)"
    // ]);
    const logs = [];
    const blockLimit = 1000; // Define the block limit per fetch
    let currentBlock = fromBlock;
    let eventCount = 0;
    while (true) {
      const toBlockTmp = Math.min(currentBlock + blockLimit, toBlock);
      const filter = {
        fromBlock: currentBlock,
        toBlock: toBlockTmp,
        address: contract.address,
        topics: [
          eventSignature
        ]
      };
      console.log(`fetching events from block ${currentBlock} to ${toBlockTmp}, on ${network}`)
      const fetchedLogs = await provider.getLogs(filter);
      console.log(`fetched ${fetchedLogs.length} logs from block ${currentBlock} to ${toBlockTmp}, on ${network}`)
      logs.push(...fetchedLogs);

      if (currentBlock === toBlockTmp) {
        console.debug(`Reached toBlock ${toBlockTmp}, stopping fetch`);
        break;
      }

      eventCount+=fetchedLogs.length;
      if (eventCount >= eventLimit) {
        console.debug(`Reached event limit ${eventLimit}, stopping fetch`);
        break;
      }

      currentBlock = Math.min(currentBlock + blockLimit, toBlock);
    }

    // const events = logs.map(log => {
    //   const parsedLog = contract.interface.parseLog(log);
    //   return {
    //     from: parsedLog.args.from,
    //     to: parsedLog.args.to,
    //     value: parsedLog.args.value.toString(),
    //     tokenAddress: log.address
    //   };
    // });

    return logs
  }

  getEventSignature(abi, eventName) {
    // Find the event by name in the ABI
    const eventAbi = abi.find((item) => item.type === 'event' && item.name === eventName);

    if (!eventAbi) {
        throw new Error(`Event ${eventName} not found in ABI`);
    }

    // Construct the event signature
    const inputs = eventAbi.inputs.map(input => input.type).join(',');
    const signature = `${eventAbi.name}(${inputs})`;

    // Return the keccak256 hash of the event signature (the event topic)
    return ethers.utils.id(signature);
}
}
