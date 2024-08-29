import { IsString, IsNotEmpty, IsObject, ArrayNotEmpty, IsArray } from 'class-validator';

export class CreateAbiDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsArray()
  @ArrayNotEmpty()
  readonly abi: object[];
}
