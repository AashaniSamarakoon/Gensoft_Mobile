import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator';

export class VerifyPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class SetMobilePasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  mobilePassword: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}