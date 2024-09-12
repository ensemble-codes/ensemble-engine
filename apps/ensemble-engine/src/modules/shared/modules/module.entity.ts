import { ContractEntity } from 'apps/ensemble-service/src/workflows/entities/contract.entity';
import { Step } from 'apps/ensemble-service/src/workflows/entities/step.entity'; 
import { WalletEntity } from 'apps/ensemble-service/src/workflows/entities/wallet.entity';

export class ModuleEntity {
  name: string;
  version: string;
  wallet: WalletEntity;
  trigger: string;
  steps: [ Step ];
  contracts: [ ContractEntity ];
}
