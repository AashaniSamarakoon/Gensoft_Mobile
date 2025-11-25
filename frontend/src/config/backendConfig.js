// DEPRECATED: Use apiConfig.js instead
// This file is kept for backward compatibility only
// Please use ../config/apiConfig.js for new implementations

// Get the backend URL from environment or use default
const getBackendUrl = () => {
  // Priority: Environment Variable > NestJS Backend on 192.168.1.55:3001
  return process.env.REACT_APP_NESTJS_BACKEND_URL || 'http://192.168.1.55:3001';
};

// Get API base URL (with /api/v1 prefix for NestJS server)
const getApiBaseUrl = () => {
  return `${getBackendUrl()}/api/v1`;
};

// Configuration object for the combined backend+middleware server
export const BackendConfig = {
  // Base URLs
  BASE_URL: getBackendUrl(),
  API_BASE_URL: getApiBaseUrl(),
  
  // Specific API endpoints (Updated for NestJS backend)
  ENDPOINTS: {
    // Authentication endpoints
    QR_SCAN: '/auth/scan-qr',
    VERIFY_EMAIL: '/auth/verify-email',
    VERIFY_PASSWORD: '/auth/verify-password',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    QUICK_LOGIN: '/auth/quick-login',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    HEALTH: '/auth/health',
    
    // Account management
    ACCOUNTS: '/accounts',
    ACCOUNT_LOGIN: '/auth/account-login',
    
    // ERP endpoints (Updated for NestJS backend)
    IOU: {
      LIST: '/iou',
      CREATE: '/iou',
      UPDATE: '/iou',
      STATS: '/iou/stats',
      GET_BY_ID: '/iou',
      DELETE: '/iou',
    },
    
    // Users endpoints
    USERS: {
      LIST: '/users',
      CREATE: '/users',
      UPDATE: '/users',
      DELETE: '/users',
    },
    
    // Network test endpoints
    NETWORK_TEST: {
      PING: '/network-test/ping',
      ECHO: '/network-test/echo',
      CORS: '/network-test/cors-test',
    },
  },
  
  // Network configuration
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  
  // Helper methods
  buildUrl: (endpoint) => {
    return `${getApiBaseUrl()}${endpoint}`;
  },
  
  buildFullUrl: (path) => {
    return `${getBackendUrl()}${path}`;
  },
};

// Helper function to get complete endpoint URL
export const getEndpointUrl = (endpoint) => {
  return BackendConfig.buildUrl(endpoint);
};

// Helper function to get backend URL (for backward compatibility)
export const getBackendBaseUrl = () => {
  return BackendConfig.BASE_URL;
};

// Environment detection
export const isLocalDevelopment = () => {
  const url = getBackendUrl();
  return url.includes('localhost') || url.includes('127.0.0.1');
};

// For physical device testing, update this configuration
export const DeviceConfig = {
  // Replace with your computer's IP address for physical device testing
  // Example: 'http://192.168.1.100:3000'
  PHYSICAL_DEVICE_URL: null, // Set this if testing on physical device
  
  getDeviceAppropriateUrl: () => {
    if (DeviceConfig.PHYSICAL_DEVICE_URL) {
      return DeviceConfig.PHYSICAL_DEVICE_URL;
    }
    return getBackendUrl();
  },
};

// Log configuration in development
if (__DEV__) {
  console.log('📡 Backend Configuration:', {
    baseUrl: BackendConfig.BASE_URL,
    apiBaseUrl: BackendConfig.API_BASE_URL,
    isLocal: isLocalDevelopment(),
  });
}

export default BackendConfig;