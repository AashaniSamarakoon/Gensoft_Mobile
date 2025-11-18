import React, { createContext, useContext, useState, useEffect } from 'react';
import nestjsApiService from '../services/nestjsApiService';

// NEW NestJS Authentication Context - separate from existing AuthContext
const NestJSAuthContext = createContext();

export const useNestJSAuth = () => {
  const context = useContext(NestJSAuthContext);
  if (!context) {
    throw new Error('useNestJSAuth must be used within a NestJSAuthProvider');
  }
  return context;
};

export const NestJSAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // NestJS Login
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 NestJS Auth: Attempting login...');
      
      const response = await nestjsApiService.login(credentials);
      
      if (response.access_token) {
        // Get user profile after successful login
        const profile = await nestjsApiService.getProfile();
        setUser(profile);
        setIsAuthenticated(true);
        console.log('✅ NestJS Login successful');
        return { success: true, user: profile };
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('❌ NestJS Login failed:', error.message);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // NestJS Register
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 NestJS Auth: Attempting registration...');
      
      const response = await nestjsApiService.register(userData);
      console.log('✅ NestJS Registration successful');
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ NestJS Registration failed:', error.message);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // NestJS Logout
  const logout = async () => {
    try {
      setLoading(true);
      console.log('🚪 NestJS Auth: Logging out...');
      
      await nestjsApiService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      console.log('✅ NestJS Logout successful');
      return { success: true };
    } catch (error) {
      console.error('❌ NestJS Logout error:', error.message);
      // Clear state anyway
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Test NestJS backend connection
  const testConnection = async () => {
    try {
      setLoading(true);
      const result = await nestjsApiService.testConnection();
      if (result.success) {
        console.log('✅ NestJS Backend connection test successful');
      } else {
        setError('Cannot connect to NestJS backend');
      }
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    user,
    loading,
    isAuthenticated,
    error,
    
    // Methods
    login,
    register,
    logout,
    testConnection,
    clearError,
  };

  return (
    <NestJSAuthContext.Provider value={value}>
      {children}
    </NestJSAuthContext.Provider>
  );
};