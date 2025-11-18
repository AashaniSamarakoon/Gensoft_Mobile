// NEW NestJS Backend Configuration - Separate from existing mobile-backend
// This is a completely separate implementation for the new NestJS project

const NESTJS_BACKEND_URL = 'http://192.168.1.55:3001/api/v1';

// Separate NestJS API Service - does not interfere with existing apiService.js
class NestJSApiService {
  constructor() {
    this.baseURL = NESTJS_BACKEND_URL;
    this.token = null;
    console.log('🆕 NestJS API Service initialized for:', this.baseURL);
  }

  async setAuthToken(token) {
    this.token = token;
    console.log('🔐 NestJS Service: Token set');
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      console.log(`🌐 NestJS API: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
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
    this.token = null;
    return this.post('/auth/logout', {});
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