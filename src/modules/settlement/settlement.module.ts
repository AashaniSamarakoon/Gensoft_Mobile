import { Module } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { SettlementController } from './settlement.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SettlementController],
  providers: [SettlementService],
  exports: [SettlementService],
})
export class SettlementModule {}