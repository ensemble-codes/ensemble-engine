import { Injectable } from '@nestjs/common';
import { BlockchainProviderService } from '../blockchain-provider/blockchain-provider.service';
import { Trigger } from 'libs/shared/src/workflows/entities/trigger.entity';
import { ContractEntity } from 'libs/shared/src/workflows/entities/contract.entity';
import { Condition } from 'libs/shared/src/workflows/entities/condition.entity';
import { Abi } from '../../../ensemble-service/src/abi/entities/abi.entity';

@Injectable()
export class ConditionsService {


  constructor(
    private readonly providerService: BlockchainProviderService,
  ) {
    console.log('WorkflowProcessor V2 service created');
  }

  async fetchCondition(trigger: Trigger, contracts: ContractEntity[]) {
    console.log(`fetching condition for trigger ${trigger.name}`);
    const contract = await this.providerService.loadContract(trigger.contract, contracts);
    console.debug(`condition trigger ${trigger.name}. trigger method: ${trigger.method}, args: ${trigger.methodArgs}`);
    const callMethod = contract[trigger.method];
    console.debug(`call method: ${callMethod}`);
    const value = await contract[callMethod](...trigger.methodArgs);
    console.log(`condition for trigger ${trigger.name} fetched. Value: ${value}`);
    return value;
  }

  async fetchEventCondition(trigger: Trigger, contracts: ContractEntity[], network: string, fromBlock: number): Promise<any> {
    console.log(`fetching event condition for trigger ${trigger.name}`);
    const contract = await this.providerService.loadContract(trigger.contract, contracts);
    const eventSignature = await this.providerService.loadEvent(trigger.contract, trigger.event, contracts);
    console.debug(`event condition trigger ${trigger.name}. event: ${trigger.event}, fromBlock: ${fromBlock}`);
    const provider = this.providerService.getProvider(network);
    const toBlock = await provider.getBlockNumber();
    const logs = await this.providerService.fetchEvents(contract, network, eventSignature, fromBlock, toBlock, 1);
    console.log(`number of events fetched: ${logs.length}`);
    const firstLog = logs[0];
    const firstEvent = contract.interface.parseLog(firstLog);
    console.log(`first log: ${JSON.stringify(firstLog)}`);
    console.log(`first event: ${JSON.stringify(firstEvent)}`);
    return { log: firstLog, event: firstEvent };
  }

  async fetchLatestBlock(network: string): Promise<number> {
    console.log(`Fetching latest block for network: ${network}`);
    const provider = this.providerService.getProvider(network);
    const latestBlock = await provider.getBlockNumber();
    console.log(`Latest block for network ${network}: ${latestBlock}`);
    return latestBlock;
  }


  async checkCondition(condition: Condition, data: any) {
    console.log(`Checking condition ${condition.op} with value ${condition.value} on data ${data}`);
    switch (condition.op) {
      case 'eq':
        return data === condition.value
      case 'greaterThan':
        return data >= condition.value
      case 'lessThan':
        return data <= condition.value
      default:
        console.warn('Invalid condition operator')
        return false
    }

  }
}