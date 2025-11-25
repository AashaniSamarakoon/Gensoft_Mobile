// NEW NestJS Backend Configuration - Centralized Configuration
// This is a completely separate implementation for the new NestJS project

import { API_BASE_URL, getBaseURL } from '../config/apiConfig.js';
import * as SecureStore from 'expo-secure-store';

// Separate NestJS API Service - does not interfere with existing apiService.js
class NestJSApiService {
  constructor() {
    this.baseURL = getBaseURL();
    this.token = null;
    console.log('NestJS API Service initialized for:', this.baseURL);
  }

  async setAuthToken(token) {
    this.token = token;
    console.log('NestJS Service: Token set');
  }

  async getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Try to get token from SecureStore first, then fallback to this.token
    try {
      const storedToken = await SecureStore.getItemAsync('accessToken');
      if (storedToken) {
        headers.Authorization = `Bearer ${storedToken}`;
        console.log('🔐 Token present: YES');
      } else if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
        console.log('🔐 Token present: YES (from memory)');
      } else {
        console.log('🔐 Token present: NO');
      }
    } catch (error) {
      console.error('❌ Error getting token from SecureStore:', error);
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
        console.log('🔐 Token present: YES (fallback)');
      }
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const authHeaders = await this.getAuthHeaders();
    const config = {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    };

    try {
      console.log(`🌐 NestJS API: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ Unauthorized - authentication required');
          throw new Error('Unauthorized');
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ NestJS API Error: ${endpoint}`, error.message);
      throw error;
    }
  }

  // HTTP methods
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // NestJS Authentication endpoints
  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    if (response.access_token) {
      await this.setAuthToken(response.access_token);
    }
    return response;
  }

  async register(userData) {
    return this.post('/auth/register', userData);
  }

  async logout() {
    // Make the logout API call FIRST (while we still have the auth token)
    const response = await this.post('/auth/logout', {});
    // THEN clear the token after successful logout
    this.token = null;
    return response;
  }

  async getProfile() {
    return this.get('/auth/profile');
  }

  // NestJS ERP endpoints (adjust based on your actual NestJS routes)
  async getUsers() {
    return this.get('/users');
  }

  async createUser(userData) {
    return this.post('/users', userData);
  }

  async getDocuments() {
    return this.get('/documents');
  }

  async createDocument(docData) {
    return this.post('/documents', docData);
  }

  // Health check for NestJS backend
  async healthCheck() {
    return this.get('/auth/health');
  }

  // Network test endpoints
  async ping() {
    return this.get('/network-test/ping');
  }

  async echo(data) {
    return this.post('/network-test/echo', data);
  }

  async corsTest() {
    return this.get('/network-test/cors-test');
  }

  // Authentication flow endpoints (matching your backend)
  async scanQR(qrData) {
    return this.post('/auth/scan-qr', { qrData });
  }

  async verifyEmail(sessionId, email, verificationCode) {
    return this.post('/auth/verify-email', { sessionId, email, verificationCode });
  }

  async verifyPassword(sessionId, password) {
    return this.post('/auth/verify-password', { sessionId, password });
  }

  async quickLogin() {
    return this.post('/auth/quick-login', {});
  }

  // IOU endpoints
  async getIOUs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/iou?${queryString}`);
  }

  async createIOU(iouData) {
    return this.post('/iou', iouData);
  }

  async updateIOU(id, iouData) {
    return this.put(`/iou/${id}`, iouData);
  }

  async deleteIOU(id) {
    return this.delete(`/iou/${id}`);
  }

  // =============================================================================
  // APPROVALS METHODS
  // =============================================================================

  /**
   * Get all approvals with filtering
   */
  async getApprovals(params = {}) {
    try {
      console.log('📋 Fetching approvals with params:', params);
      
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/approvals?${queryString}` : '/approvals';
      
      return this.get(endpoint);
    } catch (error) {
      console.error('❌ Get approvals error:', error);
      throw error;
    }
  }

  /**
   * Get modules list for dropdown
   */
  async getModules() {
    try {
      console.log('📁 Fetching modules list');
      
      return this.get('/approvals/modules');
    } catch (error) {
      console.error('❌ Get modules error:', error);
      throw error;
    }
  }

  // Test connectivity
  async testConnection() {
    try {
      const result = await this.ping();
      console.log('✅ NestJS Backend is reachable');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ NestJS Backend not reachable:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance for NestJS backend
const nestjsApiService = new NestJSApiService();
export default nestjsApiService;