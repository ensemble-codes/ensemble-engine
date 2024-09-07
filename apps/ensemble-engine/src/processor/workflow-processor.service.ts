import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Workflow } from 'apps/ensemble-service/src/workflows/entities/workflow.entity';
import { WorkflowInstancesService } from 'apps/ensemble-service/src/workflows/services/instances.service';
import { BlockchainProviderService } from '../blockchain-provider/blockchain-provider.service';
import { AbiService } from 'apps/ensemble-service/src/abi/abi.service';
import { BaseWallet, ethers, SigningKey } from 'ethers';
import { WalletsService } from '../wallets/wallets.service';
import { Step } from 'apps/ensemble-service/src/workflows/entities/step.entity';
import { DexService } from '../modules/dex/dex.service';
import { TriggersService } from './triggers.service';
  
@Injectable()
export class WorkflowProcessorService {

  constructor(
    private readonly workflowInstancesService: WorkflowInstancesService,
    private readonly walletsService: WalletsService,
    private readonly providerService: BlockchainProviderService,
    private readonly dexService: DexService,
    private readonly triggerService: TriggersService,
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
      const { trigger } = currentStep;
      const isUpdated = await this.triggerService.checkTrigger(trigger, instance);
      if (isUpdated) {
        console.log('Trigger updated');
        const appliedWorkflow = await this.workflowInstancesService.findAndApply(instance.id);
        console.log('appliedWorkflow', JSON.stringify(appliedWorkflow, null, 2));
        this.processStep(appliedWorkflow, instance.currentStepIndex);
      }
    }
    console.log('end: WorkflorProcessor V2 loop');
  }

  async processStep( workflow: Workflow, stepIndex: number) {
    const step: Step = workflow.steps[stepIndex];
    console.log(`Processing step ${step.name} for workflow with ID: ${workflow.name}`);

    let target, methodData, networkName
    if (step.module === 'dca' && step.method === 'swap') {
      console.log(`using module ${step.module} for method ${step.method}`);
      const result = await this.dexService.swap();
      target = result[0]
      methodData = result[1]
      networkName = result[2]

      // [target, methodData, 'fuse']
      console.log(`module ${step.module} finished call ${step.method}`);
      // return
    } else {
      const contract = await this.providerService.loadContract(step.contract, workflow);

      const methodName = step.method;
      const methodArgs = step.arguments;
      console.log(`calling method ${methodName} with args ${JSON.stringify(methodArgs)}`);
  
      methodData = contract.interface.encodeFunctionData(methodName, methodArgs);
      target = contract.target
      networkName = contract.network
    }


    const tx = {
      to: target,
      data: methodData,
    };

    console.log(methodData)

    const provider = this.providerService.getProvider(networkName);
    const wallet = await this.getSignerWallet(workflow, provider);

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
    const signer = new BaseWallet(new SigningKey(wallet.privateKey), provider);
    return signer;
  }

}
