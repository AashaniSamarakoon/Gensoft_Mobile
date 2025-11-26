import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  // Following backup OnboardingStack structure
  return (
    <Stack 
      screenOptions={{ headerShown: false }}
      initialRouteName="index"  // Start with index which routes to splash
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="qr-scanner" options={{ headerShown: false }} />
      <Stack.Screen name="set-password" options={{ headerShown: false }} />
      <Stack.Screen name="verification" options={{ headerShown: false }} />
      <Stack.Screen name="saved-accounts" options={{ headerShown: false }} />
    </Stack>
  );
}