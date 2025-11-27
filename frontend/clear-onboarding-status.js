// Test script to clear onboarding status
// Run this in the console or device to test onboarding flow from beginning

import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearOnboardingForTesting = async () => {
  try {
    await AsyncStorage.removeItem('@onboarding_complete');
    await AsyncStorage.removeItem('hasSeenOnboarding');
    console.log('✅ All onboarding status cleared - app will show onboarding screens on next launch');
    
    // Also clear any other auth-related storage for complete reset
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('@user_data');
    
    console.log('✅ Complete app state reset - restart the app to see onboarding flow');
  } catch (error) {
    console.error('❌ Error clearing onboarding status:', error);
  }
};

// To use in Expo console:
// import('./clear-onboarding-status.js').then(m => m.clearOnboardingForTesting());

// Or directly in console:
// AsyncStorage.multiRemove(['@onboarding_complete', 'hasSeenOnboarding']).then(() => console.log('Cleared')).catch(console.error)