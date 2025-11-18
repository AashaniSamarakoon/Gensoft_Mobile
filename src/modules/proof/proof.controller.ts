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
import { ProofService } from './proof.service';
import { CreateProofDto } from './dto/create-proof.dto';
import { UpdateProofDto } from './dto/update-proof.dto';
import { QueryProofDto } from './dto/query-proof.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/proof')
@UseGuards(JwtAuthGuard)
export class ProofController {
  constructor(private readonly proofService: ProofService) {}

  @Post()
  async create(@Body() createProofDto: CreateProofDto, @Request() req) {
    const userId = req.user?.id;
    const proof = await this.proofService.create(createProofDto, userId);
    return {
      success: true,
      message: 'Proof created successfully',
      data: proof,
    };
  }

  @Get()
  async findAll(@Query() queryDto: QueryProofDto, @Request() req) {
    const userId = req.user?.id;
    const proofs = await this.proofService.findAll(queryDto, userId);
    return {
      success: true,
      data: proofs,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.proofService.findOne(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProofDto: UpdateProofDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.proofService.update(id, updateProofDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.proofService.remove(id, userId);
  }

  @Get('stats/summary')
  async getStatsSummary(@Request() req) {
    const userId = req.user?.id;
    return this.proofService.getStatsSummary(userId);
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.proofService.submit(id, userId);
  }

  @Get('category/:category')
  async findByCategory(
    @Param('category') category: string,
    @Query() queryDto: QueryProofDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.proofService.findByCategory(category, queryDto);
  }
}