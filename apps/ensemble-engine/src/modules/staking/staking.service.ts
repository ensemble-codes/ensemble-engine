import { Injectable } from '@nestjs/common';
import { CreateStakingDto } from './dto/create-staking.dto';
import { UpdateStakingDto } from './dto/update-staking.dto';

@Injectable()
export class StakingService {
  stake(createStakingDto: CreateStakingDto) {

    // TODO Staking with avax
    return 'This action adds a new staking';
  }
}
