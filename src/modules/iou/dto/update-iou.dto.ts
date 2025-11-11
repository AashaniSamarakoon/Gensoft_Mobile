import { PartialType } from '@nestjs/mapped-types';
import { CreateIOUDto, IOUStatus } from './create-iou.dto';
import { IsOptional, IsEnum } from 'class-validator';

export class UpdateIOUDto extends PartialType(CreateIOUDto) {
  @IsOptional()
  @IsEnum(IOUStatus)
  status?: IOUStatus;
}