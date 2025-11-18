import { PartialType } from '@nestjs/mapped-types';
import { CreateSettlementDto } from './create-settlement.dto';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateSettlementDto extends PartialType(CreateSettlementDto) {
  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID'])
  status?: string;
}