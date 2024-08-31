import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Trigger } from 'apps/ensemble-service/src/workflows/entities/trigger.entity';
import { Workflow } from 'apps/ensemble-service/src/workflows/entities/workflow.entity';
import { WorkflowInstancesService } from 'apps/ensemble-service/src/workflows/services/instances.service';
import { BlockchainProviderService } from '../blockchain-provider/blockchain-provider.service';
import { AbiService } from 'apps/ensemble-service/src/abi/abi.service';
import { ethers } from 'ethers';

// import { ContractEntity } from 'src/workflows/entities/Contract.entity';
// import { Step } from 'src/workflows/entities/step.entity';
// import { Workflow } from 'src/workflows/entities/workflow.entity';
// import { WorkflowsService } from 'src/workflows/workflows.service';
// import { BlockchainProviderService } from 'src/utils/blockchain-provider/blockchain-provider.service';
// import { promises as fs } from 'fs';
// import { WalletService } from 'src/wallet/wallet.service';
// import { BaseWallet, Contract, parseEther, SigningKey } from 'ethers';
import { TriggerSnapshot } from '../../../ensemble-service/src/workflows/entities/trigger-snapshot.entity';
import { time } from 'console';
import { timestamp } from 'rxjs';
import { WorkflowInstance } from 'apps/ensemble-service/src/workflows/schemas/instance.schema';

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
    private readonly providerService: BlockchainProviderService,
    private readonly abiService: AbiService,
  ) {
    console.log('WorkflowProcessor V2 service created');
  }

  @Interval(1000)
  async loop() {
    console.log('start: WorkflorProcessor V2 loop');
    const runningInstances = await this.workflowInstancesService.findRunning();
    console.log(runningInstances);
    for (const instance of runningInstances) {
      const currentStep = instance.workflow.steps[instance.currentStepIndex];
      const { trigger } = currentStep;
      await this.validateTrigger(trigger, instance);
    }
    console.log('end: WorkflorProcessor V2 loop');
  }

  async validateTrigger(trigger: Trigger, instance: WorkflowInstance) {
    console.log(`validating trigger: ${trigger.name}`);
    const contract = await this.getConract(trigger.contract, instance.workflow.toJSON());
    console.log(trigger.method)
    let value = await contract[trigger.method].staticCall()
    const triggerSnapshot = {
      name: trigger.name,
      data: value,
      timestamp: new Date()
    }
    const isUpdated = await this.workflowInstancesService.storeTriggerSnapsot(instance.id, triggerSnapshot);
    console.log({ isUpdated });
    // contract.on(trigger.event, async (event) => {
    //   console.log(`Event: ${trigger.event} received`);
    //   console.log({ event });
    // });
    // console.log({ contract });
    // return true;
  }

  async getConract(contractName: string, workflow: Workflow) {
    const { contracts } = workflow;
    const contractEntity = contracts.find(c => c.name === contractName);
    const contractABI = await this.abiService.findByName(contractEntity.abi)
    const provider = this.providerService.getProvider(contractEntity.network);
    const contract = new ethers.Contract(contractEntity.address, contractABI.abi, provider);
    return contract
  }

//   processWorkflow(workflow: Workflow) {
//     console.log(`Processing ${workflow.name} workflow`);
//     const stepIndex = 0;
//     const step = workflow.steps[stepIndex];
//     // this.processStep(step, workflow);
//     // throw new Error('Metho not implemented.');
//   }

  
//  generateRandomAmount(): bigint {
//     return parseEther(generateRandom().toString())
//   }

//   async callContractMethod(contract, methodName, ...args) {
//     if (!contract[methodName]) {
//       throw new Error(`Method ${methodName} does not exist on the contract`);
//     }
//     console.log(`calling method ${methodName} with args ${JSON.stringify(args)}`);
//     const result = await contract[methodName](this.generateRandomAmount());
//     return result;
//   }

//   async processStep(step: Step, workflow: Workflow) {
//     console.log(`Processing step ${step.name} for workflow with ID: ${workflow.name}`);
//     const contract = await this.loadContract(step, workflow);
//     // console.log(contract)

//     const methodName = step.method;
//     const methodArgs = step.arguments;
//     console.log(`calling method ${methodName} with args ${JSON.stringify(methodArgs)}`);
    
//     const result = await this.callContractMethod(contract, methodName, ...methodArgs);
//   }

//   async loadContract(step: Step, workflow: Workflow) {
//     console.log(`loading contract ${step.contract} for workflow ${workflow.name}`);
//     const contractEntity = this.getConract(step.contract, workflow);
//     const abiFileContent = await fs.readFile(contractEntity.abi, 'utf-8');

//     const provider = this.blockchainProviderService.getProvider(contractEntity.network);

//     const wallet = await this.walletService.loadWallet(step, workflow);
//     const signingProvider = new BaseWallet(new SigningKey(wallet.privateKey), provider);
//     const contract = new Contract(contractEntity.address, abiFileContent, signingProvider);
//     return contract
//   }


//   getConract(contractName: string, workflow: Workflow) : ContractEntity {
//     console.log(`loading contract ${contractName} for workflow ${workflow.name}`);
//     const { contracts } = workflow
//     return contracts.find(contract => contract.name === contractName);
//   }

}
