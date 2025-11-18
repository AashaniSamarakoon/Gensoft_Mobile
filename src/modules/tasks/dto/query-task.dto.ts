import { IsOptional, IsString, IsDateString, IsInt, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryTaskDto {
  @IsOptional()
  @IsString()
  @IsIn(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'])
  status?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  assignedBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @IsOptional()
  @IsString()
  jobNumber?: string;

  @IsOptional()
  @IsString()
  customer?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @IsOptional()
  @IsDateString()
  dueDateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'dueDate', 'title', 'priority', 'status'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}