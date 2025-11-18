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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    const userId = req.user?.id;
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  async findAll(@Query() queryDto: QueryTaskDto, @Request() req) {
    const userId = req.user?.id;
    return this.tasksService.findAll(queryDto, userId);
  }

  @Get('my-tasks')
  async getMyTasks(@Request() req) {
    const userId = req.user?.id;
    return this.tasksService.getMyTasks(userId);
  }

  @Get('stats/summary')
  async getStatsSummary(@Request() req) {
    const userId = req.user?.id;
    return this.tasksService.getStatsSummary(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.tasksService.findOne(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.tasksService.remove(id, userId);
  }

  @Post(':id/start')
  async markInProgress(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.tasksService.markInProgress(id, userId);
  }

  @Post(':id/complete')
  async markCompleted(
    @Param('id') id: string,
    @Body() body: { actualHours?: number },
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.tasksService.markCompleted(id, userId, body.actualHours);
  }
}