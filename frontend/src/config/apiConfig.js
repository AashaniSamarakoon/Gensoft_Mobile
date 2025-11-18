// API Configuration for NestJS Backend Integration

// Environment Configuration
const ENVIRONMENT = __DEV__ ? 'development' : 'production';

// Server Configuration
const API_CONFIG = {
  development: {
    // Updated for NestJS backend on port 3001
    BASE_URL: 'http://192.168.1.55:3001/api/v1',
    // Alternative for emulator testing:
    // BASE_URL: 'http://localhost:3001/api/v1',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
  },
  production: {
    // Production server URL for combined backend+middleware server
    BASE_URL: 'https://your-production-server.com/api/v1',
    TIMEOUT: 15000,
    RETRY_ATTEMPTS: 2,
  },
};

// Get current configuration
const getCurrentConfig = () => {
  return API_CONFIG[ENVIRONMENT];
};

// Export configuration
export const API_BASE_URL = getCurrentConfig().BASE_URL;
export const API_TIMEOUT = getCurrentConfig().TIMEOUT;
export const API_RETRY_ATTEMPTS = getCurrentConfig().RETRY_ATTEMPTS;

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
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    QR_LOGIN: '/auth/qr-login',
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
  console.log('🔧 API Configuration:', {
    environment: ENVIRONMENT,
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    featureFlags: FEATURE_FLAGS,
  });
}