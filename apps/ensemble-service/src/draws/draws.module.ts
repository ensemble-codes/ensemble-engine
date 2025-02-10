import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DrawsController } from './draws.controller';
import { DrawsService } from './draws.service';
import { Draw, DrawSchema } from './entities/draw.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Draw.name, schema: DrawSchema },
    ]),
  ],
  controllers: [DrawsController],
  providers: [DrawsService],
  exports: [DrawsService],
})
export class DrawsModule {} 