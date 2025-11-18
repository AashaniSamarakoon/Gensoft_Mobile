import { IsString, IsOptional, IsNumber, IsDecimal, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSettlementDto {
  @IsString()
  @IsNotEmpty()
  payee: string;

  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsString()
  jobNumber?: string;

  @IsOptional()
  @IsString()
  customer?: string;

  @IsString()
  @IsNotEmpty()
  refNo: string;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  iouAmount: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  returnAmount?: number;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  utilized: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  tax?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  vat?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  costCenter?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  isDraft?: boolean;
}