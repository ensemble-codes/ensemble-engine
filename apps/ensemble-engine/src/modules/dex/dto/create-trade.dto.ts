import { IsString, IsNumber } from 'class-validator';

export class CreateTradeDto {
  
  @IsString()
  readonly tokenInAddress: string;
  
  @IsString()
  readonly tokenOutAddress: string;

  @IsString()
  readonly tokenInAmount: string;

  @IsNumber()
  readonly tokenInDecimals: number;

  @IsString()
  readonly poolFactoryAddress: string;

}
