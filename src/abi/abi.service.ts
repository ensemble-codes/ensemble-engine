import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Abi } from './schemas/abi.schema';
import { CreateAbiDto } from './dto/create-abi.dto';
import { UpdateAbiDto } from './dto/update-abi.dto';

@Injectable()
export class AbiService {
  constructor(@InjectModel(Abi.name) private readonly abiModel: Model<Abi>) {}

  async create(createAbiDto: CreateAbiDto): Promise<Abi> {
    const newAbi = new this.abiModel(createAbiDto);
    return newAbi.save();
  }

  async findAll(): Promise<Abi[]> {
    return this.abiModel.find().exec();
  }

  async findOne(id: string): Promise<Abi> {
    const abi = await this.abiModel.findById(id).exec();
    if (!abi) {
      throw new NotFoundException(`ABI with ID ${id} not found`);
    }
    return abi;
  }

  async findByName(name: string): Promise<Abi> {
    const abi = await this.abiModel.findOne({ name }).exec();
    if (!abi) {
      throw new NotFoundException(`ABI with name ${name} not found`);
    }
    return abi;
  }

  update(id: number, updateAbiDto: UpdateAbiDto) {
    return `This action updates a #${id} abi`;
  }

  remove(id: number) {
    return `This action removes a #${id} abi`;
  }
}
