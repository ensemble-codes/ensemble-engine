import { Module } from '@nestjs/common';
import { CircleService } from './circle.service';

@Module({
  providers: [CircleService],
  exports: [CircleService],
})
export class CircleModule {}
