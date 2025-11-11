import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class ScanQRCodeDto {
  @IsNotEmpty()
  @IsString()
  qrData: string;

  @IsOptional()
  @IsObject()
  deviceInfo?: {
    deviceId?: string;
    platform?: string;
    version?: string;
    model?: string;
  };
}