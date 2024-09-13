import { IsString, IsObject, IsArray, IsNotEmpty, IsOptional } from 'class-validator';
import { WalletEntity } from 'libs/shared/src/workflows/entities/wallet.entity';
import { Step } from 'libs/shared/src/workflows/entities/step.entity';
import { ContractEntity } from 'libs/shared/src/workflows/entities/contract.entity';

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @IsNotEmpty()
  wallet: WalletEntity;

  @IsArray()
  @IsNotEmpty()
  steps: Step[];

  @IsArray()
  @IsOptional()
  contracts: ContractEntity[];
}
