import { getBaseURL } from '../config/apiConfig.js';

/**
 * Device Information Helper
 */
class DeviceInfoHelper {
  static getDeviceId() {
    // Generate or retrieve a unique device ID
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  static getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // Detect device type
    let deviceType = 'Web';
    if (/Android/i.test(userAgent)) deviceType = 'Android';
    else if (/iPhone|iPad|iPod/i.test(userAgent)) deviceType = 'iOS';
    
    // Get basic device info
    const deviceInfo = {
      deviceId: this.getDeviceId(),
      deviceName: platform || 'Unknown Device',
      deviceType: deviceType,
      deviceOS: this.getOS(),
      appVersion: '1.0.0', // You can get this from package.json or config
      userAgent: userAgent,
    };

    return deviceInfo;
  }

  static getOS() {
    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
    
    if (macosPlatforms.indexOf(platform) !== -1) return 'Mac OS';
    if (iosPlatforms.indexOf(platform) !== -1) return 'iOS';
    if (windowsPlatforms.indexOf(platform) !== -1) return 'Windows';
    if (/Android/.test(userAgent)) return 'Android';
    if (/Linux/.test(platform)) return 'Linux';
    
    return 'Unknown';
  }
}

/**
 * Saved Accounts API Service
 */
class SavedAccountsApiService {
  constructor() {
    this.baseURL = getBaseURL();
  }

  /**
   * Get auth headers
   */
  getAuthHeaders(token = null) {
    const authToken = token || localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': authToken ? `Bearer ${authToken}` : '',
    };
  }

  /**
   * Save current account to database with device info
   */
  async saveAccountToDatabase(options = {}) {
    try {
      const deviceInfo = DeviceInfoHelper.getDeviceInfo();
      
      const response = await fetch(`${this.baseURL}/saved-accounts/save`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          deviceInfo: {
            ...deviceInfo,
            ipAddress: options.ipAddress,
            location: options.location,
          },
          settings: {
            biometricEnabled: options.biometricEnabled || false,
            quickLoginEnabled: options.quickLoginEnabled !== false, // Default true
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Account saved to database:', data.data);
        return { success: true, data: data.data };
      } else {
        console.warn('Failed to save account to database:', data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.warn('Error saving account to database:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all saved accounts for current device from database
   */
  async getDeviceAccountsFromDatabase() {
    try {
      const deviceId = DeviceInfoHelper.getDeviceId();
      
      const response = await fetch(`${this.baseURL}/saved-accounts/device/${deviceId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Device accounts from database:', data.data);
        return { success: true, accounts: data.data };
      } else {
        console.warn('Failed to get device accounts:', data.message);
        return { success: false, accounts: [] };
      }
    } catch (error) {
      console.warn('Error getting device accounts:', error);
      return { success: false, accounts: [] };
    }
  }

  /**
   * Get all devices for current user
   */
  async getUserDevices() {
    try {
      const response = await fetch(`${this.baseURL}/saved-accounts/my-devices`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('User devices:', data.data);
        return { success: true, devices: data.data };
      } else {
        console.warn('Failed to get user devices:', data.message);
        return { success: false, devices: [] };
      }
    } catch (error) {
      console.warn('Error getting user devices:', error);
      return { success: false, devices: [] };
    }
  }

  /**
   * Remove account from current device
   */
  async removeAccountFromDatabase() {
    try {
      const deviceId = DeviceInfoHelper.getDeviceId();
      
      const response = await fetch(`${this.baseURL}/saved-accounts/remove/${deviceId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Account removed from database');
        return { success: true };
      } else {
        console.warn('Failed to remove account from database:', data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.warn('Error removing account from database:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all accounts from current device
   */
  async clearDeviceAccounts() {
    try {
      const deviceId = DeviceInfoHelper.getDeviceId();
      
      const response = await fetch(`${this.baseURL}/saved-accounts/clear-device/${deviceId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('All accounts cleared from device:', data.data);
        return { success: true, cleared: data.data.cleared };
      } else {
        console.warn('Failed to clear device accounts:', data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.warn('Error clearing device accounts:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update account settings
   */
  async updateAccountSettings(settings) {
    try {
      const deviceId = DeviceInfoHelper.getDeviceId();
      
      const response = await fetch(`${this.baseURL}/saved-accounts/settings/${deviceId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Account settings updated:', data.data);
        return { success: true, data: data.data };
      } else {
        console.warn('Failed to update account settings:', data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.warn('Error updating account settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get device analytics
   */
  async getDeviceAnalytics() {
    try {
      const deviceId = DeviceInfoHelper.getDeviceId();
      
      const response = await fetch(`${this.baseURL}/saved-accounts/analytics/device/${deviceId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, analytics: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.warn('Error getting device analytics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics() {
    try {
      const response = await fetch(`${this.baseURL}/saved-accounts/analytics/user`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, analytics: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.warn('Error getting user analytics:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export both classes
export { DeviceInfoHelper, SavedAccountsApiService };
export default new SavedAccountsApiService();