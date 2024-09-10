import { Injectable } from '@nestjs/common';
import { TriggerSnapshot } from 'apps/ensemble-service/src/workflows/entities/trigger-snapshot.entity';
import { Trigger } from 'apps/ensemble-service/src/workflows/entities/trigger.entity';
import { WorkflowInstance } from 'apps/ensemble-service/src/workflows/schemas/instance.schema';
import { WorkflowInstancesService } from 'apps/ensemble-service/src/workflows/services/instances.service';
import { BlockchainProviderService } from '../blockchain-provider/blockchain-provider.service';

@Injectable()
export class TriggersService {
  constructor(
    private readonly workflowInstancesService: WorkflowInstancesService,
    private readonly providerService: BlockchainProviderService,
  ) {
    console.log('TriggersService service created');
  }

  async checkTrigger(trigger: Trigger, instance: WorkflowInstance) {
    console.log(`validating trigger: ${trigger.name}`);
    console.log(this.workflowInstancesService)
    switch (trigger.type) {
      case 'contract':
        return this.checkContactTrigger(trigger, instance);
      case 'periodic':
        return this.checkPeriodicTrigger(trigger, instance);
      default:
        console.error(`Unknown trigger type: ${trigger.type}`);
        return false;
    }
  }

  async fetchTriggerData(trigger: Trigger, instance: WorkflowInstance) {
    const contract = await this.providerService.loadContract(trigger.contract, instance.workflow.contracts);
    console.log(trigger.method)
    console.log(contract[trigger.method])
    console.log(trigger.methodArgs) 
    let value = await contract[trigger.method].staticCall(...trigger.methodArgs)
    return value
  }

  async checkContactTrigger(trigger: Trigger, instance: WorkflowInstance) {
    // const contract = await this.providerService.loadContract(trigger.contract, instance.workflow.contracts);
    // console.log(trigger.method)
    // let value = await contract[trigger.method].staticCall()
    const data = await this.fetchTriggerData(trigger, instance);

    const snapshot = {
      name: trigger.name,
      data,
      lastExecution: new Date()
    }
    
    const oldSnapshot = await this.workflowInstancesService.storeTriggerSnapsot(instance.id, snapshot);

    const isUpdated = !oldSnapshot || oldSnapshot.data.toString() !== snapshot.data.toString();
    console.log(`Trigger ${trigger.name} check on ${snapshot.lastExecution}. isUpdated: ${isUpdated}`);

    return isUpdated
  }

  async checkPeriodicTrigger(trigger: Trigger, instance: WorkflowInstance) {
    const now = new Date();
    const snapshot = {
      name: trigger.name,
      lastExecution: new Date(),
    }
    const oldSnapshot = await this.workflowInstancesService.storeTriggerSnapsot(instance.id, snapshot);
    const isUpdated = this.periodicCheck(trigger, now, oldSnapshot);

    console.log(`Trigger ${trigger.name} check on ${snapshot.lastExecution}. isUpdated: ${isUpdated}`);
    return isUpdated
  }

  periodicCheck(trigger: Trigger, now: Date, oldSnapshot: TriggerSnapshot) {
    if (!oldSnapshot) {
      return true;
    }
    switch (trigger.interval) {
      case 'always':
        return true;
      case 'daily':
        return now.getDate() !== oldSnapshot.lastExecution.getDate();
      case 'hourly':
        return now.getHours() !== oldSnapshot.lastExecution.getHours();
      case 'minute':
        return now.getMinutes() !== oldSnapshot.lastExecution.getMinutes();
      default:
        return false;
    }
  }
}