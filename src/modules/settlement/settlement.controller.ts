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
import { SettlementService } from './settlement.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { UpdateSettlementDto } from './dto/update-settlement.dto';
import { QuerySettlementDto } from './dto/query-settlement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/settlement')
@UseGuards(JwtAuthGuard)
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Post()
  async create(@Body() createSettlementDto: CreateSettlementDto, @Request() req) {
    const userId = req.user?.id;
    return this.settlementService.create(createSettlementDto, userId);
  }

  @Get()
  async findAll(@Query() queryDto: QuerySettlementDto, @Request() req) {
    const userId = req.user?.id;
    return this.settlementService.findAll(queryDto, userId);
  }

  @Get('stats/summary')
  async getStatsSummary(@Request() req) {
    const userId = req.user?.id;
    return this.settlementService.getStatsSummary(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.settlementService.findOne(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSettlementDto: UpdateSettlementDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.settlementService.update(id, updateSettlementDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.settlementService.remove(id, userId);
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.settlementService.submit(id, userId);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.settlementService.approve(id, userId);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Body() body: { reason?: string }, @Request() req) {
    const userId = req.user?.id;
    return this.settlementService.reject(id, userId, body.reason);
  }
}