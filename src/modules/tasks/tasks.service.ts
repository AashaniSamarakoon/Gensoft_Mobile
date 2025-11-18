import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const data: any = {
      ...createTaskDto,
      userId,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      status: 'TODO' as const,
    };

    return this.prisma.task.create({
      data,
    });
  }

  async findAll(queryDto: QueryTaskDto, userId?: string) {
    const {
      status,
      category,
      assignedTo,
      assignedBy,
      priority,
      jobNumber,
      customer,
      employeeId,
      fromDate,
      toDate,
      dueDateFrom,
      dueDateTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const where: any = {};

    if (userId) {
      where.OR = [
        { userId },
        { assignedTo: userId },
        { assignedBy: userId },
      ];
    }

    if (status) where.status = status;
    if (category) where.category = category;
    if (assignedTo) where.assignedTo = assignedTo;
    if (assignedBy) where.assignedBy = assignedBy;
    if (priority) where.priority = priority;
    if (jobNumber) where.jobNumber = jobNumber;
    if (customer) where.customer = { contains: customer };
    if (employeeId) where.employeeId = employeeId;

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo);
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId?: string) {
    const where: any = { id };

    if (userId) {
      where.OR = [
        { userId },
        { assignedTo: userId },
        { assignedBy: userId },
      ];
    }

    const task = await this.prisma.task.findFirst({
      where,
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId?: string) {
    const where: any = { id };

    if (userId) {
      where.OR = [
        { userId },
        { assignedTo: userId },
        { assignedBy: userId },
      ];
    }

    const data: any = { ...updateTaskDto };

    if (updateTaskDto.completedAt) {
      data.completedAt = new Date(updateTaskDto.completedAt);
    }

    if (updateTaskDto.status === 'COMPLETED' && !data.completedAt) {
      data.completedAt = new Date();
    }

    return this.prisma.task.update({
      where,
      data,
    });
  }

  async remove(id: string, userId?: string) {
    const where: any = { id };

    if (userId) {
      where.OR = [
        { userId },
        { assignedBy: userId }, // Only creator or assigner can delete
      ];
    }

    return this.prisma.task.delete({
      where,
    });
  }

  async getStatistics(userId?: string) {
    const where: any = {};

    if (userId) {
      where.OR = [
        { userId },
        { assignedTo: userId },
        { assignedBy: userId },
      ];
    }

    const [total, todo, inProgress, completed, cancelled, onHold] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.count({ where: { ...where, status: 'TODO' } }),
      this.prisma.task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      this.prisma.task.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.task.count({ where: { ...where, status: 'CANCELLED' } }),
      this.prisma.task.count({ where: { ...where, status: 'ON_HOLD' } }),
    ]);

    return {
      total,
      todo,
      inProgress,
      completed,
      cancelled,
      onHold,
    };
  }

  async getStatsSummary(userId?: string) {
    return this.getStatistics(userId);
  }

  async getMyTasks(userId: string) {
    return this.prisma.task.findMany({
      where: {
        assignedTo: userId,
        status: {
          in: ['TODO', 'IN_PROGRESS'],
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async markInProgress(id: string, userId?: string) {
    const where: any = { id };

    if (userId) {
      where.assignedTo = userId;
    }

    return this.prisma.task.update({
      where,
      data: {
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      },
    });
  }

  async markCompleted(id: string, userId?: string, actualHours?: number) {
    const where: any = { id };

    if (userId) {
      where.assignedTo = userId;
    }

    const data: any = {
      status: 'COMPLETED',
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    if (actualHours !== undefined) {
      data.actualHours = actualHours;
    }

    return this.prisma.task.update({
      where,
      data,
    });
  }
}