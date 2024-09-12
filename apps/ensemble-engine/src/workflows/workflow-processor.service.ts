import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Workflow } from 'libs/shared/src/workflows/entities/workflow.entity';
import { WorkflowInstancesService } from 'libs/shared/src/workflows/services/instances.service';
import { BlockchainProviderService } from '../blockchain-provider/blockchain-provider.service';
import { Step } from 'libs/shared/src/workflows/entities/step.entity';
import { DexService } from '../modules/dex/dex.service';
import { TriggersService } from './triggers.service';
import { WorkflowInstance } from 'libs/shared/src/workflows/schemas/instance.schema';
import { ConditionsService } from './conditions.service';
import { Trigger } from 'libs/shared/src/workflows/entities/trigger.entity';
import { SignersService } from '../blockchain-provider/signers.service';
  
@Injectable()
export class WorkflowProcessorService {

  constructor(
    private readonly workflowInstancesService: WorkflowInstancesService,
    private readonly providerService: BlockchainProviderService,
    private readonly signersService: SignersService,
    private readonly dexService: DexService,
    private readonly triggerService: TriggersService,
    private readonly conditionsService: ConditionsService,
  ) {
    console.log('WorkflowProcessor V2 service created');
  }

  @Interval(10000)
  async loop() {
    console.log('start: WorkflorProcessor V2 loop');
    const runningInstances = await this.workflowInstancesService.findByStatus('running');
    for (const instance of runningInstances) {
      console.log(`Processing instance ${instance.id}`);
      const currentStep = instance.workflow.steps[instance.currentStepIndex];
      await this.processStep(currentStep, instance);
    }
    console.log('end: WorkflorProcessor V2 loop');
  }


  async processStep(currentStep: Step, instance: WorkflowInstance) {
    const { trigger } = currentStep;
    const isUpdated = await this.triggerService.checkTrigger(trigger, instance);
    if (isUpdated) {
      console.log('Trigger updated');
      const appliedWorkflow = await this.workflowInstancesService.findAndApply(instance.id);
      console.log('appliedWorkflow', JSON.stringify(appliedWorkflow, null, 2));
      await this.executeStep(appliedWorkflow, instance.currentStepIndex);
    }

  }

  async executeStep( workflow: Workflow, stepIndex: number) {
    const step: Step = workflow.steps[stepIndex];

    const isTrue = await this.checkPreconditions(step, workflow);
    if (!isTrue) {
      console.error('Preconditions not met for step:', step.name);
      return;
    }
    console.log(`Executing step ${step.name} for workflow with ID: ${workflow.name}`);

    let target, methodData, networkName
    if (step.module === 'dca') {
      console.log(`using module ${step.module} for method ${step.method}`);
      const dexArguments: any = step.arguments;
      const result = await this.dexService.swap(dexArguments);
      target = result[0]
      methodData = result[1]
      networkName = result[2]

      // [target, methodData, 'fuse']
      console.log(`module ${step.module} finished call ${step.method}`);
      // return
    } else {
      const contract = await this.providerService.loadContract(step.contract, workflow.contracts);

      const methodName = step.method;
      const methodArgs = step.arguments;
      console.log(`calling method ${methodName} with args ${JSON.stringify(methodArgs)}`);
  
      methodData = contract.interface.encodeFunctionData(methodName, methodArgs);
      target = contract.address
      networkName = contract.network
    }

    const tx = {
      to: target,
      data: methodData,
      gasLimit: 1000000
    };

    console.log(methodData)

    const provider = this.providerService.getProvider(networkName);
    const wallet = await this.signersService.getSignerWallet(workflow, provider);

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
  }

  async sendTransaction(tx: any, workflow: Workflow, provider: any) {
    const wallet = await this.signersService.getSignerWallet(workflow, provider);

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

  }

  async checkPreconditions(step: Step, workflow: Workflow): Promise<boolean> {
    console.log('Checking preconditions for step:', step.name);
    const { contracts } = workflow
    for (const pre of step.prerequisites) {
      const data = await this.conditionsService.fetchCondition(pre, contracts);
      console.log({ data })
      const isTrue = await this.conditionsService.checkCondition(pre.condition, data);
      console.log({ isTrue })
      if (!isTrue) {
        console.error('Precondition is false:', pre);
        await this.fulfillPrecondition(pre, workflow);
        return false
        // throw new Error(`Precondition failed: ${pre}`);
      } else {
        console.log('Precondition is true');
        return true
      }
    }

    // if (step.module === 'dca') {
    //   const txRequest = {
    //     to: target,
    //     value: 0,
    //     data: methodData,
    //     gasLimit: 1000000
    //   };

    // }
    return true;
  }

  async fulfillPrecondition(pre: Trigger, workflow: Workflow) {
    console.log('Fulfilling precondition:', pre);
    let contract;
    if (pre.method === 'allowance') {
      const contract = await this.providerService.loadContract(pre.contract, workflow.contracts);

      const methodName = 'approve';

      if (pre.methodArgs.length < 2) {
        console.error('Insufficient arguments for method:', methodName);
        return; // Exit if not enough arguments
      }

      const methodArgs = [pre.methodArgs[1], pre.condition.value];
      console.log(`calling method ${methodName} with args ${JSON.stringify(methodArgs)}`);

      const methodData = contract.interface.encodeFunctionData(methodName, methodArgs);
      const target = contract.address
      // networkName = contract.network
      console.log(contract.network);
      const txRequest = {
        to: target,
        value: 0,
        data: methodData,
        gasLimit: 1000000
      };

    //   const tx = {
    //     to: "0xRecipientAddress", // Replace with the recipient's address
    //     value: ethers.utils.parseEther("0.1"), // Amount of ETH to send (0.1 ETH in this case)
    //     gasLimit: 21000, // Standard gas limit for a simple ETH transfer
    //     gasPrice: await provider.getGasPrice(), // Get current gas price from the network
    //     nonce: await provider.getTransactionCount(wallet.address, "latest"), // Get the nonce for the wallet
    // };

      this.sendTransaction(txRequest, workflow, contract.provider);
      // const txResponse = await contract.provider.sendTransaction(txRequest);
      // await txResponse.wait();
    }




  }
}
