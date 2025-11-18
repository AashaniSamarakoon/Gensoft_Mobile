import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsArray, IsBoolean } from 'class-validator';

export class CreateProofDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  category: string; // 'Bill', 'Invoice', 'Receipt', 'Delivery Photo', 'Proof of Delivery', etc.

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  attachments?: string[]; // File URLs or base64 strings

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  jobNumber?: string;

  @IsOptional()
  @IsString()
  customer?: string;

  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;
}