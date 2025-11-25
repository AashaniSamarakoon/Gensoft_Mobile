import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SavedAccountService, DeviceInfo } from '../services/saved-account.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    username: string;
  };
}

@Controller('saved-accounts')
@UseGuards(JwtAuthGuard)
export class SavedAccountController {
  constructor(private readonly savedAccountService: SavedAccountService) {}

  /**
   * Save current account on device
   */
  @Post('save')
  async saveAccount(
    @Body() body: { 
      deviceInfo: DeviceInfo;
      settings?: {
        biometricEnabled?: boolean;
        quickLoginEnabled?: boolean;
      };
    },
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user.sub;
      
      const savedAccount = await this.savedAccountService.saveAccountOnDevice(
        userId,
        body.deviceInfo,
        body.settings,
      );

      return {
        success: true,
        message: 'Account saved successfully',
        data: savedAccount,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save account',
        error: error.message,
      };
    }
  }

  /**
   * Get all saved accounts for current device
   */
  @Get('device/:deviceId')
  async getDeviceAccounts(@Param('deviceId') deviceId: string) {
    try {
      const accounts = await this.savedAccountService.getSavedAccountsForDevice(deviceId);

      return {
        success: true,
        message: 'Device accounts retrieved successfully',
        data: accounts,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve device accounts',
        error: error.message,
      };
    }
  }

  /**
   * Get all devices for current user
   */
  @Get('my-devices')
  async getMyDevices(@Req() req: AuthenticatedRequest) {
    try {
      const userId = req.user.sub;
      const devices = await this.savedAccountService.getDevicesForUser(userId);

      return {
        success: true,
        message: 'User devices retrieved successfully',
        data: devices,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve user devices',
        error: error.message,
      };
    }
  }

  /**
   * Remove account from specific device
   */
  @Delete('remove/:deviceId')
  async removeFromDevice(
    @Param('deviceId') deviceId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user.sub;
      const success = await this.savedAccountService.removeAccountFromDevice(userId, deviceId);

      return {
        success,
        message: success ? 'Account removed from device successfully' : 'Failed to remove account',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to remove account from device',
        error: error.message,
      };
    }
  }

  /**
   * Clear all accounts from device
   */
  @Delete('clear-device/:deviceId')
  async clearDevice(@Param('deviceId') deviceId: string) {
    try {
      const count = await this.savedAccountService.clearDeviceSavedAccounts(deviceId);

      return {
        success: true,
        message: `Cleared ${count} accounts from device`,
        data: { cleared: count },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to clear device accounts',
        error: error.message,
      };
    }
  }

  /**
   * Update account settings on device
   */
  @Post('settings/:deviceId')
  async updateSettings(
    @Param('deviceId') deviceId: string,
    @Body() settings: {
      biometricEnabled?: boolean;
      quickLoginEnabled?: boolean;
    },
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user.sub;
      const updatedAccount = await this.savedAccountService.updateAccountSettings(
        userId,
        deviceId,
        settings,
      );

      return {
        success: !!updatedAccount,
        message: updatedAccount ? 'Settings updated successfully' : 'Failed to update settings',
        data: updatedAccount,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update account settings',
        error: error.message,
      };
    }
  }

  /**
   * Get device analytics
   */
  @Get('analytics/device/:deviceId')
  async getDeviceAnalytics(@Param('deviceId') deviceId: string) {
    try {
      const analytics = await this.savedAccountService.getDeviceAnalytics(deviceId);

      return {
        success: true,
        message: 'Device analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve device analytics',
        error: error.message,
      };
    }
  }

  /**
   * Get user analytics across all devices
   */
  @Get('analytics/user')
  async getUserAnalytics(@Req() req: AuthenticatedRequest) {
    try {
      const userId = req.user.sub;
      const analytics = await this.savedAccountService.getUserAnalytics(userId);

      return {
        success: true,
        message: 'User analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve user analytics',
        error: error.message,
      };
    }
  }

  /**
   * Admin: Cleanup old accounts
   */
  @Delete('cleanup')
  async cleanupOldAccounts(@Query('days') days?: string) {
    try {
      const daysOld = days ? parseInt(days, 10) : 90;
      const cleaned = await this.savedAccountService.cleanupOldAccounts(daysOld);

      return {
        success: true,
        message: `Cleaned up ${cleaned} old accounts`,
        data: { cleaned },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to cleanup old accounts',
        error: error.message,
      };
    }
  }
}