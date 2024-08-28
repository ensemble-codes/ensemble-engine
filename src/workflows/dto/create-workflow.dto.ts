import { IsString, IsObject, IsArray, IsNotEmpty, IsOptional } from 'class-validator';
import { WalletEntity } from '../entities/wallet.entity';
import { Step } from '../entities/step.entity';
import { ContractEntity } from '../entities/contract.entity';

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @IsNotEmpty()
  wallet: WalletEntity;

//   @IsString()
//   @IsNotEmpty()
//   trigger: string;

  @IsArray()
  @IsNotEmpty()
  steps: Step[];

  @IsArray()
  @IsOptional()
  contracts: ContractEntity[];
}
