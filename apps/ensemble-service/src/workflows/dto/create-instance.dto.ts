import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateWorkflowInstanceDto {
  @IsString()
  readonly workflowId: string;

  @IsObject()
  @IsOptional()
  readonly params?: Map<string, string>;
}
