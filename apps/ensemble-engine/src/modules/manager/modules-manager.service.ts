import { Injectable } from "@nestjs/common";
import { ModuleEntity } from "../shared/modules/module.entity";
import { WorkflowInstanceEntity } from "libs/shared/src/workflows/entities/instance.entity";
import { Step } from "libs/shared/src/workflows/entities/step.entity";
import { DexService } from "../dex/dex.service";
// import { DividentsService } from "../dividents/services/dividents.service";
import { SnapshotBuilderService } from "../snapshots/snapshot-builder.service";
import { SnapshotModuleEntry } from "../snapshots/snapshots.entry";

@Injectable()
export class ModulesManagerService {

  constructor(
    private readonly dexService: DexService,
    private readonly snapshotModuleEntry: SnapshotModuleEntry
  ) {}

  async executeModule(instance: WorkflowInstanceEntity, step: Step) {
    console.log(`Executing module ${step.module} for method ${step.method}`);
    switch (step.module) {
      case 'dex':
        console.log(`using module ${step.module} for method ${step.method}`);
        const dexArguments: any = step.arguments;
        await this.dexService.swap(dexArguments, instance);
        console.log(`module ${step.module} finished call ${step.method}`);
        break;
      case 'dividents':
        console.log(`using module ${step.module} for method ${step.method}`);
        // const dividentsArguments: any = step.arguments;
        // await this.dividentsService.process(dividentsArguments, instance);
        console.log(`module ${step.module} finished call ${step.method}`);
        break;
      case 'snapshot':
        console.log(`using module ${step.module} for method ${step.method}`);
        const snapshotArguments: any = step.arguments;
        console.log(`snapshotArguments: ${JSON.stringify(snapshotArguments)}`);
        
        const triggerSnapshot = instance.getTriggerSnapshot(step.trigger.name);
        console.log(`triggerSnapshot: ${JSON.stringify(triggerSnapshot)}`);
        const startBlock = Number(triggerSnapshot ? triggerSnapshot.blockNumber : step.trigger.startBlock);
        console.log(`snapshot startBlock: ${startBlock}`);
        await this.snapshotModuleEntry.build({ ...snapshotArguments, startBlock}, instance);
        console.log(`module ${step.module} finished call ${step.method}`);
        break;
      default:
        console.error(`Module ${step.module} not found. Skipping step`);
        break;
    }
  }

  async fetchFeed(instance: WorkflowInstanceEntity, arg: string) {
    console.log(`Fetching feed for arg: ${arg}`);
    if (arg === '&latest-balances' || arg === '&latest-holders') {
      const step = instance.getStep(0);
      const snapshotArguments: any = step.arguments;
      if (arg === '&latest-balances') {
        return this.snapshotModuleEntry.getLatestBalances(snapshotArguments);
      } else if (arg === '&latest-holders') {
        return this.snapshotModuleEntry.getLatestHolders(snapshotArguments);
      }
    }
  }
}
