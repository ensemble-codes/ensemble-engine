import { Injectable } from '@nestjs/common';
import { BlockchainProviderService } from '../blockchain-provider/blockchain-provider.service';
import { Trigger } from 'apps/ensemble-service/src/workflows/entities/trigger.entity';
import { ContractEntity } from 'apps/ensemble-service/src/workflows/entities/contract.entity';
import { Condition } from 'apps/ensemble-service/src/workflows/entities/condition.entity';
// import { Condition } from 'mongoose';
// import { TriggerSnapshot } from 'apps/ensemble-service/src/workflows/entities/trigger-snapshot.entity';
// import { Trigger } from 'apps/ensemble-service/src/workflows/entities/trigger.entity';
// import { WorkflowInstance } from 'apps/ensemble-service/src/workflows/schemas/instance.schema';
// import { WorkflowInstancesService } from 'apps/ensemble-service/src/workflows/services/instances.service';
// import { BlockchainProviderService } from '../blockchain-provider/blockchain-provider.service';

@Injectable()
export class ConditionsService {


  constructor(
    // private readonly workflowInstancesService: WorkflowInstancesService,
    // private readonly walletsService: WalletsService,
    private readonly providerService: BlockchainProviderService,
    // private readonly dexService: DexService,
    // private readonly triggerService: TriggersService,
  ) {
    console.log('WorkflowProcessor V2 service created');
  }

  async fetchCondition(trigger: Trigger, contracts: ContractEntity[]) {
    console.log(`fetching condition for trigger ${trigger.name}`);
    const contract = await this.providerService.loadContract(trigger.contract, contracts);
    console.debug(`condition trigger ${trigger.name}. trigger method: ${trigger.method}, args: ${trigger.methodArgs}`);
    console.debug(contract[trigger.method]);
    const callMethod = contract[trigger.method];
    console.debug(`call method: ${callMethod}`);
    // let value = await callMethod(...trigger.methodArgs);
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