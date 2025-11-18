import { IsOptional, IsString, IsDateString, IsInt, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryApprovalDto {
  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn(['iou', 'proof', 'settlement', 'task'])
  itemType?: string;

  @IsOptional()
  @IsString()
  requestedBy?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  moduleId?: string; // Filter by module

  @IsOptional()
  @IsString()
  moduleName?: string; // Filter by module name

  @IsOptional()
  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

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
  @IsIn(['createdAt', 'updatedAt', 'title', 'priority', 'status'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}