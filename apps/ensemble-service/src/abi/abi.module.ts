import { Module } from '@nestjs/common';
import { AbiService } from './abi.service';
import { AbiController } from './abi.controller';
import { Abi, AbiSchema } from './schemas/abi.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Abi.name, schema: AbiSchema }]),
  ],
  controllers: [AbiController],
  providers: [AbiService],
  exports: [AbiService]
})
export class AbiModule {}
