import { PartialType } from '@nestjs/mapped-types';
import { CreateProofDto } from './create-proof.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProofDto extends PartialType(CreateProofDto) {
  @IsOptional()
  @IsString()
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
}