import { ContractEntity } from 'libs/shared/src/workflows/entities/contract.entity';
import { Step } from 'libs/shared/src/workflows/entities/step.entity'; 

export class ModuleEntity {
  name: string;
  version: string;
  walletAddress: string;
  trigger: string;
  preconditions: [ Step ];
  contracts: [ ContractEntity ];
}
