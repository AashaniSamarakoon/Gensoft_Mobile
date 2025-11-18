import { Module } from '@nestjs/common';
import { NetworkTestController } from './network-test.controller';

@Module({
  controllers: [NetworkTestController],
})
export class NetworkTestModule {}