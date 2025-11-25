// Storage Recovery Utility for Mobile ERP App
// This utility helps recover from AsyncStorage corruption issues

import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalStorageService from '../services/LocalStorageService';

class StorageRecoveryUtil {
  
  static async performEmergencyCleanup() {
    console.log('🚨 Performing emergency AsyncStorage cleanup...');
    
    try {
      // Step 1: Test basic storage functionality
      const canWrite = await this.testStorageWrite();
      if (!canWrite) {
        console.error('❌ Cannot write to AsyncStorage - device storage issue');
        return { success: false, reason: 'storage_unavailable' };
      }

      // Step 2: Clear all potentially corrupted app data
      const appKeys = [
        '@auth_token',
        '@user_data', 
        '@login_session',
        '@current_user',
        '@users_table',
        '@saved_accounts'
      ];

      let clearedCount = 0;
      for (const key of appKeys) {
        try {
          await AsyncStorage.removeItem(key);
          clearedCount++;
        } catch (error) {
          console.warn(`Failed to clear ${key}:`, error);
        }
      }

      // Step 3: Test storage again
      const isFixed = await LocalStorageService.validateStorageIntegrity();
      
      console.log(`🧹 Emergency cleanup complete. Cleared ${clearedCount} items.`);
      console.log(`✅ Storage working: ${isFixed}`);

      return { 
        success: true, 
        clearedCount,
        storageWorking: isFixed 
      };

    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async testStorageWrite() {
    try {
      const testKey = '@recovery_test';
      const testValue = { test: true, timestamp: Date.now() };
      
      await AsyncStorage.setItem(testKey, JSON.stringify(testValue));
      const retrieved = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      
      const parsed = JSON.parse(retrieved);
      return parsed.test === true;
    } catch (error) {
      console.error('Storage write test failed:', error);
      return false;
    }
  }

  static async diagnoseStorageIssues() {
    console.log('🔍 Diagnosing AsyncStorage issues...');
    
    const diagnosis = {
      canWrite: false,
      canRead: false,
      corruptedKeys: [],
      totalKeys: 0,
      recommendations: []
    };

    try {
      // Test basic read/write
      diagnosis.canWrite = await this.testStorageWrite();
      diagnosis.canRead = diagnosis.canWrite; // If we can write and retrieve, we can read

      // Check all app keys for corruption
      const appKeys = [
        '@auth_token',
        '@user_data', 
        '@login_session',
        '@current_user',
        '@users_table',
        '@saved_accounts'
      ];

      for (const key of appKeys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            diagnosis.totalKeys++;
            try {
              JSON.parse(value);
            } catch (parseError) {
              diagnosis.corruptedKeys.push(key);
            }
          }
        } catch (error) {
          diagnosis.corruptedKeys.push(key);
        }
      }

      // Generate recommendations
      if (!diagnosis.canWrite) {
        diagnosis.recommendations.push('Device storage unavailable - restart app or device');
      }
      
      if (diagnosis.corruptedKeys.length > 0) {
        diagnosis.recommendations.push(`${diagnosis.corruptedKeys.length} corrupted entries found - clear app data`);
      }

      if (diagnosis.corruptedKeys.length === 0 && diagnosis.canWrite) {
        diagnosis.recommendations.push('Storage appears healthy');
      }

      console.log('📊 Diagnosis complete:', diagnosis);
      return diagnosis;

    } catch (error) {
      console.error('❌ Diagnosis failed:', error);
      diagnosis.recommendations.push('Critical storage error - reinstall app may be required');
      return diagnosis;
    }
  }

  static async recoverUserData() {
    console.log('🔧 Attempting to recover user data...');
    
    try {
      // Try to salvage any valid user data
      const recoveredData = {};
      
      const dataKeys = ['@user_data', '@current_user', '@login_session'];
      
      for (const key of dataKeys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            const parsed = JSON.parse(value);
            recoveredData[key] = parsed;
            console.log(`✅ Recovered data from ${key}`);
          }
        } catch (error) {
          console.log(`❌ Could not recover ${key}:`, error.message);
        }
      }

      return { success: true, recoveredData };

    } catch (error) {
      console.error('❌ Data recovery failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default StorageRecoveryUtil;