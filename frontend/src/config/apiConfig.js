// API Configuration for NestJS Backend Integration
// SINGLE SOURCE OF TRUTH for all API configurations

// Environment Configuration
const ENVIRONMENT = __DEV__ ? 'development' : 'production';

// Server Configuration - Centralized BASE_URL management
const API_CONFIG = {
  development: {
    // Primary NestJS backend URL - Environment variable takes priority
    BASE_URL: process.env.REACT_APP_NESTJS_BACKEND_URL || 'http://192.168.1.55:3001/api/v1',
    // Raw URL without /api/v1 suffix (for legacy compatibility)
    BASE_URL_RAW: process.env.REACT_APP_NESTJS_BACKEND_URL?.replace('/api/v1', '') || 'http://192.168.1.55:3001',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
  },
  production: {
    // Production server URL for combined backend+middleware server
    BASE_URL: process.env.REACT_APP_NESTJS_BACKEND_URL || 'https://your-production-server.com/api/v1',
    BASE_URL_RAW: process.env.REACT_APP_NESTJS_BACKEND_URL?.replace('/api/v1', '') || 'https://your-production-server.com',
    TIMEOUT: 15000,
    RETRY_ATTEMPTS: 2,
  },
};

// Get current configuration
const getCurrentConfig = () => {
  return API_CONFIG[ENVIRONMENT];
};

// Export configuration - CENTRALIZED BASE_URL exports
export const API_BASE_URL = getCurrentConfig().BASE_URL;
export const API_BASE_URL_RAW = getCurrentConfig().BASE_URL_RAW;
export const API_TIMEOUT = getCurrentConfig().TIMEOUT;
export const API_RETRY_ATTEMPTS = getCurrentConfig().RETRY_ATTEMPTS;

// Helper functions for URL building
export const getBaseURL = () => getCurrentConfig().BASE_URL;
export const getBaseURLRaw = () => getCurrentConfig().BASE_URL_RAW;
export const buildApiURL = (endpoint) => {
  const baseUrl = getCurrentConfig().BASE_URL;
  return endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`;
};

// Feature flags for gradual migration
export const FEATURE_FLAGS = {
  USE_REDUX_AUTH: true,          // Enable Redux-based authentication
  USE_NEW_API_SERVICE: true,     // Use new ApiService with NestJS backend
  USE_SECURE_STORE: true,        // Use Expo SecureStore for token storage
  ENABLE_TOKEN_REFRESH: true,    // Enable automatic token refresh
  ENABLE_OFFLINE_MODE: false,    // Enable offline data persistence (future feature)
  ENABLE_ANALYTICS: false,       // Enable analytics tracking (future feature)
};

// API Endpoints mapping (for easy reference)
export const ENDPOINTS = {
  // Authentication - Updated to match actual implementation
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    QUICK_LOGIN: '/auth/quick-login',    // Fixed: was QR_LOGIN pointing to wrong endpoint
    SCAN_QR: '/auth/scan-qr',           // Added: QR scanning endpoint
  },
  
  // ERP Entities
  IOUS: '/ious',
  PROOFS: '/proofs',
  SETTLEMENTS: '/settlements',
  APPROVALS: '/approvals',
  
  // Dashboard & Reports
  DASHBOARD: '/dashboard/stats',
  REPORTS: '/reports',
  
  // Utilities
  SEARCH: '/search',
  HEALTH: '/health',
  FILES: '/files',
};

// Network Configuration
export const NETWORK_CONFIG = {
  MAX_CONCURRENT_REQUESTS: 5,
  REQUEST_TIMEOUT: API_TIMEOUT,
  RETRY_DELAY: 1000, // 1 second
  MAX_RETRY_DELAY: 5000, // 5 seconds
};

// Storage Keys (for consistent key management)
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  THEME: 'theme',
  LANGUAGE: 'language',
  LAST_SYNC: 'lastSync',
};

// Default Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Client-Version': '1.0.0',
  'X-Platform': 'react-native',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  DATA_SAVED: 'Data saved successfully!',
  DATA_UPDATED: 'Data updated successfully!',
  DATA_DELETED: 'Data deleted successfully!',
};

// Development helpers
export const isDevelopment = () => ENVIRONMENT === 'development';
export const isProduction = () => ENVIRONMENT === 'production';

// URL Builder helper
export const buildURL = (endpoint, params = {}) => {
  const url = new URL(endpoint, API_BASE_URL);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

// Log configuration on app start (development only)
if (isDevelopment()) {
  console.log('API Configuration - CENTRALIZED CONFIG LOADED:', {
    environment: ENVIRONMENT,
    baseURL: API_BASE_URL,
    baseURLRaw: API_BASE_URL_RAW,
    timeout: API_TIMEOUT,
    featureFlags: FEATURE_FLAGS,
  });
}

/*
 * CENTRALIZATION SUMMARY:
 * This file is now the SINGLE SOURCE OF TRUTH for all API configurations.
 * 
 * Updated files to use centralized config:
 * ✅ /src/services/nestjsApiService.js
 * ✅ /src/services/apiService.js  
 * ✅ /src/context/AuthContext.js
 * ✅ /src/screens/QRScannerScreen.js
 * ✅ /src/screens/ConnectionTestScreen.js
 * ✅ /services/nestjsApiService.js (root level)
 * 
 * Benefits:
 * - Single point of configuration changes
 * - Environment variable support
 * - Consistent URL management
 * - Easy maintenance and debugging
 * - No more hardcoded URLs scattered throughout codebase
 */