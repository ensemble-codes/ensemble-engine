import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { WorkflowInstancesService } from 'libs/shared/src/workflows/services/instances.service';
import { BlockchainProviderService } from '../blockchain-provider/blockchain-provider.service';
import { Step } from 'libs/shared/src/workflows/entities/step.entity';
import { DexService } from '../modules/dex/dex.service';
import { TriggersService } from './triggers.service';
import { ConditionsService } from './conditions.service';
import { Trigger } from 'libs/shared/src/workflows/entities/trigger.entity';
import { TransactionsManagerService } from '../transactions/transactions-manager.service';
import { WorkflowInstanceEntity } from 'libs/shared/src/workflows/entities/instance.entity';
import { Contract } from 'ethers';

@Injectable()
export class WorkflowProcessorService {

  constructor(
    private readonly workflowInstancesService: WorkflowInstancesService,
    private readonly providerService: BlockchainProviderService,
    private readonly dexService: DexService,
    private readonly triggerService: TriggersService,
    private readonly conditionsService: ConditionsService,
    private readonly transactionsManagerService: TransactionsManagerService,
  ) {
    console.log('WorkflowProcessor V2 service created');
  }

  @Interval(10000)
  async loop() {
    console.log('start: WorkflorProcessor V2 loop');
    const workflowInstanceDocs = await this.workflowInstancesService.findByStatus('running');
    for (const instanceDoc of workflowInstanceDocs) {
      console.log(`Processing instance ${instanceDoc.id}`);
      const instanceEntity = new WorkflowInstanceEntity(
        instanceDoc.id,
        instanceDoc.workflow.toJSON(),
        instanceDoc.status,
        instanceDoc.currentStepIndex,
        instanceDoc.triggerSnapshots,
        instanceDoc.startedAt,
        instanceDoc.completedAt,
        instanceDoc.params,
      );
      const currentStep = instanceEntity.getCurrentStep();
      await this.processStep(currentStep, instanceEntity);
    }
    console.log('end: WorkflorProcessor V2 loop');
  }


  async processStep(currentStep: Step, instance: WorkflowInstanceEntity) {
    const { trigger } = currentStep;
    const isTriggered = await this.triggerService.checkTrigger(trigger, instance);
    if (isTriggered) {
      console.log('Trigger updated');
      await this.executeStep(currentStep, instance);
    }
  }

  async executeStep(step: Step, instance: WorkflowInstanceEntity) {

    const isTrue = await this.checkPreconditions(step, instance);
    if (!isTrue) {
      console.error('Preconditions not met for step:', step.name);
      return;
    }
    console.log(`Executing step ${step.name} for workflow with ID: ${instance.workflow.name}`);

    // let target, methodData, networkName
    if (step.module === 'dca') {
      console.log(`using module ${step.module} for method ${step.method}`);
      const dexArguments: any = step.arguments;
      await this.dexService.swap(dexArguments, instance);
      console.log(`module ${step.module} finished call ${step.method}`);
      return
    }

    const contract = await this.providerService.loadContract(step.contract, instance.workflow.contracts);

    const methodName = step.method;
    const methodArgs = step.arguments;
    console.log(`calling method ${methodName} with args ${JSON.stringify(methodArgs)}`);

    const methodData = this.encodeFunctionData(contract, methodName, methodArgs);
    console.info(`encoded method data: ${methodData}`);
    const target = contract.address
    console.info(`target conract: ${target}`);

    const tx = {
      to: target,
      data: methodData,
      // gasLimit: 100000,
      value: 0
    };

    console.log(methodData)

    this.transactionsManagerService.sendTransaction(tx, instance);
  }
  encodeFunctionData(contract: Contract, methodName: string, methodArgs: any) {
    const finalMethodArgs = methodArgs.map((arg: any) => {
      if (typeof arg === 'object' && arg !== null) {
        return Object.values(arg)[0];
      }
      return arg
    })
    console.log({ finalMethodArgs })
    return contract.interface.encodeFunctionData(methodName, finalMethodArgs)
  }

  async checkPreconditions(step: Step, instance: WorkflowInstanceEntity): Promise<boolean> {
    console.log('Checking preconditions for step:', step.name);
    if (!step.prerequisites?.length) {
      console.log('No prerequisites for step:', step.name);
      return true
    }
    const { contracts } = instance.workflow
    for (const pre of step.prerequisites) {
      const data = await this.conditionsService.fetchCondition(pre, contracts);
      console.log({ data })
      const isTrue = await this.conditionsService.checkCondition(pre.condition, data);
      console.log({ isTrue })
      if (!isTrue) {
        console.error('Precondition is false:', pre);
        await this.fulfillPrecondition(pre, instance);
        return false
        // throw new Error(`Precondition failed: ${pre}`);
      } else {
        console.log('Precondition is true');
        return true
      }
    }
    return true;
  }

  async fulfillPrecondition(pre: Trigger, instance: WorkflowInstanceEntity) {
    console.log('Fulfilling precondition:', pre);
    let contract;
    if (pre.method === 'allowance') {
      const contract = await this.providerService.loadContract(pre.contract, instance.workflow.contracts);

      const methodName = 'approve';

      if (pre.methodArgs.length < 2) {
        console.error('Insufficient arguments for method:', methodName);
        return; // Exit if not enough arguments
      }

      const methodArgs = [pre.methodArgs[1], pre.condition.value];
      console.log(`calling method ${methodName} with args ${JSON.stringify(methodArgs)}`);

      const methodData = this.encodeFunctionData(contract, methodName, methodArgs);
      const target = contract.address
      // networkName = contract.network
      console.log(contract.network);
      const txRequest = {
        to: target,
        value: 0,
        data: methodData
      };

      this.transactionsManagerService.sendTransaction(txRequest, instance);
    }




  }
}
