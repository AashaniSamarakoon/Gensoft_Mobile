import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { IOUStatus } from './create-iou.dto';

export class QueryIOUDto {
  @IsOptional()
  @IsEnum(IOUStatus)
  status?: IOUStatus;

  @IsOptional()
  @IsString()
  createdById?: string;

  @IsOptional()
  @IsString()
  receivedById?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  page?: string = '1';

  @IsOptional()
  @IsString()
  limit?: string = '10';
}