import { PartialType } from '@nestjs/mapped-types';
import { CreateAbiDto } from './create-abi.dto';

export class UpdateAbiDto extends PartialType(CreateAbiDto) {}
