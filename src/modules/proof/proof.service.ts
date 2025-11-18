import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProofDto } from './dto/create-proof.dto';
import { UpdateProofDto } from './dto/update-proof.dto';
import { QueryProofDto } from './dto/query-proof.dto';

@Injectable()
export class ProofService {
  constructor(private prisma: PrismaService) {}

  async create(createProofDto: CreateProofDto, userId: string) {
    const proof = await this.prisma.proof.create({
      data: {
        ...createProofDto,
        userId,
        status: createProofDto.isDraft ? 'DRAFT' : 'SUBMITTED',
        attachments: createProofDto.attachments ? JSON.stringify(createProofDto.attachments) : null,
      },
    });

    return {
      ...proof,
      attachments: proof.attachments ? JSON.parse(proof.attachments) : [],
    };
  }

  async findAll(queryDto: QueryProofDto, userId?: string) {
    const {
      status,
      category,
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
    if (category) where.category = category;
    if (employeeId) where.employeeId = employeeId;
    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date.gte = new Date(fromDate);
      if (toDate) where.date.lte = new Date(toDate);
    }

    const skip = (page - 1) * limit;

    const [proofs, total] = await Promise.all([
      this.prisma.proof.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.proof.count({ where }),
    ]);

    return {
      data: proofs.map(proof => ({
        ...proof,
        attachments: proof.attachments ? JSON.parse(proof.attachments) : [],
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    const proof = await this.prisma.proof.findFirst({
      where,
    });

    if (!proof) {
      throw new Error('Proof not found');
    }

    return {
      ...proof,
      attachments: proof.attachments ? JSON.parse(proof.attachments) : [],
    };
  }

  async update(id: string, updateProofDto: UpdateProofDto, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    const { attachments, ...updateData } = updateProofDto;
    const data: any = { ...updateData };
    
    if (attachments) {
      data.attachments = JSON.stringify(attachments);
    }

    const proof = await this.prisma.proof.update({
      where,
      data,
    });

    return {
      ...proof,
      attachments: proof.attachments ? JSON.parse(proof.attachments) : [],
    };
  }

  async remove(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    return this.prisma.proof.delete({
      where,
    });
  }

  async getStatistics(userId?: string) {
    const where: any = {};
    if (userId) where.userId = userId;

    const [total, draft, submitted, approved, rejected] = await Promise.all([
      this.prisma.proof.count({ where }),
      this.prisma.proof.count({ where: { ...where, status: 'DRAFT' } }),
      this.prisma.proof.count({ where: { ...where, status: 'SUBMITTED' } }),
      this.prisma.proof.count({ where: { ...where, status: 'APPROVED' } }),
      this.prisma.proof.count({ where: { ...where, status: 'REJECTED' } }),
    ]);

    return {
      total,
      draft,
      submitted,
      approved,
      rejected,
    };
  }

  async getStatsSummary(userId?: string) {
    return this.getStatistics(userId);
  }

  async submit(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    const proof = await this.prisma.proof.update({
      where,
      data: {
        status: 'SUBMITTED',
        updatedAt: new Date(),
      },
    });

    return {
      ...proof,
      attachments: proof.attachments ? JSON.parse(proof.attachments) : [],
    };
  }

  async findByCategory(category: string, queryDto: QueryProofDto) {
    return this.findAll({
      ...queryDto,
      category,
    });
  }
}