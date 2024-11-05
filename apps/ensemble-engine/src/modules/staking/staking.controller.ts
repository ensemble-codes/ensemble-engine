import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StakingService } from './staking.service';
import { CreateStakingDto } from './dto/create-staking.dto';
import { UpdateStakingDto } from './dto/update-staking.dto';

@Controller()
export class StakingController {
  constructor(private readonly stakingService: StakingService) {}

  @MessagePattern('createStaking')
  create(@Payload() createStakingDto: CreateStakingDto) {
    return this.stakingService.create(createStakingDto);
  }

  @MessagePattern('findAllStaking')
  findAll() {
    return this.stakingService.findAll();
  }

  @MessagePattern('findOneStaking')
  findOne(@Payload() id: number) {
    return this.stakingService.findOne(id);
  }

  @MessagePattern('updateStaking')
  update(@Payload() updateStakingDto: UpdateStakingDto) {
    return this.stakingService.update(updateStakingDto.id, updateStakingDto);
  }

  @MessagePattern('removeStaking')
  remove(@Payload() id: number) {
    return this.stakingService.remove(id);
  }
}
