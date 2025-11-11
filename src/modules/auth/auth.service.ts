import { 
  Injectable, 
  BadRequestException, 
  UnauthorizedException, 
  ConflictException,
  Logger,
  NotFoundException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { MainERPMiddlewareService } from '../../services/main-erp-middleware.service';
import { EmailService } from '../../services/email.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { ScanQRCodeDto } from './dto/scan-qr.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPasswordDto, SetMobilePasswordDto } from './dto/verify-password.dto';
import { LoginDto, QuickLoginDto, RefreshTokenDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mainERPMiddleware: MainERPMiddlewareService,
    private emailService: EmailService,
  ) {}

  /**
   * Step 1: Scan QR Code and initiate registration
   */
  async scanQRCode(scanQRDto: ScanQRCodeDto) {
    try {
      // Parse QR code data
      const qrData = this.mainERPMiddleware.parseQRCodeData(scanQRDto.qrData);
      
      // Validate QR token with main ERP system
      const mainERPUser = await this.mainERPMiddleware.validateQRCodeToken(qrData.qrToken);
      
      // Check if user already exists
      const existingUser = await this.prisma.mobileAppUser.findUnique({
        where: { mainErpUserId: mainERPUser.id },
      });

      if (existingUser && existingUser.isRegistered) {
        throw new ConflictException('User already registered. Please use login instead.');
      }

      // Store QR code session
      await this.prisma.qRCodeSession.create({
        data: {
          qrToken: qrData.qrToken,
          mainErpUserId: mainERPUser.id,
          userEmail: mainERPUser.email,
          userName: mainERPUser.name,
          userPhone: mainERPUser.phone,
          qrData: qrData as any,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        },
      });

      // Generate and send verification code
      const verificationCode = this.generateVerificationCode();
      const codeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store verification code
      await this.prisma.emailVerification.create({
        data: {
          email: mainERPUser.email,
          verificationCode,
          expiresAt: codeExpiry,
        },
      });

      // Send verification email
      await this.emailService.sendVerificationCode(
        mainERPUser.email,
        verificationCode,
        mainERPUser.name,
      );

      return {
        success: true,
        message: 'QR code scanned successfully. Verification code sent to email.',
        data: {
          email: mainERPUser.email,
          name: mainERPUser.name,
          username: mainERPUser.username,
          nextStep: 'email_verification',
        },
      };
    } catch (error) {
      this.logger.error(`QR scan failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Step 2: Verify Email with 6-digit code
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    // Find verification record
    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        email: verifyEmailDto.email,
        verificationCode: verifyEmailDto.verificationCode,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      // Increment attempts
      await this.prisma.emailVerification.updateMany({
        where: {
          email: verifyEmailDto.email,
          isUsed: false,
        },
        data: {
          attempts: { increment: 1 },
        },
      });

      throw new BadRequestException('Invalid or expired verification code');
    }

    // Check max attempts
    if (verification.attempts >= verification.maxAttempts) {
      throw new BadRequestException('Maximum verification attempts exceeded');
    }

    // Mark verification as used
    await this.prisma.emailVerification.update({
      where: { id: verification.id },
      data: { isUsed: true },
    });

    return {
      success: true,
      message: 'Email verified successfully',
      nextStep: 'password_verification',
    };
  }

  /**
   * Step 3: Verify main ERP system password
   */
  async verifyMainERPPassword(verifyPasswordDto: VerifyPasswordDto) {
    // Get QR session data
    const qrSession = await this.prisma.qRCodeSession.findFirst({
      where: {
        userEmail: verifyPasswordDto.email,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!qrSession) {
      throw new BadRequestException('QR session expired. Please scan QR code again.');
    }

    // Verify password with main ERP system
    const isValidPassword = await this.mainERPMiddleware.verifyUserPassword({
      userId: qrSession.mainErpUserId,
      username: (qrSession.qrData as any).username,
      password: verifyPasswordDto.password,
    });

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    return {
      success: true,
      message: 'Main ERP password verified successfully',
      nextStep: 'set_mobile_password',
    };
  }

  /**
   * Step 4: Set mobile app password and complete registration
   */
  async setMobilePassword(setPasswordDto: SetMobilePasswordDto) {
    if (setPasswordDto.mobilePassword !== setPasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Get QR session data
    const qrSession = await this.prisma.qRCodeSession.findFirst({
      where: {
        userEmail: setPasswordDto.email,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!qrSession) {
      throw new BadRequestException('Registration session expired. Please start again.');
    }

    // Hash mobile password
    const hashedPassword = await bcrypt.hash(setPasswordDto.mobilePassword, 12);

    // Create or update mobile app user
    const mobileUser = await this.prisma.mobileAppUser.upsert({
      where: { mainErpUserId: qrSession.mainErpUserId },
      update: {
        emailVerified: true,
        passwordVerified: true,
        isRegistered: true,
        isActive: true,
      },
      create: {
        mainErpUserId: qrSession.mainErpUserId,
        email: qrSession.userEmail,
        name: qrSession.userName,
        phone: qrSession.userPhone,
        username: (qrSession.qrData as any).username,
        emailVerified: true,
        passwordVerified: true,
        isRegistered: true,
        isActive: true,
      },
    });

    // Mark QR session as used
    await this.prisma.qRCodeSession.update({
      where: { id: qrSession.id },
      data: { isUsed: true },
    });

    return {
      success: true,
      message: 'Registration completed successfully! You can now login.',
      data: {
        userId: mobileUser.id,
        username: mobileUser.username,
        email: mobileUser.email,
        name: mobileUser.name,
      },
    };
  }

  /**
   * Regular Login with username and password
   */
  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.prisma.mobileAppUser.findUnique({
      where: { 
        username: loginDto.username,
        isActive: true,
        isRegistered: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password with main ERP system
    const isValidPassword = await this.mainERPMiddleware.verifyUserPassword({
      userId: user.mainErpUserId,
      username: user.username,
      password: loginDto.password,
    });

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update user login time
    await this.prisma.mobileAppUser.update({
      where: { id: user.id },
      data: { 
        lastLoginAt: new Date(),
        lastPasswordCheck: new Date(),
      },
    });

    // Generate tokens and create session
    return this.generateTokensAndSession(user, loginDto.deviceInfo);
  }

  /**
   * Quick Login for returning users
   */
  async quickLogin(quickLoginDto: QuickLoginDto) {
    const user = await this.prisma.mobileAppUser.findUnique({
      where: { 
        id: quickLoginDto.userId,
        isActive: true,
        isRegistered: true,
      },
      include: {
        sessions: {
          where: {
            isActive: true,
            quickLoginEnabled: true,
            quickLoginExpiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user || user.sessions.length === 0) {
      throw new UnauthorizedException('Quick login not available');
    }

    // Check if re-authentication is required
    const lastLogin = user.lastLoginAt;
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    if (!lastLogin || lastLogin < threeDaysAgo) {
      // Mark user as requiring re-authentication
      await this.prisma.mobileAppUser.update({
        where: { id: user.id },
        data: { requiresReauth: true },
      });

      throw new UnauthorizedException('Re-authentication required - please login with password');
    }

    // Update last login
    await this.prisma.mobileAppUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate new tokens and session
    return this.generateTokensAndSession(user, quickLoginDto.deviceInfo);
  }

  /**
   * Get saved accounts for account selection screen
   */
  async getSavedAccounts(deviceId?: string) {
    const whereClause: any = {
      isActive: true,
      isRegistered: true,
    };

    // If deviceId provided, also check for recent sessions on this device
    if (deviceId) {
      whereClause.sessions = {
        some: {
          deviceId,
          isActive: true,
        },
      };
    }

    const users = await this.prisma.mobileAppUser.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        lastLoginAt: true,
        sessions: {
          where: {
            isActive: true,
            quickLoginEnabled: true,
            quickLoginExpiresAt: { gt: new Date() },
          },
          select: {
            quickLoginExpiresAt: true,
          },
          take: 1,
        },
      },
      orderBy: { lastLoginAt: 'desc' },
    });

    return users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      hasQuickAccess: user.sessions.length > 0,
      lastLoginAt: user.lastLoginAt,
    }));
  }

  /**
   * Refresh access token
   */
  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const refreshTokenRecord = await this.prisma.refreshToken.findUnique({
      where: { 
        token: refreshTokenDto.refreshToken,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!refreshTokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = await this.generateTokensAndSession(
      refreshTokenRecord.user,
      null,
      refreshTokenRecord.sessionId,
    );

    // Deactivate old refresh token
    await this.prisma.refreshToken.update({
      where: { id: refreshTokenRecord.id },
      data: { isActive: false },
    });

    return tokens;
  }

  /**
   * Logout user
   */
  async logout(userId: string, sessionId?: string) {
    const whereClause: any = { userId };
    if (sessionId) {
      whereClause.sessionId = sessionId;
    }

    // Deactivate sessions and refresh tokens
    await Promise.all([
      this.prisma.userSession.updateMany({
        where: whereClause,
        data: { isActive: false },
      }),
      this.prisma.refreshToken.updateMany({
        where: whereClause,
        data: { isActive: false },
      }),
    ]);

    return { success: true, message: 'Logged out successfully' };
  }

  /**
   * Generate JWT tokens and create user session
   */
  private async generateTokensAndSession(
    user: any,
    deviceInfo?: any,
    existingSessionId?: string,
  ) {
    const sessionId = existingSessionId || uuidv4();
    const now = new Date();
    const accessTokenExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    const refreshTokenExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const quickLoginExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // JWT payload
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      sessionId,
    };

    // Generate tokens
    const accessToken = this.jwtService.sign(payload, { expiresIn: '24h' });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, sessionId, type: 'refresh' },
      { expiresIn: '7d' },
    );

    // Create or update session
    const session = await this.prisma.userSession.upsert({
      where: { sessionId },
      update: {
        accessToken,
        lastActivityAt: now,
        expiresAt: accessTokenExpiry,
        quickLoginExpiresAt: quickLoginExpiry,
        deviceInfo: deviceInfo || undefined,
      },
      create: {
        userId: user.id,
        sessionId,
        accessToken,
        deviceId: deviceInfo?.deviceId,
        deviceInfo: deviceInfo || undefined,
        isActive: true,
        lastActivityAt: now,
        expiresAt: accessTokenExpiry,
        quickLoginEnabled: true,
        quickLoginExpiresAt: quickLoginExpiry,
      },
    });

    // Create refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        sessionId,
        expiresAt: refreshTokenExpiry,
      },
    });

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 24 * 60 * 60, // 24 hours in seconds
        },
        session: {
          sessionId: session.sessionId,
          expiresAt: session.expiresAt,
          quickLoginEnabled: session.quickLoginEnabled,
          quickLoginExpiresAt: session.quickLoginExpiresAt,
        },
      },
    };
  }

  /**
   * Generate 6-digit verification code
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}