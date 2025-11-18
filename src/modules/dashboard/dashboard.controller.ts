import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IOUService } from '../iou/iou.service';
import { ProofService } from '../proof/proof.service';
import { SettlementService } from '../settlement/settlement.service';
import { ApprovalsService } from '../approvals/approvals.service';
import { TasksService } from '../tasks/tasks.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly iouService: IOUService,
    private readonly proofService: ProofService,
    private readonly settlementService: SettlementService,
    private readonly approvalsService: ApprovalsService,
    private readonly tasksService: TasksService,
  ) {}

  @Get('stats')
  async getDashboardStats(@Request() req) {
    const userId = req.user?.id;

    const [iouStats, proofStats, settlementStats, approvalStats, taskStats] = await Promise.all([
      this.iouService.getStatistics(userId),
      this.proofService.getStatistics(userId),
      this.settlementService.getStatistics(userId),
      this.approvalsService.getStatistics(userId),
      this.tasksService.getStatistics(userId),
    ]);

    return {
      iou: iouStats,
      proof: proofStats,
      settlement: settlementStats,
      approvals: approvalStats,
      tasks: taskStats,
      summary: {
        totalItems: iouStats.total + proofStats.total + settlementStats.total + taskStats.total,
        pendingApprovals: approvalStats.pending,
        activeTasks: taskStats.todo + taskStats.inProgress,
        completedTasks: taskStats.completed,
      },
    };
  }

  @Get('recent-activity')
  async getRecentActivity(@Request() req) {
    const userId = req.user?.id;

    // Get recent items from each module
    const [recentIOUs, recentProofs, recentSettlements, recentTasks] = await Promise.all([
      this.iouService.findAll({ page: '1', limit: '5' }),
      this.proofService.findAll({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }, userId),
      this.settlementService.findAll({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }, userId),
      this.tasksService.findAll({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }, userId),
    ]);

    return {
      ious: recentIOUs.data,
      proofs: recentProofs.data,
      settlements: recentSettlements.data,
      tasks: recentTasks.data,
    };
  }

  @Get('pending-items')
  async getPendingItems(@Request() req) {
    const userId = req.user?.id;

    const [pendingApprovals, myTasks] = await Promise.all([
      this.approvalsService.getPendingApprovals(userId),
      this.tasksService.getMyTasks(userId),
    ]);

    return {
      approvals: pendingApprovals,
      tasks: myTasks,
    };
  }
}