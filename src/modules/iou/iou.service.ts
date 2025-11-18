import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateIOUDto, IOUStatus } from './dto/create-iou.dto';
import { UpdateIOUDto } from './dto/update-iou.dto';
import { QueryIOUDto } from './dto/query-iou.dto';

@Injectable()
export class IOUService {
  constructor(private prisma: PrismaService) {}

  async create(createIOUDto: CreateIOUDto, createdById: string) {
    let receivedById: string;

    // Handle email-based IOU creation (mobile app compatibility)
    if (createIOUDto.debtorEmail) {
      // Find user by email (could be MobileAppUser or regular User)
      const receivedByMobile = await this.prisma.mobileAppUser.findUnique({
        where: { email: createIOUDto.debtorEmail }
      });

      if (receivedByMobile) {
        receivedById = receivedByMobile.id;
      } else {
        // Try to find in regular users table
        const receivedByRegular = await this.prisma.user.findUnique({
          where: { email: createIOUDto.debtorEmail }
        });
        
        if (receivedByRegular) {
          receivedById = receivedByRegular.id;
        } else {
          throw new NotFoundException(`User with email ${createIOUDto.debtorEmail} not found`);
        }
      }
    } else if (createIOUDto.receivedById) {
      receivedById = createIOUDto.receivedById;
    } else {
      throw new BadRequestException('Either receivedById or debtorEmail must be provided');
    }

    // Check if the user is trying to create IOU to themselves
    if (receivedById === createdById) {
      throw new BadRequestException('Cannot create IOU to yourself');
    }

    // Verify creator exists (check both user tables)
    const createdBy = await this.prisma.mobileAppUser.findUnique({ 
      where: { id: createdById } 
    }) || await this.prisma.user.findUnique({ 
      where: { id: createdById } 
    });

    if (!createdBy) {
      throw new NotFoundException('Creator user not found');
    }

    // Parse amount from string if needed
    const amountValue = typeof createIOUDto.amount === 'string' 
      ? parseFloat(createIOUDto.amount) 
      : createIOUDto.amount;

    if (isNaN(amountValue)) {
      throw new BadRequestException('Invalid amount value');
    }

    // Combine title and description for the description field
    const description = createIOUDto.title 
      ? `${createIOUDto.title}${createIOUDto.description ? ': ' + createIOUDto.description : ''}`
      : createIOUDto.description;

    return this.prisma.iOU.create({
      data: {
        amount: amountValue,
        currency: createIOUDto.currency || 'USD',
        description: description,
        dueDate: createIOUDto.dueDate ? new Date(createIOUDto.dueDate) : null,
        createdById,
        receivedById,
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

  async getStatistics(userId?: string) {
    const where: any = {};
    if (userId) where.createdById = userId;

    const [total, pending, paid, cancelled, overdue] = await Promise.all([
      this.prisma.iOU.count({ where }),
      this.prisma.iOU.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.iOU.count({ where: { ...where, status: 'PAID' } }),
      this.prisma.iOU.count({ where: { ...where, status: 'CANCELLED' } }),
      this.prisma.iOU.count({ where: { ...where, status: 'OVERDUE' } }),
    ]);

    return {
      total,
      pending,
      paid,
      cancelled,
      overdue,
    };
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