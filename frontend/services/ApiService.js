import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { 
  API_BASE_URL, 
  API_TIMEOUT, 
  DEFAULT_HEADERS, 
  STORAGE_KEYS,
  ERROR_MESSAGES 
} from '../src/config/apiConfig';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: DEFAULT_HEADERS,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔐 API Request with token:', token.substring(0, 20) + '...');
          } else {
            console.log('📡 API Request without token');
          }
        } catch (error) {
          console.error('❌ Error getting token from SecureStore:', error);
        }
        console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for token refresh and error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response ${response.status}:`, response.config.url);
        return response;
      },
      async (error) => {
        console.error('❌ API Error:', error.response?.status, error.response?.data?.message || error.message);
        
        if (error.response?.status === 401) {
          console.log('🔄 Token expired, attempting refresh...');
          const refreshResult = await this.handleTokenRefresh();
          
          if (refreshResult.success) {
            // Retry the original request with new token
            console.log('🔁 Retrying original request with new token...');
            const originalRequest = error.config;
            const newToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.api(originalRequest);
          } else {
            // Refresh failed, redirect to login
            await this.clearTokens();
            throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  async handleTokenRefresh() {
    try {
      console.log('🔄 Attempting token refresh...');
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        console.log('❌ No refresh token found');
        return { success: false };
      }

      // Create a new axios instance without interceptors for refresh request
      const refreshApi = axios.create({
        baseURL: API_BASE_URL,
        timeout: 5000,
      });

      const response = await refreshApi.post('/auth/refresh', {
        refreshToken,
      });
      
      const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
      
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      
      console.log('✅ Token refresh successful');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data?.message || error.message);
      return { success: false };
    }
  }

  async clearTokens() {
    console.log('🗑️ Clearing stored tokens');
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
      console.log('✅ Tokens cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing tokens:', error);
    }
  }

  async saveTokens(tokens, userData = null) {
    try {
      console.log('💾 Saving authentication tokens...');
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      
      if (userData) {
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      }
      
      console.log('✅ Tokens saved successfully');
    } catch (error) {
      console.error('❌ Error saving tokens:', error);
      throw error;
    }
  }

  async getUserData() {
    try {
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  }

  // Authentication endpoints
  async login(credentials) {
    console.log('🔐 Attempting login for:', credentials.email || credentials.username);
    try {
      const response = await this.api.post('/auth/login', credentials);
      const { tokens, user } = response.data.data;
      
      await this.saveTokens(tokens, user);
      console.log('✅ Login successful for user:', user.email);
      
      return {
        success: true,
        user,
        tokens
      };
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(userData) {
    console.log('📝 Attempting registration for:', userData.email);
    try {
      const response = await this.api.post('/auth/register', userData);
      const { tokens, user } = response.data.data;
      
      await this.saveTokens(tokens, user);
      console.log('✅ Registration successful for user:', user.email);
      
      return {
        success: true,
        user,
        tokens
      };
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async logout() {
    console.log('🚪 Logging out...');
    try {
      await this.api.post('/auth/logout');
      await this.clearTokens();
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Clear tokens anyway
      await this.clearTokens();
    }
  }

  async refreshToken() {
    return await this.handleTokenRefresh();
  }

  // QR Code Authentication (if supported by your backend)
  async loginWithQR(qrData) {
    console.log('📱 QR Login attempt');
    try {
      const response = await this.api.post('/auth/qr-login', { qrData });
      const { tokens, user } = response.data.data;
      
      await this.saveTokens(tokens, user);
      console.log('✅ QR Login successful');
      
      return {
        success: true,
        user,
        tokens
      };
    } catch (error) {
      console.error('❌ QR Login failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'QR Login failed');
    }
  }

  // Profile endpoints
  async getProfile() {
    const response = await this.api.get('/auth/profile');
    return response.data.data;
  }

  async updateProfile(profileData) {
    const response = await this.api.put('/auth/profile', profileData);
    return response.data.data;
  }

  // Generic CRUD operations for your ERP entities
  
  // IOUs
  async getIOUs(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await this.api.get(`/ious?${params}`);
    return response.data.data;
  }

  async createIOU(iouData) {
    const response = await this.api.post('/ious', iouData);
    return response.data.data;
  }

  async updateIOU(id, iouData) {
    const response = await this.api.put(`/ious/${id}`, iouData);
    return response.data.data;
  }

  async deleteIOU(id) {
    const response = await this.api.delete(`/ious/${id}`);
    return response.data.data;
  }

  async getIOUById(id) {
    const response = await this.api.get(`/ious/${id}`);
    return response.data.data;
  }

  // Proofs
  async getProofs(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await this.api.get(`/proofs?${params}`);
    return response.data.data;
  }

  async createProof(proofData) {
    const response = await this.api.post('/proofs', proofData);
    return response.data.data;
  }

  async updateProof(id, proofData) {
    const response = await this.api.put(`/proofs/${id}`, proofData);
    return response.data.data;
  }

  async deleteProof(id) {
    const response = await this.api.delete(`/proofs/${id}`);
    return response.data.data;
  }

  // Settlements
  async getSettlements(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await this.api.get(`/settlements?${params}`);
    return response.data.data;
  }

  async createSettlement(settlementData) {
    const response = await this.api.post('/settlements', settlementData);
    return response.data.data;
  }

  async updateSettlement(id, settlementData) {
    const response = await this.api.put(`/settlements/${id}`, settlementData);
    return response.data.data;
  }

  async deleteSettlement(id) {
    const response = await this.api.delete(`/settlements/${id}`);
    return response.data.data;
  }

  // Reports
  async getReports(type, filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await this.api.get(`/reports/${type}?${params}`);
    return response.data.data;
  }

  // Approvals
  async getApprovals(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await this.api.get(`/approvals?${params}`);
    return response.data.data;
  }

  async approveItem(id, approvalData) {
    const response = await this.api.post(`/approvals/${id}/approve`, approvalData);
    return response.data.data;
  }

  async rejectItem(id, rejectionData) {
    const response = await this.api.post(`/approvals/${id}/reject`, rejectionData);
    return response.data.data;
  }

  // File upload utility
  async uploadFile(file, endpoint = '/files/upload') {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Dashboard stats
  async getDashboardStats() {
    const response = await this.api.get('/dashboard/stats');
    return response.data.data;
  }

  // Search functionality
  async search(query, type = null) {
    const params = new URLSearchParams({ query });
    if (type) params.append('type', type);
    
    const response = await this.api.get(`/search?${params}`);
    return response.data.data;
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;