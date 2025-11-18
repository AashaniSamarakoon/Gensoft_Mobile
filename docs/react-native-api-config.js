// React Native API Configuration
// Add this to your React Native project

export const API_CONFIG = {
  // Backend API Base URL
  BASE_URL: 'http://192.168.1.55:3000/api/v1',
  
  // Timeout settings
  TIMEOUT: 10000,
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  SCAN_QR: '/auth/scan-qr',
  VERIFY_EMAIL: '/auth/verify-email', 
  VERIFY_PASSWORD: '/auth/verify-password',
  LOGIN: '/auth/login',
  QUICK_LOGIN: '/auth/quick-login',
  
  // IOU Management
  IOU_LIST: '/iou',
  IOU_CREATE: '/iou',
  IOU_UPDATE: (id) => `/iou/${id}`,
  IOU_DELETE: (id) => `/iou/${id}`,
  IOU_STATS: '/iou/stats',
  
  // Users
  USERS: '/users',
};

// Example API Service Class for React Native
export class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = null;
  }

  setAuthToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async scanQR(qrData) {
    return this.request(API_ENDPOINTS.SCAN_QR, {
      method: 'POST',
      body: JSON.stringify({ qrData }),
    });
  }

  async verifyEmail(sessionId, email, verificationCode) {
    return this.request(API_ENDPOINTS.VERIFY_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ sessionId, email, verificationCode }),
    });
  }

  async verifyPassword(sessionId, password) {
    return this.request(API_ENDPOINTS.VERIFY_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ sessionId, password }),
    });
  }

  async login(email, password) {
    return this.request(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async quickLogin() {
    return this.request(API_ENDPOINTS.QUICK_LOGIN, {
      method: 'GET',
    });
  }

  // IOU methods
  async getIOUs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`${API_ENDPOINTS.IOU_LIST}?${queryString}`);
  }

  async createIOU(iouData) {
    return this.request(API_ENDPOINTS.IOU_CREATE, {
      method: 'POST',
      body: JSON.stringify(iouData),
    });
  }
}

// Usage example in React Native component:
/*
import { ApiService } from './api/ApiService';

const api = new ApiService();

// In your component
const handleLogin = async (email, password) => {
  try {
    const response = await api.login(email, password);
    api.setAuthToken(response.access_token);
    // Handle successful login
  } catch (error) {
    // Handle error
  }
};
*/