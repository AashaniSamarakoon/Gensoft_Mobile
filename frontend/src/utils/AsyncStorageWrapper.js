import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Enhanced AsyncStorage wrapper with comprehensive error handling
 * This wrapper prevents ALL JSON parse errors by handling corrupted data gracefully
 */
class AsyncStorageWrapper {
  /**
   * Safe getItem with automatic corruption handling
   */
  static async getItem(key, defaultValue = null) {
    try {
      console.log(`📖 AsyncStorage: Reading key "${key}"`);
      const rawValue = await AsyncStorage.getItem(key);
      
      // Handle null/undefined values
      if (rawValue === null || rawValue === undefined) {
        console.log(`📖 AsyncStorage: Key "${key}" not found, returning default`);
        return defaultValue;
      }

      // Handle empty strings
      if (rawValue === '') {
        console.log(`📖 AsyncStorage: Key "${key}" is empty, returning default`);
        return defaultValue;
      }

      // Log the raw value for debugging (truncated for security)
      const displayValue = rawValue.length > 100 ? 
        rawValue.substring(0, 50) + '...[truncated]...' + rawValue.substring(rawValue.length - 20) :
        rawValue;
      console.log(`📖 AsyncStorage: Raw value for "${key}":`, displayValue);

      // Attempt to parse JSON with comprehensive error handling
      try {
        const parsedValue = JSON.parse(rawValue);
        console.log(`✅ AsyncStorage: Successfully parsed "${key}"`);
        return parsedValue;
      } catch (parseError) {
        // Log detailed parse error information
        console.error(`🚨 JSON Parse Error for key "${key}":`, {
          error: parseError.message,
          errorType: parseError.name,
          rawValueLength: rawValue.length,
          firstChars: rawValue.substring(0, 20),
          lastChars: rawValue.substring(Math.max(0, rawValue.length - 20)),
          containsNullBytes: rawValue.includes('\0'),
          isValidUTF8: this.isValidUTF8(rawValue)
        });

        // Analyze the corruption type
        const corruptionType = this.analyzeCorruption(rawValue, parseError);
        console.log(`🔍 Corruption analysis for "${key}":`, corruptionType);

        // Attempt recovery based on corruption type
        const recoveredValue = await this.attemptRecovery(key, rawValue, corruptionType);
        if (recoveredValue !== null) {
          console.log(`🔧 Successfully recovered data for "${key}"`);
          return recoveredValue;
        }

        // Clean up the corrupted data
        console.log(`🧹 Cleaning up corrupted data for key "${key}"`);
        await this.removeItem(key);
        
        // Return safe default value
        console.log(`↩️ Returning default value for "${key}"`);
        return defaultValue;
      }
    } catch (storageError) {
      console.error(`💥 AsyncStorage error for key "${key}":`, storageError);
      return defaultValue;
    }
  }

  /**
   * Safe setItem with validation
   */
  static async setItem(key, value) {
    try {
      console.log(`💾 AsyncStorage: Setting key "${key}"`);
      
      // Validate the value before storing
      if (value === undefined) {
        console.warn(`⚠️ Attempting to store undefined value for "${key}", converting to null`);
        value = null;
      }

      // Serialize and validate
      const serializedValue = JSON.stringify(value);
      
      // Test that we can parse it back (validation)
      JSON.parse(serializedValue);
      
      await AsyncStorage.setItem(key, serializedValue);
      console.log(`✅ AsyncStorage: Successfully stored "${key}"`);
    } catch (error) {
      console.error(`❌ AsyncStorage setItem error for "${key}":`, error);
      throw error;
    }
  }

  /**
   * Safe removeItem
   */
  static async removeItem(key) {
    try {
      console.log(`🗑️ AsyncStorage: Removing key "${key}"`);
      await AsyncStorage.removeItem(key);
      console.log(`✅ AsyncStorage: Successfully removed "${key}"`);
    } catch (error) {
      console.error(`❌ AsyncStorage removeItem error for "${key}":`, error);
    }
  }

  /**
   * Clear all AsyncStorage data (emergency cleanup)
   */
  static async clear() {
    try {
      console.log('🧹 AsyncStorage: Clearing all data');
      await AsyncStorage.clear();
      console.log('✅ AsyncStorage: Successfully cleared all data');
    } catch (error) {
      console.error('❌ AsyncStorage clear error:', error);
    }
  }

  /**
   * Get all keys in AsyncStorage
   */
  static async getAllKeys() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('📋 AsyncStorage keys:', keys);
      return keys;
    } catch (error) {
      console.error('❌ AsyncStorage getAllKeys error:', error);
      return [];
    }
  }

  /**
   * Analyze the type of corruption
   */
  static analyzeCorruption(rawValue, parseError) {
    const analysis = {
      type: 'unknown',
      severity: 'low',
      recoverable: false,
      details: {}
    };

    // Check for common corruption patterns
    if (parseError.message.includes('Unexpected character')) {
      analysis.type = 'unexpected_character';
      analysis.severity = 'high';
      
      // Extract the problematic character
      const match = parseError.message.match(/Unexpected character: (.)/);
      if (match) {
        analysis.details.character = match[1];
      }
    }

    if (parseError.message.includes('Unexpected end')) {
      analysis.type = 'truncated_data';
      analysis.severity = 'medium';
      analysis.recoverable = true;
    }

    if (rawValue.includes('\0')) {
      analysis.type = 'null_byte_corruption';
      analysis.severity = 'high';
    }

    if (rawValue.length === 0) {
      analysis.type = 'empty_data';
      analysis.severity = 'low';
    }

    // Check for JWT token corruption
    if (rawValue.includes('.') && rawValue.split('.').length === 3) {
      analysis.type = 'jwt_corruption';
      analysis.severity = 'medium';
      analysis.recoverable = true;
    }

    return analysis;
  }

  /**
   * Attempt to recover corrupted data
   */
  static async attemptRecovery(key, rawValue, corruptionAnalysis) {
    try {
      console.log(`🔧 Attempting recovery for "${key}" with corruption type: ${corruptionAnalysis.type}`);

      switch (corruptionAnalysis.type) {
        case 'truncated_data':
          // Try to fix truncated JSON
          return this.recoverTruncatedJSON(rawValue);

        case 'null_byte_corruption':
          // Remove null bytes and retry
          return this.recoverNullByteCorruption(rawValue);

        case 'jwt_corruption':
          // Try to recover JWT tokens
          return this.recoverJWTToken(rawValue);

        case 'unexpected_character':
          // Try to clean up unexpected characters
          return this.recoverUnexpectedCharacter(rawValue, corruptionAnalysis.details.character);

        default:
          console.log(`❌ No recovery method for corruption type: ${corruptionAnalysis.type}`);
          return null;
      }
    } catch (recoveryError) {
      console.error(`❌ Recovery failed for "${key}":`, recoveryError);
      return null;
    }
  }

  /**
   * Recover truncated JSON data
   */
  static recoverTruncatedJSON(rawValue) {
    try {
      // Try to add missing closing brackets/braces
      const attempts = [
        rawValue + '}',
        rawValue + '"]',
        rawValue + '"}',
        rawValue + '"}'
      ];

      for (const attempt of attempts) {
        try {
          return JSON.parse(attempt);
        } catch (e) {
          // Continue to next attempt
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Recover data with null bytes
   */
  static recoverNullByteCorruption(rawValue) {
    try {
      const cleaned = rawValue.replace(/\0/g, '');
      return JSON.parse(cleaned);
    } catch (error) {
      return null;
    }
  }

  /**
   * Recover JWT tokens
   */
  static recoverJWTToken(rawValue) {
    try {
      // JWTs should be strings, not JSON objects
      // If it's a malformed JWT, we can't recover it safely
      // Return null to force re-authentication
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Recover data with unexpected characters
   */
  static recoverUnexpectedCharacter(rawValue, unexpectedChar) {
    try {
      // Try removing the unexpected character from the beginning
      if (rawValue.startsWith(unexpectedChar)) {
        const cleaned = rawValue.substring(1);
        return JSON.parse(cleaned);
      }

      // Try removing all instances of the unexpected character
      const cleaned = rawValue.replace(new RegExp(this.escapeRegExp(unexpectedChar), 'g'), '');
      return JSON.parse(cleaned);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if string is valid UTF-8
   */
  static isValidUTF8(str) {
    try {
      // Try to encode and decode
      const encoded = encodeURIComponent(str);
      const decoded = decodeURIComponent(encoded);
      return decoded === str;
    } catch (error) {
      return false;
    }
  }

  /**
   * Escape special regex characters
   */
  static escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Emergency cleanup for specific corruption scenarios
   */
  static async emergencyCleanup() {
    console.log('🚨 Starting emergency AsyncStorage cleanup');
    
    try {
      const keys = await this.getAllKeys();
      let cleanedCount = 0;
      
      for (const key of keys) {
        try {
          const rawValue = await AsyncStorage.getItem(key);
          if (rawValue) {
            // Test if the data is valid JSON
            JSON.parse(rawValue);
          }
        } catch (error) {
          console.log(`🧹 Removing corrupted key: ${key}`);
          await this.removeItem(key);
          cleanedCount++;
        }
      }

      console.log(`✅ Emergency cleanup complete. Removed ${cleanedCount} corrupted entries.`);
      return { success: true, cleanedCount };
    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default AsyncStorageWrapper;