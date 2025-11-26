import React from 'react';
import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="iou-hub" options={{ headerShown: false }} />
      <Stack.Screen name="iou-list" options={{ headerShown: false }} />
      <Stack.Screen name="create-iou" options={{ headerShown: false }} />
      <Stack.Screen name="iou-analytics" options={{ headerShown: false }} />
      <Stack.Screen name="iou-exports" options={{ headerShown: false }} />
      <Stack.Screen name="approvals-hub" options={{ headerShown: false }} />
      <Stack.Screen name="pending-approvals" options={{ headerShown: false }} />
      <Stack.Screen name="approval-history" options={{ headerShown: false }} />
      <Stack.Screen name="module-based-approvals" options={{ headerShown: false }} />
      <Stack.Screen name="approval-analytics" options={{ headerShown: false }} />
      <Stack.Screen name="approval-exports" options={{ headerShown: false }} />
      <Stack.Screen name="proof-list" options={{ headerShown: false }} />
      <Stack.Screen name="create-proof" options={{ headerShown: false }} />
      <Stack.Screen name="proof-details" options={{ headerShown: false }} />
      <Stack.Screen name="settlement-list" options={{ headerShown: false }} />
      <Stack.Screen name="create-settlement" options={{ headerShown: false }} />
      <Stack.Screen name="reports-list" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="iou-details" options={{ headerShown: false }} />
    </Stack>
  );
}