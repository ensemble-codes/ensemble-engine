

import { ContractEntity } from './contract.entity';
import { Step } from './step.entity'; 

import { WalletEntity } from './wallet.entity';

export class Workflow {
  name: string;
  version: string;
  wallet: WalletEntity;
  trigger: string;
  steps: [ Step ];
  contracts: [ ContractEntity ];
}
