import { IsOptional, IsString, IsDateString, IsInt, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QuerySettlementDto {
  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID'])
  status?: string;

  @IsOptional()
  @IsString()
  payee?: string;

  @IsOptional()
  @IsString()
  module?: string;

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
  @IsIn(['createdAt', 'updatedAt', 'payee', 'iouAmount', 'status'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}