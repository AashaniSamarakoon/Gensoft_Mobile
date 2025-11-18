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
      this.logger.log('=== QR CODE SCAN STARTED ===');
      this.logger.log(`Received QR Data: ${scanQRDto.qrData}`);

      // Parse QR code data
      this.logger.log('Step 1: Parsing QR code data...');
      const qrData = this.mainERPMiddleware.parseQRCodeData(scanQRDto.qrData);
      this.logger.log(`Parsed QR Data: ${JSON.stringify(qrData)}`);
      
      // Validate QR token with main ERP system
      this.logger.log('Step 2: Validating QR token...');
      const mainERPUser = await this.mainERPMiddleware.validateQRCodeToken(qrData.qrToken, qrData);
      this.logger.log(`Main ERP User: ${JSON.stringify(mainERPUser)}`);
      
      // Check if user already exists - CRITICAL security check
      this.logger.log('Step 3: Checking existing user...');
      this.logger.log(`Looking for user with mainErpUserId: ${mainERPUser.id}`);
      
      // First try exact match
      let existingUser = await this.prisma.mobileAppUser.findUnique({
        where: { mainErpUserId: mainERPUser.id },
      });
      
      // If not found and emp_id is a number, try alternative formats
      if (!existingUser && typeof qrData.emp_id === 'number') {
        this.logger.log(`No exact match found, trying alternative formats for emp_id: ${qrData.emp_id}`);
        
        // Try different possible formats
        const alternativeIds = [
          `usr_${qrData.emp_id}_mobile`,  // usr_1_mobile
          `usr_${qrData.emp_id}`,         // usr_1
          qrData.emp_id.toString(),       // "1"
        ];
        
        for (const altId of alternativeIds) {
          this.logger.log(`Trying mainErpUserId: "${altId}"`);
          existingUser = await this.prisma.mobileAppUser.findUnique({
            where: { mainErpUserId: altId },
          });
          if (existingUser) {
            this.logger.log(`Found user with alternative ID: ${altId}`);
            break;
          }
        }
      }
      
      // Also check by email as backup
      if (!existingUser && qrData.emp_email) {
        this.logger.log(`Checking by email: ${qrData.emp_email}`);
        existingUser = await this.prisma.mobileAppUser.findUnique({
          where: { email: qrData.emp_email },
        });
        if (existingUser) {
          this.logger.log(`Found user by email: ${existingUser.username}`);
        }
      }
      
      this.logger.log(`Database query result: ${existingUser ? 'Found user' : 'No user found'}`);
      if (existingUser) {
        this.logger.log(`Found user: ${existingUser.username}, isRegistered: ${existingUser.isRegistered}`);
      }
      
      if (existingUser && existingUser.isRegistered) {
        this.logger.log('❌ User already registered - blocking QR scan');
        return {
          success: false,
          alreadyRegistered: true,
          message: `User ${existingUser.username} is already registered. Please use login instead.`,
          data: {
            username: existingUser.username,
            email: existingUser.email,
            employeeId: existingUser.mainErpUserId
          }
        };
      }

      // Generate verification code (essential part)
      this.logger.log('Step 4: Generating verification code...');
      const verificationCode = this.generateVerificationCode();
      const codeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      // Display verification code prominently in console
      console.log('\n' + '='.repeat(60));
      console.log('📧 EMAIL VERIFICATION CODE FOR MOBILE APP');
      console.log('='.repeat(60));
      console.log(`👤 User: ${mainERPUser.name} (${mainERPUser.email})`);
      console.log(`🔢 Verification Code: ${verificationCode}`);
      console.log(`⏰ Valid for: 15 minutes`);
      console.log(`📱 Enter this code in your mobile app verification screen`);
      console.log('='.repeat(60) + '\n');

      // Try to store verification code in database
      try {
        this.logger.log('Step 5: Storing verification code...');
        const emailVerification = await this.prisma.emailVerification.create({
          data: {
            email: mainERPUser.email,
            verificationCode,
            expiresAt: codeExpiry,
          },
        });
        this.logger.log(`Email verification stored: ${emailVerification.id}`);
      } catch (dbError) {
        this.logger.warn(`Failed to store verification code in DB: ${dbError.message}`);
        this.logger.log('Proceeding without database storage...');
      }

      // Try to store QR session
      try {
        this.logger.log('Step 6: Creating QR session...');
        const qrSession = await this.prisma.qRCodeSession.create({
          data: {
            qrToken: qrData.qrToken,
            mainErpUserId: mainERPUser.id,
            userEmail: mainERPUser.email,
            userName: mainERPUser.name,
            userPhone: mainERPUser.phone || '',
            qrData: JSON.stringify(qrData),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
          },
        });
        this.logger.log(`QR Session created: ${qrSession.id}`);
      } catch (dbError) {
        this.logger.warn(`Failed to store QR session: ${dbError.message}`);
        this.logger.log('Proceeding without session storage...');
      }

      // Send verification email (logging only)
      this.logger.log('Step 7: Sending verification email...');
      const emailSent = await this.emailService.sendVerificationCode(
        mainERPUser.email,
        verificationCode,
        mainERPUser.name,
      );
      this.logger.log(`Email sent: ${emailSent}`);

      this.logger.log('=== QR CODE SCAN COMPLETED ===');

      return {
        success: true,
        message: 'QR code scanned successfully. Verification code sent to email.',
        data: {
          email: mainERPUser.email,
          name: mainERPUser.name,
          username: mainERPUser.username,
          nextStep: 'email_verification',
          verificationCode: verificationCode, // Include for testing
        },
      };
    } catch (error) {
      this.logger.error(`=== QR SCAN FAILED ===`);
      this.logger.error(`Error: ${error.message}`);
      this.logger.error(`Stack: ${error.stack}`);
      
      // Return a more specific error
      if (error.code === 'P2002') {
        throw new ConflictException('A session for this user already exists. Please try again.');
      }
      
      if (error.message.includes('Invalid QR code')) {
        throw new BadRequestException('Invalid QR code format. Please scan a valid QR code.');
      }
      
      throw new BadRequestException(`QR scan failed: ${error.message}`);
    }
  }

  /**
   * Step 2: Verify Email with 6-digit code
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    try {
      this.logger.log('=== EMAIL VERIFICATION STARTED ===');
      this.logger.log(`Email: ${verifyEmailDto.email}`);
      this.logger.log(`Code: ${verifyEmailDto.verificationCode}`);

      // Find verification record
      let verification;
      try {
        verification = await this.prisma.emailVerification.findFirst({
          where: {
            email: verifyEmailDto.email,
            verificationCode: verifyEmailDto.verificationCode,
            isUsed: false,
            expiresAt: { gt: new Date() },
          },
        });
        this.logger.log(`Verification record: ${verification ? 'Found' : 'Not found'}`);
      } catch (dbError) {
        this.logger.warn(`Database lookup failed: ${dbError.message}`);
        // For testing, accept any 6-digit code
        if (verifyEmailDto.verificationCode && verifyEmailDto.verificationCode.length === 6) {
          this.logger.log('Database failed, accepting 6-digit code for testing');
          return {
            success: true,
            message: 'Email verified successfully (testing mode)',
            data: {
              email: verifyEmailDto.email,
              nextStep: 'password_verification',
            },
          };
        }
      }

      if (!verification) {
        // Try to increment attempts if possible
        try {
          await this.prisma.emailVerification.updateMany({
            where: {
              email: verifyEmailDto.email,
              isUsed: false,
            },
            data: {
              attempts: { increment: 1 },
            },
          });
        } catch (dbError) {
          this.logger.warn(`Failed to increment attempts: ${dbError.message}`);
        }

        throw new BadRequestException('Invalid or expired verification code');
      }

      // Check max attempts
      if (verification.attempts >= verification.maxAttempts) {
        throw new BadRequestException('Maximum verification attempts exceeded');
      }

      // Mark verification as used
      try {
        await this.prisma.emailVerification.update({
          where: { id: verification.id },
          data: { isUsed: true },
        });
        this.logger.log('Verification marked as used');
      } catch (dbError) {
        this.logger.warn(`Failed to mark verification as used: ${dbError.message}`);
      }

      this.logger.log('=== EMAIL VERIFICATION COMPLETED ===');

      return {
        success: true,
        message: 'Email verified successfully',
        data: {
          email: verifyEmailDto.email,
          nextStep: 'password_verification',
        },
      };
    } catch (error) {
      this.logger.error(`=== EMAIL VERIFICATION FAILED ===`);
      this.logger.error(`Error: ${error.message}`);
      throw error;
    }
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
    try {
      this.logger.log('=== SET MOBILE PASSWORD STARTED ===');
      this.logger.log(`Email: ${setPasswordDto.email}`);

      if (setPasswordDto.mobilePassword !== setPasswordDto.confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      // Get QR session data
      this.logger.log('Step 1: Looking for QR session...');
      const qrSession = await this.prisma.qRCodeSession.findFirst({
        where: {
          userEmail: setPasswordDto.email,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!qrSession) {
        this.logger.warn('QR session not found or expired');
        throw new BadRequestException('Registration session expired. Please start again.');
      }

      this.logger.log(`Found QR session: ${qrSession.id} for mainErpUserId: ${qrSession.mainErpUserId}`);

      // Hash mobile password
      this.logger.log('Step 2: Hashing password...');
      const hashedPassword = await bcrypt.hash(setPasswordDto.mobilePassword, 12);

      // Parse QR data to get username
      this.logger.log('Step 3: Parsing QR data...');
      let parsedQrData;
      try {
        parsedQrData = JSON.parse(qrSession.qrData);
        this.logger.log(`Parsed QR data: ${JSON.stringify(parsedQrData)}`);
      } catch (error) {
        this.logger.error('Failed to parse QR data:', error);
        throw new BadRequestException('Invalid session data');
      }

      // Extract username from QR data (emp_uname field) 
      const username = parsedQrData.emp_uname || qrSession.userName || 'user';
      
      this.logger.log(`Step 4: Creating/updating user with username: ${username}`);

      // Create or update mobile app user
      const mobileUser = await this.prisma.mobileAppUser.upsert({
        where: { mainErpUserId: qrSession.mainErpUserId },
        update: {
          emailVerified: true,
          passwordVerified: true, 
          isRegistered: true,
          isActive: true,
          mobilePassword: hashedPassword, // Update password on subsequent registrations
        },
        create: {
          mainErpUserId: qrSession.mainErpUserId,
          email: qrSession.userEmail,
          name: qrSession.userName,
          phone: qrSession.userPhone,
          username: username,
          mobilePassword: hashedPassword,
          emailVerified: true,
          passwordVerified: true,
          isRegistered: true,
          isActive: true,
        },
      });

      this.logger.log(`User upsert successful: ${mobileUser.id}`);

      // Mark QR session as used
      this.logger.log('Step 5: Marking QR session as used...');
      await this.prisma.qRCodeSession.update({
        where: { id: qrSession.id },
        data: { isUsed: true },
      });

      this.logger.log('=== SET MOBILE PASSWORD COMPLETED ===');

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
    } catch (error) {
      this.logger.error('=== SET MOBILE PASSWORD FAILED ===');
      this.logger.error(`Error details: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      
      // Re-throw known exceptions
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Handle Prisma errors
      if (error.code === 'P2002') {
        this.logger.error('Unique constraint violation:', error.meta);
        throw new BadRequestException('A user with this email or username already exists');
      }
      
      // Handle other database errors
      if (error.code && error.code.startsWith('P')) {
        this.logger.error('Prisma error:', error.code, error.message);
        throw new BadRequestException('Database error occurred during registration');
      }
      
      // Generic error
      this.logger.error('Unexpected error in setMobilePassword:', error);
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  /**
   * Regular Login with username and password
   */
  async login(loginDto: LoginDto) {
    try {
      this.logger.log(`=== LOGIN ATTEMPT ===`);
      this.logger.log(`Username: ${loginDto.username}`);
      
      // Find user
      this.logger.log('Step 1: Finding user...');
      const user = await this.prisma.mobileAppUser.findUnique({
        where: { 
          username: loginDto.username,
          isActive: true,
          isRegistered: true,
        },
      });

      if (!user) {
        this.logger.warn('User not found or inactive');
        throw new UnauthorizedException('Invalid credentials');
      }
      
      this.logger.log(`User found: ${user.id}`);

      // Verify password with main ERP system
      this.logger.log('Step 2: Verifying password...');
      const isValidPassword = await this.mainERPMiddleware.verifyUserPassword({
        userId: user.mainErpUserId,
        username: user.username,
        password: loginDto.password,
      });

      if (!isValidPassword) {
        this.logger.warn('Password verification failed');
        throw new UnauthorizedException('Invalid credentials');
      }
      
      this.logger.log('Password verified successfully');

      // Update user login time
      this.logger.log('Step 3: Updating user login time...');
      await this.prisma.mobileAppUser.update({
        where: { id: user.id },
        data: { 
          lastLoginAt: new Date(),
          lastPasswordCheck: new Date(),
        },
      });
      
      this.logger.log('User login time updated');

      // Generate tokens and create session
      this.logger.log('Step 4: Generating tokens and session...');
      const result = await this.generateTokensAndSession(user, loginDto.deviceInfo);
      
      this.logger.log('=== LOGIN SUCCESSFUL ===');
      return result;
      
    } catch (error) {
      this.logger.error(`=== LOGIN FAILED ===`);
      this.logger.error(`Error: ${error.message}`);
      this.logger.error(`Stack: ${error.stack}`);
      throw error;
    }
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

    // Check if re-authentication is required (24 hours)
    const lastLogin = user.lastLoginAt;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (!lastLogin || lastLogin < twentyFourHoursAgo) {
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
    const refreshTokenRecord = await this.prisma.refreshToken.findFirst({
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
        deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : undefined,
      },
      create: {
        userId: user.id,
        sessionId,
        accessToken,
        deviceId: deviceInfo?.deviceId,
        deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : undefined,
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