import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';

export interface JwtPayload {
  sub: string; // user id
  username: string;
  email: string;
  sessionId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-here-change-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    // Verify that the session is still active
    const session = await this.prisma.userSession.findUnique({
      where: {
        sessionId: payload.sessionId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            isActive: true,
            isRegistered: true,
          },
        },
      },
    });

    if (!session || !session.user.isActive) {
      throw new UnauthorizedException('Session expired or user inactive');
    }

    // Update last activity
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() },
    });

    return {
      userId: session.user.id,
      username: session.user.username,
      email: session.user.email,
      name: session.user.name,
      sessionId: session.sessionId,
    };
  }
}