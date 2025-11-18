import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { QueryApprovalDto } from './dto/query-approval.dto';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async create(createApprovalDto: CreateApprovalDto) {
    return this.prisma.approval.create({
      data: {
        ...createApprovalDto,
        status: 'PENDING',
      },
    });
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
    });

    if (!approval) {
      throw new Error('Approval not found');
    }

    return approval;
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
      // Try to get modules from the database
      const modules = await this.prisma.$queryRaw`
        SELECT id, name, displayName, description, sortOrder 
        FROM modules 
        WHERE isActive = 1 
        ORDER BY sortOrder ASC
      `;
      return { success: true, data: modules };
    } catch (error) {
      // If there's an error (like table doesn't exist), return hardcoded modules
      console.warn('Could not fetch modules from database, using fallback:', error.message);
      return {
        success: true,
        data: [
          { id: 'all', name: 'all', displayName: 'All', description: 'All modules', sortOrder: 0 },
          { id: 'employee', name: 'employee', displayName: 'Employee', description: 'Employee management', sortOrder: 1 },
          { id: 'accounts', name: 'accounts', displayName: 'Accounts', description: 'Financial accounting', sortOrder: 2 },
          { id: 'crm', name: 'crm', displayName: 'CRM', description: 'Customer relationship management', sortOrder: 3 },
          { id: 'sea_import', name: 'sea_import', displayName: 'Sea Import', description: 'Sea freight import', sortOrder: 4 },
          { id: 'sea_export', name: 'sea_export', displayName: 'Sea Export', description: 'Sea freight export', sortOrder: 5 },
          { id: 'iou', name: 'iou', displayName: 'IOU', description: 'I Owe You management', sortOrder: 17 }
        ]
      };
    }
  }
}