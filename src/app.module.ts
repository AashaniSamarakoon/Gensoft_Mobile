import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DebugController } from './debug.controller';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { IOUModule } from './modules/iou/iou.module';
import { UsersModule } from './modules/users/users.module';
import { NetworkTestModule } from './modules/network-test/network-test.module';
import { ProofModule } from './modules/proof/proof.module';
import { SettlementModule } from './modules/settlement/settlement.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    IOUModule,
    UsersModule,
    NetworkTestModule,
    ProofModule,
    SettlementModule,
    ApprovalsModule,
    TasksModule,
    DashboardModule,
    
  ],
  controllers: [AppController, DebugController],
  providers: [AppService],
})
export class AppModule {}
