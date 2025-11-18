import { PartialType } from '@nestjs/mapped-types';
import { CreateApprovalDto } from './create-approval.dto';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateApprovalDto extends PartialType(CreateApprovalDto) {
  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsString()
  approvedBy?: string;
}