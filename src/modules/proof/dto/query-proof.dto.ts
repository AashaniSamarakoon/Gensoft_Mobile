import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class QueryProofDto {
  @IsOptional()
  @IsString()
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  category?: string;

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
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}