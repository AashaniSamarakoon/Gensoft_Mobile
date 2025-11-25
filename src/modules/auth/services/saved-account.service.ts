import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { SavedAccount } from '@prisma/client';

export interface DeviceInfo {
  deviceId: string;
  deviceName?: string;
  deviceType?: string; // iOS/Android/Web
  deviceOS?: string;
  appVersion?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
}

export interface SavedAccountResponse extends SavedAccount {
  user?: {
    id: string;
    username: string;
    email: string;
    name: string;
  };
}

@Injectable()
export class SavedAccountService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Save or update account on device
   */
  async saveAccountOnDevice(
    userId: string,
    deviceInfo: DeviceInfo,
    options?: {
      biometricEnabled?: boolean;
      quickLoginEnabled?: boolean;
    }
  ): Promise<SavedAccount> {
    const existingAccount = await this.prisma.savedAccount.findUnique({
      where: {
        userId_deviceId: {
          userId,
          deviceId: deviceInfo.deviceId,
        },
      },
    });

    if (existingAccount) {
      // Update existing account
      return this.prisma.savedAccount.update({
        where: { id: existingAccount.id },
        data: {
          lastAccessedAt: new Date(),
          accessCount: { increment: 1 },
          deviceName: deviceInfo.deviceName || existingAccount.deviceName,
          deviceType: deviceInfo.deviceType || existingAccount.deviceType,
          deviceOS: deviceInfo.deviceOS || existingAccount.deviceOS,
          appVersion: deviceInfo.appVersion || existingAccount.appVersion,
          userAgent: deviceInfo.userAgent || existingAccount.userAgent,
          ipAddress: deviceInfo.ipAddress,
          location: deviceInfo.location,
          biometricEnabled: options?.biometricEnabled ?? existingAccount.biometricEnabled,
          quickLoginEnabled: options?.quickLoginEnabled ?? existingAccount.quickLoginEnabled,
        },
      });
    } else {
      // Create new saved account
      return this.prisma.savedAccount.create({
        data: {
          userId,
          deviceId: deviceInfo.deviceId,
          deviceName: deviceInfo.deviceName,
          deviceType: deviceInfo.deviceType,
          deviceOS: deviceInfo.deviceOS,
          appVersion: deviceInfo.appVersion,
          userAgent: deviceInfo.userAgent,
          ipAddress: deviceInfo.ipAddress,
          location: deviceInfo.location,
          biometricEnabled: options?.biometricEnabled ?? false,
          quickLoginEnabled: options?.quickLoginEnabled ?? true,
        },
      });
    }
  }

  /**
   * Get all saved accounts for a device
   */
  async getSavedAccountsForDevice(deviceId: string): Promise<SavedAccountResponse[]> {
    return this.prisma.savedAccount.findMany({
      where: {
        deviceId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    });
  }

  /**
   * Get all devices for a user
   */
  async getDevicesForUser(userId: string): Promise<SavedAccount[]> {
    return this.prisma.savedAccount.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    });
  }

  /**
   * Remove account from device
   */
  async removeAccountFromDevice(userId: string, deviceId: string): Promise<boolean> {
    try {
      await this.prisma.savedAccount.delete({
        where: {
          userId_deviceId: {
            userId,
            deviceId,
          },
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove all saved accounts for a device (device reset/logout all)
   */
  async clearDeviceSavedAccounts(deviceId: string): Promise<number> {
    const result = await this.prisma.savedAccount.updateMany({
      where: { deviceId },
      data: { isActive: false },
    });
    return result.count;
  }

  /**
   * Remove user from all devices (user account deletion)
   */
  async removeUserFromAllDevices(userId: string): Promise<number> {
    const result = await this.prisma.savedAccount.updateMany({
      where: { userId },
      data: { isActive: false },
    });
    return result.count;
  }

  /**
   * Update device settings for saved account
   */
  async updateAccountSettings(
    userId: string,
    deviceId: string,
    settings: {
      biometricEnabled?: boolean;
      quickLoginEnabled?: boolean;
    }
  ): Promise<SavedAccount | null> {
    try {
      return await this.prisma.savedAccount.update({
        where: {
          userId_deviceId: {
            userId,
            deviceId,
          },
        },
        data: {
          ...settings,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Get device analytics
   */
  async getDeviceAnalytics(deviceId: string) {
    const accounts = await this.prisma.savedAccount.findMany({
      where: { deviceId, isActive: true },
      include: { user: true },
    });

    return {
      totalAccounts: accounts.length,
      totalAccess: accounts.reduce((sum, acc) => sum + acc.accessCount, 0),
      mostRecentAccess: accounts[0]?.lastAccessedAt || null,
      oldestAccount: accounts[accounts.length - 1]?.firstSavedAt || null,
      deviceInfo: accounts[0] ? {
        deviceName: accounts[0].deviceName,
        deviceType: accounts[0].deviceType,
        deviceOS: accounts[0].deviceOS,
        appVersion: accounts[0].appVersion,
      } : null,
    };
  }

  /**
   * Get user analytics across all devices
   */
  async getUserAnalytics(userId: string) {
    const savedAccounts = await this.prisma.savedAccount.findMany({
      where: { userId, isActive: true },
    });

    return {
      totalDevices: savedAccounts.length,
      totalAccess: savedAccounts.reduce((sum, acc) => sum + acc.accessCount, 0),
      mostActiveDevice: savedAccounts.sort((a, b) => b.accessCount - a.accessCount)[0] || null,
      recentDevices: savedAccounts
        .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
        .slice(0, 5),
    };
  }

  /**
   * Clean up old inactive accounts (maintenance)
   */
  async cleanupOldAccounts(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.savedAccount.deleteMany({
      where: {
        lastAccessedAt: {
          lt: cutoffDate,
        },
        isActive: false,
      },
    });

    return result.count;
  }
}