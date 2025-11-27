import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { DashboardProvider } from '../src/context/DashboardContext';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from '../src/screens/SplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initial layout wrapper
function RootLayoutNav() {
  const { isAuthenticated, loading: authLoading, hasLoggedOut } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [appLoading, setAppLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Check if user has seen onboarding (only once)
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const onboardingComplete = await AsyncStorage.getItem('@onboarding_complete');
        const hasSeenIt = onboardingComplete === 'true';
        console.log('🔍 Main layout - Onboarding check:', onboardingComplete, '→ HasSeen:', hasSeenIt);
        
        // FOR TESTING: Uncomment the line below to reset onboarding (remove in production)
        // await AsyncStorage.removeItem('@onboarding_complete'); setHasSeenOnboarding(false);
        
        setHasSeenOnboarding(hasSeenIt);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setHasSeenOnboarding(false);
      } finally {
        setAppLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []); // Empty dependency array to run only once

  // Handle navigation based on auth state (following backup OnboardingStack pattern)
  useEffect(() => {
    if (authLoading || appLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    console.log('🧭 Navigation check - Auth:', isAuthenticated, 'AuthGroup:', inAuthGroup, 'TabsGroup:', inTabsGroup, 'Segments:', segments, 'HasLoggedOut:', hasLoggedOut, 'HasSeenOnboarding:', hasSeenOnboarding);

    // If authenticated but not in tabs group, go to dashboard
    if (isAuthenticated && !inTabsGroup) {
      console.log('🎯 User authenticated, navigating to dashboard');
      router.replace('/(tabs)/dashboard');
    } 
    // Handle unauthenticated users (following backup OnboardingStack logic)
    else if (!isAuthenticated && !inAuthGroup) {
      console.log('🔐 User not authenticated, routing to auth flow...');
      
      // If user just logged out, go directly to welcome (like backup initialRouteName logic)
      if (hasLoggedOut) {
        console.log('📤 User logged out, going directly to welcome screen');
        router.replace('/(auth)/welcome');
      }
      // All unauthenticated users go through splash which handles onboarding check
      else {
        console.log('🚀 Starting with splash screen for proper flow');
        router.replace('/(auth)/splash');
      }
    }
    // If already in correct section, don't navigate to prevent loops
    else {
      console.log('✅ Already in correct section, no navigation needed');
    }
  }, [isAuthenticated, authLoading, appLoading, segments, hasLoggedOut, hasSeenOnboarding]);

  // Show minimal loading only during initial app loading, not auth loading
  if (appLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#667eea' }}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={{ color: '#ffffff', marginTop: 10, fontSize: 16 }}>Initializing...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

// Root layout with providers
export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <DashboardProvider>
          <RootLayoutNav />
        </DashboardProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}