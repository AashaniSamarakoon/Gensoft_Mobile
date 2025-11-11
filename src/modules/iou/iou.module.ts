import { Module } from '@nestjs/common';
import { IOUService } from './iou.service';
import { IOUController } from './iou.controller';

@Module({
  controllers: [IOUController],
  providers: [IOUService],
  exports: [IOUService],
})
export class IOUModule {}