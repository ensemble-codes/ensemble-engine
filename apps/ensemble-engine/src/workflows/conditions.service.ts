import { Injectable } from '@nestjs/common';
import { BlockchainProviderService } from '../blockchain-provider/blockchain-provider.service';
import { Trigger } from 'libs/shared/src/workflows/entities/trigger.entity';
import { ContractEntity } from 'libs/shared/src/workflows/entities/contract.entity';
import { Condition } from 'libs/shared/src/workflows/entities/condition.entity';

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
    const value = await contract.allowance(...trigger.methodArgs);
    console.log(`condition for trigger ${trigger.name} fetched. Value: ${value}`);
    return value;
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

  // async fetchCondition() {



}