import { IsString, IsNumber } from 'class-validator';
import { Dex, Token } from '../entities';

export class CreateTradeDto {
  
  readonly tokenIn: Token;
  
  readonly tokenOut: Token;

  @IsString()
  readonly tokenInAmount: string;

  readonly dex: Dex;

  readonly receiverAddress: string;

}
