// Import Platform polyfill first to ensure global availability
import './src/polyfills/PlatformGlobal.js';

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { AuthProvider } from './src/context/AuthContext';
import { ReduxAuthProvider } from './src/context/ReduxAuthContext';
import { NestJSAuthProvider } from './src/context/NestJSAuthContext';
import { DashboardProvider } from './src/context/DashboardContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import AsyncStorageWrapper from './src/utils/AsyncStorageWrapper';
import { ActivityIndicator, View, Text } from 'react-native';

// Loading component for PersistGate
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#007bff" />
  </View>
);

// Enhanced loading with corruption fix
const EnhancedLoadingScreen = ({ onFixComplete }) => {
  const [isFixing, setIsFixing] = useState(true);
  const [fixStatus, setFixStatus] = useState('Checking storage...');

  useEffect(() => {
    const runStorageFix = async () => {
      try {
        console.log('🛠️ App startup: Running AsyncStorage corruption check...');
        setFixStatus('Fixing storage corruption...');
        
        // Run emergency cleanup
        const result = await AsyncStorageWrapper.emergencyCleanup();
        
        if (result.success && result.cleanedCount > 0) {
          console.log(`✅ Fixed ${result.cleanedCount} corrupted entries on startup`);
          setFixStatus(`Fixed ${result.cleanedCount} corrupted entries`);
        } else {
          console.log('✅ No storage corruption found');
          setFixStatus('Storage is clean');
        }
        
        // Brief delay to show status
        setTimeout(() => {
          setIsFixing(false);
          if (onFixComplete) onFixComplete();
        }, 1500);
        
      } catch (error) {
        console.error('Storage fix failed:', error);
        setFixStatus('Storage check failed');
        setTimeout(() => {
          setIsFixing(false);
          if (onFixComplete) onFixComplete();
        }, 1000);
      }
    };

    runStorageFix();
  }, []);

  if (!isFixing) return <LoadingScreen />;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
      <ActivityIndicator size="large" color="#007bff" />
      <Text style={{ marginTop: 20, color: '#666', fontSize: 16 }}>
        {fixStatus}
      </Text>
    </View>
  );
};

export default function App() {
  const [storageFixed, setStorageFixed] = useState(false);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate 
          loading={<EnhancedLoadingScreen onFixComplete={() => setStorageFixed(true)} />} 
          persistor={persistor}
        >
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
    </ErrorBoundary>
  );
}
