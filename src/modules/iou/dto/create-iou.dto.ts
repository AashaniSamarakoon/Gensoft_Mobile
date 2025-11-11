import { IsNotEmpty, IsString, IsDecimal, IsOptional, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export enum IOUStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export class CreateIOUDto {
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsNotEmpty()
  @IsUUID()
  receivedById: string;
}