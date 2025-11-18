import { IsString, IsOptional, IsDateString, IsInt, IsNotEmpty } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  priority?: string = 'MEDIUM';

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
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estimatedHours?: number;

  @IsOptional()
  @IsString()
  jobNumber?: string;

  @IsOptional()
  @IsString()
  customer?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  coordinates?: string; // JSON string with lat/lng

  @IsOptional()
  @IsString()
  employeeId?: string;
}