import { ContractEntity } from 'libs/shared/src/workflows/entities/contract.entity';
import { Step } from 'libs/shared/src/workflows/entities/step.entity'; 
import { WalletEntity } from 'libs/shared/src/workflows/entities/wallet.entity';

export class ModuleEntity {
  name: string;
  version: string;
  wallet: WalletEntity;
  trigger: string;
  preconditions: [ Step ];
  contracts: [ ContractEntity ];
}
