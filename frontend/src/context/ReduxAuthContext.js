import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginAsync,
  registerAsync,
  loginWithQRAsync,
  logoutAsync,
  loadStoredAuthAsync,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectAuthInitialized,
  clearError,
} from '../store/slices/authSlice';
import { clearAllData } from '../store/slices/erpSlice';
import { resetUI, showSnackbar } from '../store/slices/uiSlice';

const ReduxAuthContext = createContext();

export const useReduxAuth = () => {
  const context = useContext(ReduxAuthContext);
  if (!context) {
    throw new Error('useReduxAuth must be used within a ReduxAuthProvider');
  }
  return context;
};

export const ReduxAuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const initialized = useSelector(selectAuthInitialized);

  // Initialize authentication on app start
  useEffect(() => {
    if (!initialized) {
      console.log('🔄 Redux Auth: Initializing authentication...');
      dispatch(loadStoredAuthAsync());
    }
  }, [initialized, dispatch]);

  // Handle authentication errors with user feedback
  useEffect(() => {
    if (error) {
      console.error('🚨 Redux Auth Error:', error);
      dispatch(showSnackbar({
        message: error,
        type: 'error',
        duration: 5000,
      }));
      
      // Clear error after showing it
      setTimeout(() => {
        dispatch(clearError());
      }, 100);
    }
  }, [error, dispatch]);

  // Authentication methods
  const login = async (credentials) => {
    try {
      console.log('🔐 Redux Auth: Login attempt for:', credentials.email || credentials.username);
      const result = await dispatch(loginAsync(credentials)).unwrap();
      
      dispatch(showSnackbar({
        message: `Welcome back, ${result.user.email}!`,
        type: 'success',
      }));
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('❌ Redux Auth: Login failed:', error);
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Redux Auth: Registration attempt for:', userData.email);
      const result = await dispatch(registerAsync(userData)).unwrap();
      
      dispatch(showSnackbar({
        message: `Account created successfully! Welcome, ${result.user.email}!`,
        type: 'success',
      }));
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('❌ Redux Auth: Registration failed:', error);
      return { success: false, error };
    }
  };

  const loginWithQR = async (qrData) => {
    try {
      console.log('📱 Redux Auth: QR login attempt');
      const result = await dispatch(loginWithQRAsync(qrData)).unwrap();
      
      dispatch(showSnackbar({
        message: `QR Login successful! Welcome, ${result.user.email}!`,
        type: 'success',
      }));
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('❌ Redux Auth: QR login failed:', error);
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Redux Auth: Logout attempt');
      await dispatch(logoutAsync()).unwrap();
      
      // Clear all app data on logout
      dispatch(clearAllData());
      dispatch(resetUI());
      
      dispatch(showSnackbar({
        message: 'Logged out successfully',
        type: 'info',
      }));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Redux Auth: Logout error:', error);
      // Still clear data even if logout API fails
      dispatch(clearAllData());
      dispatch(resetUI());
      
      return { success: false, error };
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  // Enhanced authentication status
  const isAuthReady = initialized && !loading;
  const needsAuthentication = isAuthReady && !isAuthenticated;

  const value = {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    initialized,
    isAuthReady,
    needsAuthentication,
    
    // Methods
    login,
    register,
    loginWithQR,
    logout,
    clearAuthError,
    
    // Full auth object for backward compatibility
    auth,
  };

  return (
    <ReduxAuthContext.Provider value={value}>
      {children}
    </ReduxAuthContext.Provider>
  );
};

// Hook for easy authentication status checks
export const useAuthStatus = () => {
  const { isAuthenticated, loading, initialized, user } = useReduxAuth();
  
  return {
    isAuthenticated,
    isLoading: loading,
    isReady: initialized && !loading,
    needsAuth: initialized && !loading && !isAuthenticated,
    user,
  };
};

// Hook for authentication actions
export const useAuthActions = () => {
  const { login, register, loginWithQR, logout, clearAuthError } = useReduxAuth();
  
  return {
    login,
    register,
    loginWithQR,
    logout,
    clearError: clearAuthError,
  };
};