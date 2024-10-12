

import { ContractEntity } from './contract.entity';
import { Step } from './step.entity'; 

export class Workflow {
  name: string;
  version: string;
  walletAddress: string;
  trigger: string;
  steps: [ Step ];
  contracts: [ ContractEntity ];
}
