// Immediate AsyncStorage Corruption Fix and Cleanup
// This script provides immediate recovery from the "character e" syntax error

import AsyncStorage from '@react-native-async-storage/async-storage';

class ImmediateCorruptionFix {
  static async detectAndFixCorruption() {
    console.log('🚨 IMMEDIATE CORRUPTION DETECTION AND FIX');
    console.log('='.repeat(60));
    
    try {
      // Get all storage keys
      const allKeys = await AsyncStorage.getAllKeys();
      console.log(`📋 Found ${allKeys.length} AsyncStorage keys:`, allKeys);

      const corruptedKeys = [];
      const validKeys = [];

      // Test each key for corruption
      for (const key of allKeys) {
        try {
          console.log(`\n🔍 Testing key: ${key}`);
          const rawValue = await AsyncStorage.getItem(key);
          
          if (rawValue === null) {
            console.log(`   ➡️ ${key}: null value (OK)`);
            continue;
          }

          if (rawValue === '') {
            console.log(`   ➡️ ${key}: empty string (OK)`);
            continue;
          }

          // Log first few characters for analysis
          const preview = rawValue.length > 50 ? 
            rawValue.substring(0, 30) + '...' + rawValue.substring(rawValue.length - 10) :
            rawValue;
          console.log(`   📄 Raw value preview: ${preview}`);

          // Attempt JSON parsing
          try {
            const parsed = JSON.parse(rawValue);
            console.log(`   ✅ ${key}: Valid JSON`);
            validKeys.push(key);
          } catch (parseError) {
            console.error(`   ❌ ${key}: JSON Parse Error - ${parseError.message}`);
            console.error(`   🔍 Error details:`, {
              errorType: parseError.name,
              message: parseError.message,
              valueLength: rawValue.length,
              startsWithChar: rawValue.charAt(0),
              endsWithChar: rawValue.charAt(rawValue.length - 1)
            });
            
            corruptedKeys.push({
              key,
              error: parseError.message,
              rawValue: rawValue.substring(0, 100) + (rawValue.length > 100 ? '...' : '')
            });
          }
        } catch (storageError) {
          console.error(`   💥 Storage error for ${key}:`, storageError);
          corruptedKeys.push({
            key,
            error: `Storage error: ${storageError.message}`,
            rawValue: 'Could not retrieve'
          });
        }
      }

      // Report findings
      console.log('\n📊 CORRUPTION ANALYSIS RESULTS');
      console.log('='.repeat(40));
      console.log(`✅ Valid keys: ${validKeys.length}`);
      console.log(`❌ Corrupted keys: ${corruptedKeys.length}`);

      if (corruptedKeys.length > 0) {
        console.log('\n🚨 CORRUPTED KEYS FOUND:');
        corruptedKeys.forEach((item, index) => {
          console.log(`\n${index + 1}. Key: ${item.key}`);
          console.log(`   Error: ${item.error}`);
          console.log(`   Value: ${item.rawValue}`);
        });

        // Offer cleanup
        console.log('\n🧹 AUTOMATIC CLEANUP');
        console.log('Removing all corrupted keys...');
        
        let cleanedCount = 0;
        for (const item of corruptedKeys) {
          try {
            await AsyncStorage.removeItem(item.key);
            console.log(`   🗑️ Removed: ${item.key}`);
            cleanedCount++;
          } catch (error) {
            console.error(`   ❌ Failed to remove ${item.key}:`, error);
          }
        }

        console.log(`\n✅ Cleanup complete! Removed ${cleanedCount} corrupted keys.`);
        
        return {
          success: true,
          totalKeys: allKeys.length,
          validKeys: validKeys.length,
          corruptedKeys: corruptedKeys.length,
          cleanedKeys: cleanedCount,
          details: corruptedKeys
        };
      } else {
        console.log('\n🎉 No corruption found! AsyncStorage is clean.');
        return {
          success: true,
          totalKeys: allKeys.length,
          validKeys: validKeys.length,
          corruptedKeys: 0,
          cleanedKeys: 0,
          details: []
        };
      }
    } catch (error) {
      console.error('💥 Corruption detection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Specific fix for the "character e" error
  static async fixCharacterEError() {
    console.log('\n🎯 SPECIFIC FIX FOR "CHARACTER E" ERROR');
    console.log('='.repeat(50));

    const suspiciousKeys = [
      '@auth_token',
      '@user_data', 
      '@login_session',
      '@current_user',
      '@users_table',
      '@saved_accounts'
    ];

    let fixedCount = 0;

    for (const key of suspiciousKeys) {
      try {
        console.log(`\n🔍 Checking ${key}...`);
        const rawValue = await AsyncStorage.getItem(key);
        
        if (!rawValue) {
          console.log(`   ➡️ ${key}: No data (OK)`);
          continue;
        }

        // Check if it starts with problematic character
        const firstChar = rawValue.charAt(0);
        console.log(`   📄 First character: "${firstChar}" (code: ${firstChar.charCodeAt(0)})`);

        if (firstChar === 'e' && rawValue.length > 1 && rawValue.charAt(1) !== 'y') {
          console.log(`   🚨 Suspicious "e" character detected at start of ${key}`);
          console.log(`   🗑️ Removing corrupted key: ${key}`);
          await AsyncStorage.removeItem(key);
          fixedCount++;
          continue;
        }

        // Try to parse
        try {
          JSON.parse(rawValue);
          console.log(`   ✅ ${key}: Valid JSON`);
        } catch (parseError) {
          if (parseError.message.includes('Unexpected character: e')) {
            console.log(`   🎯 Found "character e" error in ${key}!`);
            console.log(`   🗑️ Removing corrupted key: ${key}`);
            await AsyncStorage.removeItem(key);
            fixedCount++;
          } else {
            console.log(`   ❌ ${key}: Other JSON error - ${parseError.message}`);
            console.log(`   🗑️ Removing corrupted key: ${key}`);
            await AsyncStorage.removeItem(key);
            fixedCount++;
          }
        }
      } catch (error) {
        console.error(`   💥 Error checking ${key}:`, error);
      }
    }

    console.log(`\n✅ Character E fix complete! Fixed ${fixedCount} keys.`);
    return { fixedCount };
  }

  // Complete emergency reset
  static async emergencyReset() {
    console.log('\n🚨 EMERGENCY ASYNCSTORAGE RESET');
    console.log('='.repeat(40));
    console.log('⚠️ This will clear ALL AsyncStorage data!');

    try {
      await AsyncStorage.clear();
      console.log('✅ All AsyncStorage data cleared successfully.');
      console.log('📱 App will need to re-authenticate and rebuild local data.');
      
      return { success: true, message: 'Complete reset successful' };
    } catch (error) {
      console.error('❌ Emergency reset failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Run complete fix sequence
  static async runCompleteFix() {
    console.log('🛠️ RUNNING COMPLETE CORRUPTION FIX SEQUENCE');
    console.log('='.repeat(60));
    
    try {
      // Step 1: Detect and fix general corruption
      console.log('STEP 1: General corruption detection...');
      const detectionResult = await this.detectAndFixCorruption();
      
      // Step 2: Specific fix for character e error
      console.log('\nSTEP 2: Character E specific fix...');
      const characterEResult = await this.fixCharacterEError();
      
      // Summary
      console.log('\n📊 COMPLETE FIX SUMMARY');
      console.log('='.repeat(30));
      console.log(`✅ Detection successful: ${detectionResult.success}`);
      console.log(`📋 Total keys checked: ${detectionResult.totalKeys || 0}`);
      console.log(`❌ Corrupted keys found: ${detectionResult.corruptedKeys || 0}`);
      console.log(`🧹 Keys cleaned: ${detectionResult.cleanedKeys || 0}`);
      console.log(`🎯 Character E fixes: ${characterEResult.fixedCount || 0}`);
      
      const totalFixed = (detectionResult.cleanedKeys || 0) + (characterEResult.fixedCount || 0);
      
      if (totalFixed > 0) {
        console.log(`\n🎉 SUCCESS: Fixed ${totalFixed} corrupted entries!`);
        console.log('📱 The "character e syntax error" should now be resolved.');
        console.log('🔄 Please restart the mobile app to see the fix in action.');
      } else {
        console.log('\n✅ No corruption found. The error might be coming from another source.');
        console.log('🔍 Check the mobile app logs for more specific error details.');
      }

      return {
        success: true,
        totalFixed,
        detectionResult,
        characterEResult
      };
    } catch (error) {
      console.error('💥 Complete fix sequence failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default ImmediateCorruptionFix;