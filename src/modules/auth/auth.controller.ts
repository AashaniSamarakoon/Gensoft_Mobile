import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { QuickLoginGuard } from './guards/quick-login.guard';

import { ScanQRCodeDto } from './dto/scan-qr.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPasswordDto, SetMobilePasswordDto } from './dto/verify-password.dto';
import { LoginDto, QuickLoginDto, RefreshTokenDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Step 1: Scan QR Code from main ERP system
   * POST /api/v1/auth/scan-qr
   */
  @Post('scan-qr')
  @HttpCode(HttpStatus.OK)
  async scanQRCode(@Body() scanQRDto: ScanQRCodeDto) {
    return this.authService.scanQRCode(scanQRDto);
  }

  /**
   * Step 2: Verify email with 6-digit code
   * POST /api/v1/auth/verify-email
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  /**
   * Step 3: Verify main ERP system password
   * POST /api/v1/auth/verify-password
   */
  @Post('verify-password')
  @HttpCode(HttpStatus.OK)
  async verifyMainERPPassword(@Body() verifyPasswordDto: VerifyPasswordDto) {
    return this.authService.verifyMainERPPassword(verifyPasswordDto);
  }

  /**
   * Step 4: Set mobile app password and complete registration
   * POST /api/v1/auth/set-mobile-password
   */
  @Post('set-mobile-password')
  @HttpCode(HttpStatus.CREATED)
  async setMobilePassword(@Body() setPasswordDto: SetMobilePasswordDto) {
    return this.authService.setMobilePassword(setPasswordDto);
  }

  /**
   * Regular login with username and password
   * POST /api/v1/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Quick login for returning users
   * POST /api/v1/auth/quick-login
   */
  @Post('quick-login')
  @HttpCode(HttpStatus.OK)
  async quickLogin(@Body() quickLoginDto: QuickLoginDto) {
    return this.authService.quickLogin(quickLoginDto);
  }

  /**
   * Get saved accounts for account selection
   * GET /api/v1/auth/saved-accounts
   */
  @Get('saved-accounts')
  async getSavedAccounts(@Query('deviceId') deviceId?: string) {
    return this.authService.getSavedAccounts(deviceId);
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: any) {
    return this.authService.logout(req.user.userId, req.user.sessionId);
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return {
      success: true,
      data: {
        userId: req.user.userId,
        username: req.user.username,
        email: req.user.email,
        name: req.user.name,
        sessionId: req.user.sessionId,
      },
    };
  }

  /**
   * Recover user session - for when quick login fails due to corrupted state
   * POST /api/v1/auth/recover-session
   */
  @Post('recover-session')
  @HttpCode(HttpStatus.OK)
  async recoverSession(@Body() body: { email: string }) {
    return this.authService.recoverUserSession(body.email);
  }

  /**
   * Health check for authentication service
   * GET /api/v1/auth/health
   */
  @Get('health')
  async healthCheck() {
    return {
      success: true,
      message: 'Authentication service is running',
      timestamp: new Date().toISOString(),
      service: 'Mobile ERP Authentication',
    };
  }
}