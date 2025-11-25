/**
 * Session Management Utility
 * Handles session validation, expiry checks, and user messaging
 */

import { Alert } from 'react-native';
import LocalStorageService from '../services/LocalStorageService';

export class SessionManager {
  // Session expiry thresholds (in days)
  static EXPIRY_THRESHOLDS = {
    CRITICAL: 7,     // Force logout after 7 days
    WARNING: 3,      // Show warning after 3 days
    DAILY: 1,        // Require re-auth after 24 hours
  };

  /**
   * Validates if user session is still valid for dashboard access
   * @param {Object} user - Current user object
   * @returns {Promise<Object>} - Validation result with status and details
   */
  static async validateDashboardAccess(user) {
    try {
      if (!user || !user.id) {
        return {
          valid: false,
          type: 'NO_USER',
          message: 'No authenticated user found',
          action: 'login'
        };
      }

      const sessionData = await LocalStorageService.getItem(`@session_${user.id}`);
      
      if (!sessionData || !sessionData.loginTime) {
        return {
          valid: false,
          type: 'NO_SESSION',
          message: 'No login session found. Please log in to continue.',
          action: 'login'
        };
      }

      const sessionStatus = this.checkSessionExpiry(sessionData.loginTime);
      
      return {
        valid: sessionStatus.valid,
        type: sessionStatus.type,
        message: sessionStatus.message,
        action: sessionStatus.action,
        lastLogin: sessionData.loginTime,
        daysSince: sessionStatus.daysSince
      };

    } catch (error) {
      console.log('Session validation error:', error);
      return {
        valid: false,
        type: 'VALIDATION_ERROR',
        message: 'Unable to verify your session. Please log in again.',
        action: 'login'
      };
    }
  }

  /**
   * Checks session expiry based on last login time
   * @param {string} lastLoginTime - ISO string of last login
   * @returns {Object} - Session status with validation details
   */
  static checkSessionExpiry(lastLoginTime) {
    const lastLogin = new Date(lastLoginTime);
    const now = new Date();
    const daysSince = (now - lastLogin) / (1000 * 60 * 60 * 24);
    const hoursSince = (now - lastLogin) / (1000 * 60 * 60);

    // Critical expiry - force logout
    if (daysSince >= this.EXPIRY_THRESHOLDS.CRITICAL) {
      return {
        valid: false,
        type: 'CRITICAL_EXPIRY',
        message: `Your session expired ${Math.floor(daysSince)} days ago. Please log in again for security.`,
        action: 'force_login',
        daysSince: Math.floor(daysSince)
      };
    }

    // Warning expiry - require re-authentication
    if (daysSince >= this.EXPIRY_THRESHOLDS.WARNING) {
      return {
        valid: false,
        type: 'SESSION_EXPIRED',
        message: `Your last login was ${Math.floor(daysSince)} days ago. For security reasons, please enter your credentials to continue.`,
        action: 'reauth',
        daysSince: Math.floor(daysSince)
      };
    }

    // Daily timeout - quick re-auth
    if (hoursSince >= 24) {
      return {
        valid: false,
        type: 'DAILY_TIMEOUT',
        message: `Your session timed out (${Math.floor(hoursSince)} hours ago). Please verify your identity to continue.`,
        action: 'quick_reauth',
        daysSince: Math.floor(daysSince)
      };
    }

    // Valid session
    return {
      valid: true,
      type: 'VALID_SESSION',
      message: 'Session is valid',
      action: 'continue',
      daysSince: Math.floor(daysSince)
    };
  }

  /**
   * Shows appropriate session expiry dialog to user
   * @param {Object} sessionStatus - Result from validateDashboardAccess
   * @param {Object} navigation - Navigation object for routing
   * @param {Function} logoutCallback - Logout function from auth context
   */
  static showSessionExpiredDialog(sessionStatus, navigation, logoutCallback) {
    const { message, type, action } = sessionStatus;

    let title = 'Session Expired';
    let buttons = [];

    switch (type) {
      case 'CRITICAL_EXPIRY':
        title = 'Session Expired';
        buttons = [
          {
            text: 'Login Again',
            style: 'default',
            onPress: () => {
              logoutCallback();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }
          }
        ];
        break;

      case 'SESSION_EXPIRED':
        title = 'Security Check Required';
        buttons = [
          {
            text: 'Enter Credentials',
            style: 'default',
            onPress: () => {
              navigation.navigate('Login', { 
                sessionExpired: true,
                returnTo: 'Dashboard'
              });
            }
          }
        ];
        break;

      case 'DAILY_TIMEOUT':
        title = 'Session Timeout';
        buttons = [
          {
            text: 'Quick Login',
            style: 'default',
            onPress: () => {
              navigation.navigate('SavedAccounts', {
                sessionExpired: true,
                returnTo: 'Dashboard'
              });
            }
          },
          {
            text: 'Full Login',
            style: 'cancel',
            onPress: () => {
              navigation.navigate('Login', {
                sessionExpired: true,
                returnTo: 'Dashboard'
              });
            }
          }
        ];
        break;

      default:
        buttons = [
          {
            text: 'Login',
            onPress: () => {
              logoutCallback();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }
          }
        ];
    }

    Alert.alert(title, message, buttons, { cancelable: false });
  }

  /**
   * Updates session timestamp for active user
   * @param {Object} user - Current user object
   */
  static async updateSessionTimestamp(user) {
    try {
      if (!user || !user.id) return;

      const sessionData = await LocalStorageService.getItem(`@session_${user.id}`);
      if (sessionData) {
        sessionData.loginTime = new Date().toISOString();
        sessionData.lastActivity = new Date().toISOString();
        await LocalStorageService.setItem(`@session_${user.id}`, sessionData);
        console.log('Session timestamp updated for user:', user.id);
      }
    } catch (error) {
      console.log('Error updating session timestamp:', error);
    }
  }

  /**
   * Gets user-friendly time since last login
   * @param {string} lastLoginTime - ISO string of last login
   * @returns {string} - Human readable time difference
   */
  static getTimeSinceLogin(lastLoginTime) {
    const lastLogin = new Date(lastLoginTime);
    const now = new Date();
    const diffMs = now - lastLogin;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor(diffMs / (1000 * 60));

    if (days > 0) {
      return days === 1 ? '1 day ago' : `${days} days ago`;
    } else if (hours > 0) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (minutes > 0) {
      return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    } else {
      return 'Just now';
    }
  }
}

export default SessionManager;