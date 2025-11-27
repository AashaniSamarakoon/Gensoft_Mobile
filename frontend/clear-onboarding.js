// Script to clear onboarding status for testing
import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearOnboardingStatus = async () => {
  try {
    await AsyncStorage.removeItem('@onboarding_complete');
    console.log('✅ Onboarding status cleared for testing');
  } catch (error) {
    console.error('❌ Error clearing onboarding status:', error);
  }
};

// If running directly in console:
// AsyncStorage.removeItem('@onboarding_complete').then(() => console.log('Cleared')).catch(console.error);