import React, { createContext, useContext, useState } from 'react';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerDashboardRefresh = () => {
    console.log('📊 Triggering dashboard refresh...');
    setRefreshTrigger(prev => prev + 1);
  };

  const clearDashboardData = async () => {
    console.log('🧹 Clearing dashboard data for user switch...');
    setRefreshTrigger(0);
    // Clear any cached dashboard data
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('@dashboard_cache');
    } catch (error) {
      console.log('Failed to clear dashboard cache:', error);
    }
  };

  const value = {
    refreshTrigger,
    triggerDashboardRefresh,
    clearDashboardData,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardContext;