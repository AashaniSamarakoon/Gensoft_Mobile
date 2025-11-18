import { IsNotEmpty, IsString, IsDecimal, IsOptional, IsDateString, IsEnum, IsUUID, IsEmail, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export enum IOUStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export class CreateIOUDto {
  @IsOptional()
  @IsString()
  title?: string; // For mobile app compatibility

  @IsNotEmpty()
  @IsString()
  amount: string; // Accept as string for mobile app

  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  category?: string; // For mobile app compatibility

  // Support both UUID (new format) and email (mobile app format)
  @ValidateIf(o => !o.debtorEmail)
  @IsNotEmpty()
  @IsUUID()
  receivedById?: string;

  @ValidateIf(o => !o.receivedById)
  @IsNotEmpty()
  @IsEmail()
  debtorEmail?: string; // For mobile app compatibility
}