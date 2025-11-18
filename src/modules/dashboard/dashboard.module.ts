import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { IOUModule } from '../iou/iou.module';
import { ProofModule } from '../proof/proof.module';
import { SettlementModule } from '../settlement/settlement.module';
import { ApprovalsModule } from '../approvals/approvals.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    IOUModule,
    ProofModule,
    SettlementModule,
    ApprovalsModule,
    TasksModule,
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}