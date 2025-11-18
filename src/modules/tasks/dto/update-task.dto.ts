import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsString, IsIn, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsString()
  @IsIn(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'])
  status?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  actualHours?: number;
}