import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { UpdateSettlementDto } from './dto/update-settlement.dto';
import { QuerySettlementDto } from './dto/query-settlement.dto';

@Injectable()
export class SettlementService {
  constructor(private prisma: PrismaService) {}

  async create(createSettlementDto: CreateSettlementDto, userId: string) {
    const settlement = await this.prisma.settlement.create({
      data: {
        ...createSettlementDto,
        userId,
        status: createSettlementDto.isDraft ? 'DRAFT' : 'SUBMITTED',
      },
    });

    return settlement;
  }

  async findAll(queryDto: QuerySettlementDto, userId?: string) {
    const {
      status,
      payee,
      module,
      jobNumber,
      customer,
      employeeId,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const where: any = {};

    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (payee) where.payee = { contains: payee };
    if (module) where.module = module;
    if (jobNumber) where.jobNumber = jobNumber;
    if (customer) where.customer = { contains: customer };
    if (employeeId) where.employeeId = employeeId;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const skip = (page - 1) * limit;

    const [settlements, total] = await Promise.all([
      this.prisma.settlement.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.settlement.count({ where }),
    ]);

    return {
      data: settlements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    const settlement = await this.prisma.settlement.findFirst({
      where,
    });

    if (!settlement) {
      throw new Error('Settlement not found');
    }

    return settlement;
  }

  async update(id: string, updateSettlementDto: UpdateSettlementDto, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    const data: any = { ...updateSettlementDto };
    return this.prisma.settlement.update({
      where,
      data,
    });
  }

  async remove(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    return this.prisma.settlement.delete({
      where,
    });
  }

  async getStatistics(userId?: string) {
    const where: any = {};
    if (userId) where.userId = userId;

    const [total, draft, submitted, approved, rejected, paid] = await Promise.all([
      this.prisma.settlement.count({ where }),
      this.prisma.settlement.count({ where: { ...where, status: 'DRAFT' } }),
      this.prisma.settlement.count({ where: { ...where, status: 'SUBMITTED' } }),
      this.prisma.settlement.count({ where: { ...where, status: 'APPROVED' } }),
      this.prisma.settlement.count({ where: { ...where, status: 'REJECTED' } }),
      this.prisma.settlement.count({ where: { ...where, status: 'PAID' } }),
    ]);

    return {
      total,
      draft,
      submitted,
      approved,
      rejected,
      paid,
    };
  }

  async getStatsSummary(userId?: string) {
    return this.getStatistics(userId);
  }

  async submit(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    return this.prisma.settlement.update({
      where,
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async approve(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    return this.prisma.settlement.update({
      where,
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async reject(id: string, userId?: string, reason?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    return this.prisma.settlement.update({
      where,
      data: {
        status: 'REJECTED',
        updatedAt: new Date(),
      },
    });
  }
}