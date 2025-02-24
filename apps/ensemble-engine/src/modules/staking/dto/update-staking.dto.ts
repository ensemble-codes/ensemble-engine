import { PartialType } from '@nestjs/mapped-types';
import { CreateStakingDto } from './create-staking.dto';

export class UpdateStakingDto extends PartialType(CreateStakingDto) {
  id: number;
}
