import { Injectable } from '@nestjs/common';
import { TriggerSnapshot } from 'libs/shared/src/workflows/entities/trigger-snapshot.entity';
import { Trigger } from 'libs/shared/src/workflows/entities/trigger.entity';
import { WorkflowInstance } from 'libs/shared/src/workflows/schemas/instance.schema';
import { WorkflowInstancesService } from 'libs/shared/src/workflows/services/instances.service';
import { ConditionsService } from './conditions.service';
import { WorkflowInstanceEntity } from 'libs/shared/src/workflows/entities/instance.entity';

@Injectable()
export class TriggersService {
  constructor(
    private readonly workflowInstancesService: WorkflowInstancesService,
    private readonly conditionsService: ConditionsService,
  ) {
    console.log('TriggersService service created');
  }

  async checkTrigger(trigger: Trigger, instance: WorkflowInstanceEntity) {
    console.log(`validating trigger: ${trigger.name}`);
    switch (trigger.type) {
      case 'contract':
        return this.checkContactTrigger(trigger, instance);
      case 'event':
        return this.checkEventTrigger(trigger, instance);
      case 'periodic':
        return this.checkPeriodicTrigger(trigger, instance);
      default:
        console.error(`Unknown trigger type: ${trigger.type}`);
        return false;
    }
  }

  async checkContactTrigger(
    trigger: Trigger,
    instance: WorkflowInstanceEntity,
  ) {
    const data = await this.conditionsService.fetchCondition(
      trigger,
      instance.workflow.contracts,
    );
    // fetchTriggerData(trigger, instance);

    const snapshot = {
      name: trigger.name,
      data,
      lastExecution: new Date(),
    };

    const oldSnapshot = await this.workflowInstancesService.storeTriggerSnapsot(
      instance.id,
      snapshot,
    );

    const isUpdated =
      !oldSnapshot || oldSnapshot.data.toString() !== snapshot.data.toString();
    console.log(
      `Trigger ${trigger.name} is ${!isUpdated ? 'not' : ''} updated. check dont at ${snapshot.lastExecution}`,
    );

    return isUpdated;
  }

  async checkEventTrigger(trigger: Trigger, instance: WorkflowInstanceEntity) {
    const oldSnapshot = instance.getTriggerSnapshot(trigger.name);

    let fromBlock = Number(
      oldSnapshot ? oldSnapshot.blockNumber : trigger.startBlock,
    );
    if (fromBlock === 0) {
      console.warn(`Using startBlock ${trigger.startBlock} as fromBlock`);
      fromBlock = trigger.startBlock;
    }
    const network = instance.getCurrentNetwork();
    const { log, event } = await this.conditionsService.fetchEventCondition(
      trigger,
      instance.workflow.contracts,
      network,
      fromBlock,
    );

    const snapshot = {
      name: trigger.name,
      event,
      blockNumber: log.blockNumber,
      params: event.args,
      lastExecution: new Date(),
    };

    await this.workflowInstancesService.storeTriggerSnapsot(
      instance.id,
      snapshot,
    );

    const isUpdated = !!event;
    console.log(
      `Trigger ${trigger.name} is ${!isUpdated ? 'not' : ''} updated. check dont at ${snapshot.lastExecution}`,
    );

    return isUpdated;
  }

  async checkPeriodicTrigger(
    trigger: Trigger,
    instance: WorkflowInstanceEntity,
  ) {
    const now = new Date();
    const snapshot = {
      name: trigger.name,
      lastExecution: new Date(),
    };
    const oldSnapshot = await this.workflowInstancesService.storeTriggerSnapsot(
      instance.id,
      snapshot,
    );
    const isUpdated = this.periodicCheck(trigger, now, oldSnapshot);

    console.log(
      `Trigger ${trigger.name} check on ${snapshot.lastExecution}. isUpdated: ${isUpdated}`,
    );
    return isUpdated;
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
