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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { IOUService } from './iou.service';
import { CreateIOUDto } from './dto/create-iou.dto';
import { UpdateIOUDto } from './dto/update-iou.dto';
import { QueryIOUDto } from './dto/query-iou.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('iou')
@UseGuards(JwtAuthGuard)
export class IOUController {
  constructor(private readonly iouService: IOUService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createIOUDto: CreateIOUDto, @Request() req: any) {
    const userId = req.user.userId;
    return this.iouService.create(createIOUDto, userId);
  }

  @Get()
  async findAll(@Query() queryDto: QueryIOUDto) {
    return this.iouService.findAll(queryDto);
  }

  @Get('stats/:userId')
  async getUserStats(@Param('userId') userId: string) {
    return this.iouService.getUserIOUStats(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.iouService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIOUDto: UpdateIOUDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.iouService.update(id, updateIOUDto, userId);
  }

  @Patch(':id/mark-paid')
  @HttpCode(HttpStatus.OK)
  async markAsPaid(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    return this.iouService.markAsPaid(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    await this.iouService.remove(id, userId);
  }
}