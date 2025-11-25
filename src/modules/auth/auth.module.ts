import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { DatabaseModule } from '../../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { QuickLoginGuard } from './guards/quick-login.guard';
import { SavedAccountController } from './controllers/saved-account.controller';
import { SavedAccountService } from './services/saved-account.service';

import { MainERPMiddlewareService } from '../../services/main-erp-middleware.service';
import { EmailService } from '../../services/email.service';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-here-change-in-production',
        signOptions: {
          expiresIn: '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, SavedAccountController],
  providers: [
    AuthService,
    SavedAccountService,
    JwtStrategy,
    JwtAuthGuard,
    QuickLoginGuard,
    MainERPMiddlewareService,
    EmailService,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    QuickLoginGuard,
    JwtStrategy,
  ],
})
export class AuthModule {}