// Import Platform polyfill first to ensure global availability
import './src/polyfills/PlatformGlobal.js';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { AuthProvider } from './src/context/AuthContext';
import { ReduxAuthProvider } from './src/context/ReduxAuthContext';
import { NestJSAuthProvider } from './src/context/NestJSAuthContext';
import { DashboardProvider } from './src/context/DashboardContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ActivityIndicator, View } from 'react-native';

// Loading component for PersistGate
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#007bff" />
  </View>
);

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <ReduxAuthProvider>
          <NestJSAuthProvider>
            <AuthProvider>
              <DashboardProvider>
                <StatusBar style="light" backgroundColor="#007bff" />
                <AppNavigator />
              </DashboardProvider>
            </AuthProvider>
          </NestJSAuthProvider>
        </ReduxAuthProvider>
      </PersistGate>
    </Provider>
  );
}
