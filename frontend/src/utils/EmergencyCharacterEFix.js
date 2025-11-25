// IMMEDIATE ACTION: Character E Syntax Error Emergency Fix
// Add this to any React Native screen to immediately fix the error

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const EmergencyCharacterEFix = {
  // Call this function immediately when the app starts to fix the error
  async fixCharacterEErrorNow() {
    console.log('🚨 EMERGENCY: Fixing Character E Syntax Error NOW');
    
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      let fixedCount = 0;
      
      for (const key of allKeys) {
        try {
          const rawValue = await AsyncStorage.getItem(key);
          if (rawValue) {
            // Try to parse - if it fails, remove the corrupted data
            JSON.parse(rawValue);
          }
        } catch (parseError) {
          if (parseError.message.includes('Unexpected character: e') || 
              parseError.message.includes('Unexpected token')) {
            console.log(`🗑️ FIXING: Removing corrupted key "${key}"`);
            await AsyncStorage.removeItem(key);
            fixedCount++;
          }
        }
      }
      
      console.log(`✅ FIXED: Removed ${fixedCount} corrupted entries`);
      
      if (fixedCount > 0) {
        Alert.alert(
          'Corruption Fixed', 
          `Fixed ${fixedCount} corrupted entries. The app should work normally now.`,
          [{ text: 'OK' }]
        );
      }
      
      return { success: true, fixedCount };
    } catch (error) {
      console.error('❌ Emergency fix failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Component to add to your main App.js or any screen
  EmergencyFixComponent: () => {
    const [isFixing, setIsFixing] = React.useState(false);
    const [isFixed, setIsFixed] = React.useState(false);

    const runEmergencyFix = async () => {
      setIsFixing(true);
      try {
        const result = await EmergencyCharacterEFix.fixCharacterEErrorNow();
        if (result.success) {
          setIsFixed(true);
          Alert.alert('Success', `Fixed ${result.fixedCount} corrupted entries!`);
        } else {
          Alert.alert('Error', 'Fix failed: ' + result.error);
        }
      } catch (error) {
        Alert.alert('Error', 'Fix failed: ' + error.message);
      }
      setIsFixing(false);
    };

    React.useEffect(() => {
      // Auto-run fix when component mounts
      runEmergencyFix();
    }, []);

    return (
      <View style={{ padding: 20, backgroundColor: '#ffebee', borderRadius: 8, margin: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#c62828', marginBottom: 10 }}>
          🚨 Emergency Storage Fix
        </Text>
        <Text style={{ color: '#666', marginBottom: 15 }}>
          {isFixed ? '✅ Storage has been cleaned and fixed!' : 
           isFixing ? '🔧 Fixing corrupted storage data...' : 
           '❌ Checking for storage corruption...'}
        </Text>
        <TouchableOpacity 
          onPress={runEmergencyFix}
          disabled={isFixing}
          style={{
            backgroundColor: isFixed ? '#4caf50' : '#f44336',
            padding: 12,
            borderRadius: 6,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            {isFixing ? 'Fixing...' : isFixed ? 'Fixed!' : 'Fix Storage Now'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
};

// QUICK USAGE INSTRUCTIONS:
// 1. Add this to your App.js or main screen:
//    import EmergencyCharacterEFix from './path/to/this/file';
//
// 2. Add the component to your render:
//    <EmergencyCharacterEFix.EmergencyFixComponent />
//
// 3. Or call the fix function directly:
//    EmergencyCharacterEFix.fixCharacterEErrorNow();

export default EmergencyCharacterEFix;