import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateIOUDto, IOUStatus } from './dto/create-iou.dto';
import { UpdateIOUDto } from './dto/update-iou.dto';
import { QueryIOUDto } from './dto/query-iou.dto';

@Injectable()
export class IOUService {
  constructor(private prisma: PrismaService) {}

  async create(createIOUDto: CreateIOUDto, createdById: string) {
    // Check if the user is trying to create IOU to themselves
    if (createIOUDto.receivedById === createdById) {
      throw new BadRequestException('Cannot create IOU to yourself');
    }

    // Verify both users exist
    const [createdBy, receivedBy] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: createdById } }),
      this.prisma.user.findUnique({ where: { id: createIOUDto.receivedById } }),
    ]);

    if (!createdBy) {
      throw new NotFoundException('Creator user not found');
    }

    if (!receivedBy) {
      throw new NotFoundException('Receiver user not found');
    }

    return this.prisma.iOU.create({
      data: {
        amount: createIOUDto.amount,
        currency: createIOUDto.currency || 'USD',
        description: createIOUDto.description,
        dueDate: createIOUDto.dueDate ? new Date(createIOUDto.dueDate) : null,
        createdById,
        receivedById: createIOUDto.receivedById,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        receivedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findAll(queryDto: QueryIOUDto) {
    const page = parseInt(queryDto.page || '1');
    const limit = parseInt(queryDto.limit || '10');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (queryDto.status) {
      where.status = queryDto.status;
    }

    if (queryDto.createdById) {
      where.createdById = queryDto.createdById;
    }

    if (queryDto.receivedById) {
      where.receivedById = queryDto.receivedById;
    }

    if (queryDto.fromDate || queryDto.toDate) {
      where.createdAt = {};
      if (queryDto.fromDate) {
        where.createdAt.gte = new Date(queryDto.fromDate);
      }
      if (queryDto.toDate) {
        where.createdAt.lte = new Date(queryDto.toDate);
      }
    }

    const [ious, total] = await Promise.all([
      this.prisma.iOU.findMany({
        where,
        skip,
        take: limit,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          receivedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.iOU.count({ where }),
    ]);

    return {
      data: ious,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const iou = await this.prisma.iOU.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        receivedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!iou) {
      throw new NotFoundException(`IOU with ID ${id} not found`);
    }

    return iou;
  }

  async update(id: string, updateIOUDto: UpdateIOUDto, userId: string) {
    const iou = await this.prisma.iOU.findUnique({
      where: { id },
    });

    if (!iou) {
      throw new NotFoundException(`IOU with ID ${id} not found`);
    }

    // Only creator or receiver can update the IOU
    if (iou.createdById !== userId && iou.receivedById !== userId) {
      throw new BadRequestException('You can only update your own IOUs');
    }

    const updateData: any = {};

    if (updateIOUDto.amount !== undefined) {
      updateData.amount = updateIOUDto.amount;
    }

    if (updateIOUDto.currency !== undefined) {
      updateData.currency = updateIOUDto.currency;
    }

    if (updateIOUDto.description !== undefined) {
      updateData.description = updateIOUDto.description;
    }

    if (updateIOUDto.dueDate !== undefined) {
      updateData.dueDate = updateIOUDto.dueDate ? new Date(updateIOUDto.dueDate) : null;
    }

    if (updateIOUDto.status !== undefined) {
      updateData.status = updateIOUDto.status;
      if (updateIOUDto.status === IOUStatus.PAID) {
        updateData.paidAt = new Date();
      }
    }

    return this.prisma.iOU.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        receivedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const iou = await this.prisma.iOU.findUnique({
      where: { id },
    });

    if (!iou) {
      throw new NotFoundException(`IOU with ID ${id} not found`);
    }

    // Only creator can delete the IOU
    if (iou.createdById !== userId) {
      throw new BadRequestException('You can only delete IOUs you created');
    }

    return this.prisma.iOU.delete({
      where: { id },
    });
  }

  async markAsPaid(id: string, userId: string) {
    return this.update(id, { status: IOUStatus.PAID }, userId);
  }

  async getUserIOUStats(userId: string) {
    const [totalCreated, totalReceived, totalPaid, totalPending] = await Promise.all([
      this.prisma.iOU.count({
        where: { createdById: userId },
      }),
      this.prisma.iOU.count({
        where: { receivedById: userId },
      }),
      this.prisma.iOU.count({
        where: {
          OR: [{ createdById: userId }, { receivedById: userId }],
          status: IOUStatus.PAID,
        },
      }),
      this.prisma.iOU.count({
        where: {
          OR: [{ createdById: userId }, { receivedById: userId }],
          status: IOUStatus.PENDING,
        },
      }),
    ]);

    const [amountOwed, amountOwing] = await Promise.all([
      this.prisma.iOU.aggregate({
        where: {
          receivedById: userId,
          status: IOUStatus.PENDING,
        },
        _sum: { amount: true },
      }),
      this.prisma.iOU.aggregate({
        where: {
          createdById: userId,
          status: IOUStatus.PENDING,
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalCreated,
      totalReceived,
      totalPaid,
      totalPending,
      amountOwed: amountOwed._sum.amount || 0,
      amountOwing: amountOwing._sum.amount || 0,
    };
  }
}