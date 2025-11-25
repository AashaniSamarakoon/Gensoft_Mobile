import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { QueryApprovalDto } from './dto/query-approval.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get('modules')
  async getModules() {
    return this.approvalsService.getModules();
  }

  @Get('by-module/:moduleId')
  async getApprovalsByModule(
    @Param('moduleId') moduleId: string,
    @Query() queryDto: QueryApprovalDto,
    @Request() req
  ) {
    const userId = req.user?.id;
    return this.approvalsService.getApprovalsByModule(moduleId, queryDto, userId);
  }

  @Post()
  async create(@Body() createApprovalDto: CreateApprovalDto) {
    return this.approvalsService.create(createApprovalDto);
  }

  @Get()
  async findAll(@Query() queryDto: QueryApprovalDto, @Request() req) {
    const userId = req.user?.id;
    return this.approvalsService.findAll(queryDto, userId);
  }

  @Get('pending')
  async getPendingApprovals(@Request() req) {
    const userId = req.user?.id;
    return this.approvalsService.getPendingApprovals(userId);
  }

  @Get('stats/summary')
  async getStatsSummary(@Request() req) {
    const userId = req.user?.id;
    return this.approvalsService.getStatsSummary(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.approvalsService.findOne(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateApprovalDto: UpdateApprovalDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.approvalsService.update(id, updateApprovalDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.approvalsService.remove(id, userId);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Body() body: { comments?: string }, @Request() req) {
    const userId = req.user?.id;
    return this.approvalsService.approve(id, userId, body.comments);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Body() body: { comments?: string }, @Request() req) {
    const userId = req.user?.id;
    return this.approvalsService.reject(id, userId, body.comments);
  }

}