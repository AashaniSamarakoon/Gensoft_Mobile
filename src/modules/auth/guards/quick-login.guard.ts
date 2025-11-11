import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class QuickLoginGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { userId } = request.body;

    if (!userId) {
      throw new UnauthorizedException('User ID is required for quick login');
    }

    // Check if user has valid quick login session
    const user = await this.prisma.mobileAppUser.findUnique({
      where: { id: userId, isActive: true, isRegistered: true },
      include: {
        sessions: {
          where: {
            isActive: true,
            quickLoginEnabled: true,
            quickLoginExpiresAt: {
              gt: new Date(),
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user || user.sessions.length === 0) {
      throw new UnauthorizedException('Quick login not available');
    }

    // Check if user needs re-authentication (e.g., haven't logged in for 3+ days)
    const lastLogin = user.lastLoginAt;
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    if (!lastLogin || lastLogin < threeDaysAgo) {
      throw new UnauthorizedException('Re-authentication required - login expired');
    }

    request.user = user;
    return true;
  }
}