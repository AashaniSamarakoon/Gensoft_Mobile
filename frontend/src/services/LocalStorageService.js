import AsyncStorageWrapper from '../utils/AsyncStorageWrapper';

class LocalStorageService {
  // Helper methods for React Native AsyncStorage using enhanced wrapper
  static async setItem(key, value) {
    try {
      await AsyncStorageWrapper.setItem(key, value);
    } catch (error) {
      console.error('LocalStorageService setItem error:', error);
    }
  }

  static async getItem(key, defaultValue = null) {
    try {
      return await AsyncStorageWrapper.getItem(key, defaultValue);
    } catch (error) {
      console.error('LocalStorageService getItem error:', error);
      return defaultValue;
    }
  }

  static async removeItem(key) {
    try {
      await AsyncStorageWrapper.removeItem(key);
    } catch (error) {
      console.error('LocalStorageService removeItem error:', error);
    }
  }

  // Data recovery and cleanup methods
  static async cleanupCorruptedData() {
    try {
      console.log('🧹 Starting AsyncStorage cleanup...');
      
      const criticalKeys = [
        '@auth_token',
        '@user_data', 
        '@login_session',
        '@current_user',
        '@users_table',
        '@saved_accounts'
      ];
      
      let cleanedCount = 0;
      
      for (const key of criticalKeys) {
        try {
          const rawValue = await AsyncStorage.getItem(key);
          if (rawValue) {
            // Test if it's valid JSON
            JSON.parse(rawValue);
            console.log(`✅ ${key}: Valid`);
          }
        } catch (error) {
          console.warn(`🗑️ Removing corrupted data for ${key}:`, error.message);
          await AsyncStorage.removeItem(key);
          cleanedCount++;
        }
      }
      
      console.log(`🧹 Cleanup complete. Removed ${cleanedCount} corrupted entries.`);
      return { success: true, cleanedCount };
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async validateStorageIntegrity() {
    try {
      console.log('🔍 Validating AsyncStorage integrity...');
      
      // Check if we can read/write test data
      const testKey = '@integrity_test';
      const testData = { timestamp: Date.now(), test: true };
      
      await this.setItem(testKey, testData);
      const retrieved = await this.getItem(testKey);
      await this.removeItem(testKey);
      
      if (retrieved && retrieved.test === true) {
        console.log('✅ AsyncStorage integrity check passed');
        return true;
      } else {
        console.error('❌ AsyncStorage integrity check failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Storage integrity validation failed:', error);
      return false;
    }
  }

  // User table operations
  static async saveUser(userData) {
    try {
      console.log('💾 Saving user data to local storage...');
      
      // Get existing users array or create new one
      const existingUsers = await this.getAllUsers() || [];
      
      // Check if user already exists (by emp_id or emp_uname)
      const existingUserIndex = existingUsers.findIndex(
        user => user.emp_id === userData.emp_id || user.emp_uname === userData.emp_uname
      );
      
      // Add timestamp and login info
      const userToSave = {
        ...userData,
        lastLogin: new Date().toISOString(),
        loginCount: existingUserIndex >= 0 ? (existingUsers[existingUserIndex].loginCount || 0) + 1 : 1,
        createdAt: existingUserIndex >= 0 ? existingUsers[existingUserIndex].createdAt : new Date().toISOString()
      };
      
      if (existingUserIndex >= 0) {
        // Update existing user
        existingUsers[existingUserIndex] = userToSave;
        console.log('📝 Updated existing user:', userData.emp_uname);
      } else {
        // Add new user
        existingUsers.push(userToSave);
        console.log('➕ Added new user:', userData.emp_uname);
      }
      
      // Save updated users array
      await this.setItem('@users_table', existingUsers);
      
      // Also save as current user
      await this.setItem('@current_user', userToSave);
      
      console.log('✅ User data saved successfully');
      return { success: true, user: userToSave };
      
    } catch (error) {
      console.error('❌ Error saving user data:', error);
      return { success: false, error: error.message };
    }
  }

  static async getAllUsers() {
    try {
      const usersData = await this.getItem('@users_table');
      return usersData || [];
    } catch (error) {
      console.error('❌ Error getting users:', error);
      return [];
    }
  }

  static async getCurrentUser() {
    try {
      const userData = await this.getItem('@current_user');
      return userData || null;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }  static async getUserById(empId) {
    try {
      const users = await this.getAllUsers();
      return users.find(user => user.emp_id === empId) || null;
    } catch (error) {
      console.error('❌ Error getting user by ID:', error);
      return null;
    }
  }
  
  static async getUserByUsername(username) {
    try {
      const users = await this.getAllUsers();
      return users.find(user => user.emp_uname === username) || null;
    } catch (error) {
      console.error('❌ Error getting user by username:', error);
      return null;
    }
  }
  
  static async deleteUser(empId) {
    try {
      const users = await this.getAllUsers();
      const updatedUsers = users.filter(user => user.emp_id !== empId);
      await this.setItem('@users_table', updatedUsers);
      console.log('🗑️ User deleted:', empId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      return { success: false, error: error.message };
    }
  }
  
  // QR Code processing
  static decodeQRData(qrData) {
    try {
      // Try to decode base64 QR data
      let decodedData;
      
      try {
        // First try direct JSON parse (if QR contains plain JSON)
        decodedData = JSON.parse(qrData);
      } catch {
        try {
          // Try base64 decode then JSON parse
          const base64Decoded = atob(qrData);
          decodedData = JSON.parse(base64Decoded);
        } catch {
          throw new Error('Invalid QR code format');
        }
      }
      
      // Validate required fields
      if (!decodedData.emp_id || !decodedData.emp_uname) {
        throw new Error('QR code missing required employee information');
      }
      
      console.log('✅ QR data decoded successfully:', decodedData.emp_uname);
      return { success: true, data: decodedData };
      
    } catch (error) {
      console.error('❌ QR decode error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Session management
  static async saveLoginSession(userData) {
    try {
      const session = {
        user: userData,
        loginTime: new Date().toISOString(),
        isActive: true
      };
      
      await this.setItem('@login_session', session);
      console.log('💾 Login session saved');
      return { success: true };
    } catch (error) {
      console.error('❌ Error saving session:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async getLoginSession() {
    try {
      const sessionData = await this.getItem('@login_session');
      return sessionData || null;
    } catch (error) {
      console.error('❌ Error getting session:', error);
      return null;
    }
  }
  
  static async clearLoginSession() {
    try {
      await this.removeItem('@login_session');
      console.log('🗑️ Login session cleared');
    } catch (error) {
      console.error('❌ Error clearing session:', error);
    }
  }
  
  // Company information (derived from user data)
  static generateCompanyInfo(userData) {
    // Generate company name based on user domain or default
    let companyName = 'Logistics ERP';
    
    if (userData.emp_email) {
      const domain = userData.emp_email.split('@')[1];
      if (domain && domain !== 'gmail.com' && domain !== 'yahoo.com') {
        // Use domain as company name
        companyName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
      } else {
        // Generate company name from username
        companyName = `${userData.emp_uname.charAt(0).toUpperCase()}${userData.emp_uname.slice(1)} Logistics`;
      }
    }
    
    return {
      id: `comp_${userData.emp_id}`,
      name: companyName,
      domain: userData.emp_email ? userData.emp_email.split('@')[1] : 'localhost',
      employeeCount: 1, // This could be enhanced later
      createdAt: new Date().toISOString()
    };
  }
}

export default LocalStorageService;
