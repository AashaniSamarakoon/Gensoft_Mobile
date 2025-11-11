import { IsNotEmpty, IsString, IsEmail, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'Verification code must be exactly 6 digits' })
  verificationCode: string;
}