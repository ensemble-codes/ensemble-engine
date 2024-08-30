import { Controller, Get, Post, Body, Param, Delete, NotFoundException } from '@nestjs/common';
import { AbiService } from './abi.service';
import { CreateAbiDto } from './dto/create-abi.dto';

@Controller('abi')
export class AbiController {
  constructor(private readonly abiService: AbiService) {}

  @Post()
  async create(@Body() createAbiDto: CreateAbiDto) {
    console.log('createAbiDto', createAbiDto);
    return this.abiService.create(createAbiDto);
  }

  @Get()
  async findAll() {
    return this.abiService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const abi = await this.abiService.findOne(id);
    if (!abi) {
      throw new NotFoundException(`ABI with ID ${id} not found`);
    }
    return abi;
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string) {
    return this.abiService.findByName(name);
  }
}