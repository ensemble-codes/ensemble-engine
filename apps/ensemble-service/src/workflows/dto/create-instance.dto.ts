import { IsString, IsOptional, IsObject } from 'class-validator';
import { Types } from 'mongoose';

export class CreateWorkflowInstanceDto {
  @IsString()
  readonly workflowName: string;

  @IsObject()
  @IsOptional()
  readonly params?: Map<string, string>;
}
