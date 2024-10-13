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
import { ModulesManagerService } from '../modules/manager/modules-manager.service';
import { CircleService } from 'libs/shared/src/workflows/circle/circle.service';

@Injectable()
export class WorkflowProcessorService {

  constructor(
    private readonly workflowInstancesService: WorkflowInstancesService,
    private readonly providerService: BlockchainProviderService,
    private readonly circleService: CircleService,
    private readonly triggerService: TriggersService,
    private readonly conditionsService: ConditionsService,
    private readonly transactionsManagerService: TransactionsManagerService,
    private readonly modulesManagerService: ModulesManagerService,
  ) {
    console.log('WorkflowProcessor V2 service created');
  }

  @Interval(10000)
  async loop() {
    console.log('start: WorkflorProcessor V2 loop');
    const workflowInstanceDocs = await this.workflowInstancesService.findByStatus('running');
    for (const instanceDoc of workflowInstanceDocs) {
      console.log(`Processing instance ${instanceDoc.id}`);

      if (instanceDoc.isProcessing) {
        console.log(`Instance ${instanceDoc.id} is already processing. Skipping.`);
        continue;
        // if (await this.workflowInstancesService.isSafeToStop(instanceDoc.id)) {
        //   await this.workflowInstancesService.stopProcessing(instanceDoc.id);
        // } else {
        //   console.log(`Instance ${instanceDoc.id} is already processing. Skipping.`);
        //   continue;
        // }
      }
      const isStarted = await this.workflowInstancesService.startProcessing(instanceDoc.id);

      if (!isStarted) {
        console.log(`Instance ${instanceDoc.id} is already processing. Skipping.`);
        continue;
      }
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

      await this.workflowInstancesService.stopProcessing(instanceDoc.id);
    }
    console.log('end: WorkflorProcessor V2 loop');
  }


  async processStep(currentStep: Step, instance: WorkflowInstanceEntity) {
    const { trigger } = currentStep;
    if (!trigger) {
      console.log(`No trigger for step ${currentStep.name}. Executing step immediately.`);
      await this.executeStep(currentStep, instance);
      return;
    }
    const isTriggered = await this.triggerService.checkTrigger(trigger, instance);
    if (isTriggered) {
      console.log(`An update in trigger ${trigger.name} has been detected. Executing step ${currentStep.name}`);
      await this.executeStep(currentStep, instance);
    }
  }

  async executeStep(step: Step, instance: WorkflowInstanceEntity) {
    console.log(`Executing step ${step.name} for workflow with ID: ${instance.workflow.name}`);
    console.debug({ arguments: step.arguments })
    const isTrue = await this.checkPreconditions(step, instance);
    if (isTrue) {
      console.log(`Preconditions met for step: ${step.name}`);
    } else {
      console.error(`Preconditions not met for step: %{step.name}. Skipping step`, );
      return;
    }

    console.debug(`Starting execution of step ${JSON.stringify(step)}`);
    if (step.module) {
      await this.modulesManagerService.executeModule(instance, step);
      return;
    }

    const contract = await this.providerService.loadContract(step.contract, instance.workflow.contracts);

    const methodName = step.method;
    const methodArgs = await this.fetchFeedsForMethodsArgs(step.arguments, instance);
    // instance.getCurrentStep
    console.log(`calling method ${methodName} with args ${JSON.stringify(methodArgs)}`);

    console.log('EXECUTE STEP');
    const methodData = this.encodeFunctionData(contract, methodName, methodArgs);
    console.info(`encoded method data: ${methodData}`);
    const target = contract.address
    console.info(`target conract: ${target}`);
    console.info(`wallet address: ${instance.workflow.walletAddress}`);
    const tx = {
      to: target,
      data: methodData,
      // maxFeePerGas: 10000000000,
      // maxPriorityFeePerGas: 1000000000,
      // gasLimit: 100000,
      value: 0
    };

    console.log(methodData)
    this.circleService.sendTransaction(instance.workflow.walletAddress, target, methodName, methodArgs);
    // this.transactionsManagerService.sendTransaction(tx, instance);
  }
  encodeFunctionData(contract: Contract, methodName: string, methodArgs: any) {
    console.log({ methodArgs })
    const methodArgsKeysRemoved = methodArgs.map((arg: any) => {
      if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
        return Object.values(arg)[0];
      }
      return arg
    })
    console.debug({ methodArgsKeysRemoved })
    return contract.interface.encodeFunctionData(methodName, methodArgsKeysRemoved)
  }

  async fetchFeedsForMethodsArgs(methodArgs: string[], instance: WorkflowInstanceEntity): Promise<any[]> {
    const finalMethodArgs = await Promise.all(methodArgs.map(async (arg: any) => {
      if (typeof arg === 'string' && arg.startsWith('&')) {
        const fetchedArg = await this.modulesManagerService.fetchFeed(instance, arg);
        return fetchedArg;
      }
      return arg
    }))
    return finalMethodArgs;
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
      console.log("PRECONDDITIONS:")
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
