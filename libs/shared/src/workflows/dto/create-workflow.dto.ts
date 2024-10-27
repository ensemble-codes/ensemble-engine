import {
  IsString,
  IsObject,
  IsArray,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Step } from 'libs/shared/src/workflows/entities/step.entity';
import { ContractEntity } from 'libs/shared/src/workflows/entities/contract.entity';

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  wallet: string;

  @IsArray()
  @IsNotEmpty()
  steps: Step[];

  @IsArray()
  @IsOptional()
  contracts: ContractEntity[];
}
