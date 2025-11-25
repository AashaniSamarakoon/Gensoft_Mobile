import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { QueryApprovalDto } from './dto/query-approval.dto';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async create(createApprovalDto: CreateApprovalDto) {
    // Validate module if provided
    if (createApprovalDto.moduleId) {
      const module = await this.prisma.module.findUnique({
        where: { id: createApprovalDto.moduleId, isActive: true }
      });
      
      if (!module) {
        throw new Error('Invalid or inactive module specified');
      }
    }

    const approval = await this.prisma.approval.create({
      data: {
        ...createApprovalDto,
        status: 'PENDING',
      },
      include: {
        module: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      }
    });

    return {
      success: true,
      message: 'Approval created successfully',
      data: approval
    };
  }

  async getApprovalsByModule(moduleId: string, queryDto: QueryApprovalDto, userId?: string) {
    const {
      status,
      itemType,
      priority,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const where: any = { moduleId };

    if (status) where.status = status;
    if (itemType) where.itemType = itemType;
    if (priority) where.priority = priority;
    
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    // Filter by user - either requested by or assigned to
    if (userId) {
      where.OR = [
        { requestedBy: userId },
        { assignedTo: userId },
      ];
    }

    const skip = (page - 1) * limit;

    const [approvals, total, module] = await Promise.all([
      this.prisma.approval.findMany({
        where,
        include: {
          module: {
            select: {
              id: true,
              name: true,
              displayName: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.approval.count({ where }),
      this.prisma.module.findUnique({
        where: { id: moduleId },
        select: { id: true, name: true, displayName: true, description: true }
      })
    ]);

    return {
      success: true,
      data: approvals,
      module: module,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAll(queryDto: QueryApprovalDto, userId?: string) {
    const {
      status,
      itemType,
      requestedBy,
      assignedTo,
      moduleId,
      moduleName,
      priority,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const where: any = {};

    if (status) where.status = status;
    if (itemType) where.itemType = itemType;
    if (requestedBy) where.requestedBy = requestedBy;
    if (assignedTo) where.assignedTo = assignedTo;
    if (priority) where.priority = priority;
    
    // Module filtering
    if (moduleId) {
      where.moduleId = moduleId;
    } else if (moduleName) {
      where.module = {
        name: moduleName
      };
    }
    
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    // Filter by user - either requested by or assigned to
    if (userId) {
      where.OR = [
        { requestedBy: userId },
        { assignedTo: userId },
      ];
    }

    const skip = (page - 1) * limit;

    const [approvals, total] = await Promise.all([
      this.prisma.approval.findMany({
        where,
        include: {
          module: {
            select: {
              id: true,
              name: true,
              displayName: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.approval.count({ where }),
    ]);

    return {
      data: approvals,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId?: string) {
    const where: any = { id };

    // Allow access if user is either requester or approver
    if (userId) {
      where.OR = [
        { requestedBy: userId },
        { assignedTo: userId },
      ];
    }

    const approval = await this.prisma.approval.findFirst({
      where,
      include: {
        module: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true
          }
        }
      }
    });

    if (!approval) {
      throw new Error('Approval not found');
    }

    return {
      success: true,
      data: approval
    };
  }

  async update(id: string, updateApprovalDto: UpdateApprovalDto, userId?: string) {
    const where: any = { id };

    // Allow access if user is either requester or approver
    if (userId) {
      where.OR = [
        { requestedBy: userId },
        { assignedTo: userId },
      ];
    }

    const data: any = { ...updateApprovalDto };
    return this.prisma.approval.update({
      where,
      data,
    });
  }

  async remove(id: string, userId?: string) {
    const where: any = { id };

    if (userId) {
      where.requestedBy = userId; // Only requester can delete
    }

    return this.prisma.approval.delete({
      where,
    });
  }

  async approve(id: string, userId: string, comments?: string) {
    return this.prisma.approval.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        comments,
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async reject(id: string, userId: string, comments?: string) {
    return this.prisma.approval.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy: userId,
        comments,
        updatedAt: new Date(),
      },
    });
  }

  async getStatistics(userId?: string) {
    const where: any = {};

    if (userId) {
      where.OR = [
        { requestedBy: userId },
        { assignedTo: userId },
      ];
    }

    const [total, pending, approved, rejected, cancelled] = await Promise.all([
      this.prisma.approval.count({ where }),
      this.prisma.approval.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.approval.count({ where: { ...where, status: 'APPROVED' } }),
      this.prisma.approval.count({ where: { ...where, status: 'REJECTED' } }),
      this.prisma.approval.count({ where: { ...where, status: 'CANCELLED' } }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      cancelled,
    };
  }

  async getStatsSummary(userId?: string) {
    return this.getStatistics(userId);
  }

  async getPendingApprovals(userId: string) {
    return this.prisma.approval.findMany({
      where: {
        assignedTo: userId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getModules() {
    try {
      // Get active modules from the database
      const modules = await this.prisma.module.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          displayName: true,
          description: true,
          sortOrder: true
        },
        orderBy: { sortOrder: 'asc' }
      });

      return {
        success: true,
        data: modules,
        total: modules.length
      };
    } catch (error) {
      console.error('Error fetching modules:', error);
      return {
        success: false,
        message: 'Failed to fetch modules',
        error: error.message,
        data: []
      };
    }
  }
}