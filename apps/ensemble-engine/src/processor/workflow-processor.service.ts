import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Trigger } from 'apps/ensemble-service/src/workflows/entities/trigger.entity';
import { Workflow } from 'apps/ensemble-service/src/workflows/entities/workflow.entity';
import { WorkflowInstancesService } from 'apps/ensemble-service/src/workflows/services/instances.service';
import { BlockchainProviderService } from '../blockchain-provider/blockchain-provider.service';
import { AbiService } from 'apps/ensemble-service/src/abi/abi.service';
import { BaseWallet, ethers, SigningKey } from 'ethers';
import { WorkflowInstance } from 'apps/ensemble-service/src/workflows/schemas/instance.schema';
import { Step } from 'apps/ensemble-service/src/workflows/entities/step.entity';
import { WalletsService } from '../wallets/wallets.service';
import { TriggerSnapshot } from 'apps/ensemble-service/src/workflows/entities/trigger-snapshot.entity';

/**
 * Generates a random number between 5 and 20.
 * @returns {number} A random number between 5 and 20.
 */
function generateRandom(): number {
  return Math.floor(Math.random() * (20 - 5 + 1)) + 5;
}
  
@Injectable()
export class WorkflowProcessorService {

  constructor(
    private readonly workflowInstancesService: WorkflowInstancesService,
    private readonly walletsService: WalletsService,
    private readonly providerService: BlockchainProviderService,
    private readonly abiService: AbiService,
  ) {
    console.log('WorkflowProcessor V2 service created');
  }

  @Interval(10000)
  async loop() {
    console.log('start: WorkflorProcessor V2 loop');
    const runningInstances = await this.workflowInstancesService.findRunning();
    for (const instance of runningInstances) {
      console.log(`Processing instance ${instance.id}`);
      const currentStep = instance.workflow.steps[instance.currentStepIndex];
      const { trigger } = currentStep;
      const isUpdated = await this.checkTrigger(trigger, instance);
      if (isUpdated) {
        console.log('Trigger updated');
        const appliedWorkflow = await this.workflowInstancesService.findAndApply(instance.id);
        console.log('appliedWorkflow', JSON.stringify(appliedWorkflow, null, 2));
        this.processStep(appliedWorkflow, instance.currentStepIndex);
      }
    }
    console.log('end: WorkflorProcessor V2 loop');
  }

  async checkTrigger(trigger: Trigger, instance: WorkflowInstance) {
    console.log(`validating trigger: ${trigger.name}`);
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

  async checkContactTrigger(trigger: Trigger, instance: WorkflowInstance) {
    const contract = await this.loadContract(trigger.contract, instance.workflow.toJSON());
    console.log(trigger.method)
    let value = await contract[trigger.method].staticCall()

    const snapshot = {
      name: trigger.name,
      data: value,
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


  async loadContract(contractName: string, workflow: Workflow) {
    console.log(`loading contract ${contractName} for workflow ${workflow.name}`);
    const { contracts } = workflow;
    const contractEntity = contracts.find(c => c.name === contractName);
    const contractABI = await this.abiService.findByName(contractEntity.abi)
    const provider = this.providerService.getProvider(contractEntity.network);
    const contract = new ethers.Contract(contractEntity.address, contractABI.abi, provider);
    return contract
  }

  async processStep( workflow: Workflow, stepIndex: number) {
    const step = workflow.steps[stepIndex];
    console.log(`Processing step ${step.name} for workflow with ID: ${workflow.name}`);
    const contract = await this.loadContract(step.contract, workflow);

    const methodName = step.method;
    const methodArgs = step.arguments;
    console.log(`calling method ${methodName} with args ${JSON.stringify(methodArgs)}`);

    const data = contract.interface.encodeFunctionData(methodName, methodArgs);

    const tx = {
      to: contract.target,
      data: data,
    };

    console.log(data)

    const wallet = await this.getSignerWallet(workflow, contract.runner);
    // const signedTx = await wallet.signTransaction(tx);

    // Send the signed transaction
    try {
      console.log(`Sending transaction: ${JSON.stringify(tx)}. from wallet: ${wallet.address}`);
      const txResponse = await wallet.sendTransaction(tx);
      console.log('Transaction sent:', txResponse.hash);
  
      // Wait for the transaction to be mined
      const receipt = await txResponse.wait();
      console.log('Transaction mined:', receipt);
    } catch (error) {
      console.error('Error sending transaction:', error);
    }

    // const result = await contract[methodName](10);
    
    // const result = await this.callContractMethod(contract, methodName, ...methodArgs);
  }

  async getSignerWallet(workflow: Workflow, provider: any) {
    const wallet = await this.walletsService.getWalletByWorkflow(workflow);
    // const provider = this.providerService.getProvider();
    const signer = new BaseWallet(new SigningKey(wallet.privateKey), provider);
    return signer;
  }

}
