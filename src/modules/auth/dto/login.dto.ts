import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsObject()
  deviceInfo?: {
    deviceId?: string;
    platform?: string;
    version?: string;
    model?: string;
  };
}

export class QuickLoginDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsObject()
  deviceInfo?: {
    deviceId?: string;
    platform?: string;
    version?: string;
    model?: string;
  };
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}