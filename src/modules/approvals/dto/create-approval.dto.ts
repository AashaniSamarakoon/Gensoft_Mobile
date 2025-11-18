import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateApprovalDto {
  @IsString()
  @IsNotEmpty()
  itemType: string; // 'iou', 'proof', 'settlement', 'task'

  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsOptional()
  @IsString()
  moduleId?: string; // Reference to module

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  amount?: number;

  @IsString()
  @IsNotEmpty()
  requestedBy: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  priority?: string = 'MEDIUM';

  // Job related fields
  @IsOptional()
  @IsString()
  jobNumber?: string;

  @IsOptional()
  @IsString()
  customerPayee?: string;

  @IsOptional()
  @IsString()
  refNo?: string;

  @IsOptional()
  @IsString()
  blNo?: string;

  @IsOptional()
  @IsString()
  invNo?: string;
}