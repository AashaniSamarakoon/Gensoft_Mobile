import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getBaseURL } from '../src/config/apiConfig.js';

/**
 * NestJS API Service for Mobile App
 * Handles all API calls to the NestJS backend - CENTRALIZED CONFIG
 */
class NestJSApiService {
  constructor() {
    // Use the centralized backend URL configuration
    this.baseURL = getBaseURL();
    
    // Create axios instance
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 15000, // 15 second timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
        
        // Add auth token if available
        try {
          const token = await SecureStore.getItemAsync('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔐 API Request with token');
          } else {
            console.log('📡 API Request without token');
          }
        } catch (error) {
          console.error('❌ Error getting token from SecureStore:', error);
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response ${response.status}:`, response.config.url);
        return response;
      },
      (error) => {
        console.error('❌ API Error:', error.response?.status, error.response?.data?.message || error.message);
        
        // Handle network errors specifically
        if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
          console.error('🚫 Server connection failed - is the NestJS server running on port 3001?');
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * QR Code Authentication Flow
   */
  async scanQRCode(qrData) {
    try {
      console.log('📱 Scanning QR Code with NestJS backend');
      const response = await this.api.post('/auth/scan-qr', {
        qrData: qrData
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ QR scan error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Email Verification
   */
  async verifyEmail(email, employeeId, code) {
    try {
      console.log('📱 Verifying code for email:', email);
      console.log('🔑 Verification code:', code);
      console.log('📤 Email type:', typeof email);
      console.log('📤 Email value:', JSON.stringify(email));
      
      // Ensure email is a valid string
      const emailStr = email ? String(email).trim() : '';
      const codeStr = code ? String(code).trim() : '';
      
      console.log('📤 Processed email:', emailStr);
      console.log('📤 Processed code:', codeStr);
      
      // Backend expects 'verificationCode' field, not 'code'
      const requestData = {
        email: emailStr,
        verificationCode: codeStr
      };
      
      console.log('📤 Sending request data:', JSON.stringify(requestData));
      console.log('🌐 POST /auth/verify-email');
      console.log('🔗 Request URL:', `${this.baseURL}/auth/verify-email`);
      
      const response = await this.api.post('/auth/verify-email', requestData);
      
      console.log('✅ Verification response status:', response.status);
      console.log('✅ Verification response headers:', JSON.stringify(response.headers));
      console.log('✅ Verification response data:', JSON.stringify(response.data));
      
      // Check if the response indicates success
      if (response.data && response.data.success !== false) {
        return response.data;
      } else {
        console.error('❌ Backend returned unsuccessful response:', response.data);
        throw new Error(response.data?.message || response.data?.error || 'Verification failed');
      }
    } catch (error) {
      console.error('❌ Verification error caught:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error constructor:', error.constructor.name);
      
      if (error.response) {
        console.error('❌ Error response status:', error.response.status);
        console.error('❌ Error response headers:', JSON.stringify(error.response.headers));
        console.error('❌ Error response data:', JSON.stringify(error.response.data));
      } else if (error.request) {
        console.error('❌ Error request:', error.request);
      } else {
        console.error('❌ Error message:', error.message);
      }
      
      throw this.handleError(error);
    }
  }

  /**
   * Password Verification for existing users
   */
  async verifyPassword(email, employeeId, password) {
    try {
      console.log('🔐 Verifying password for:', email);
      
      const response = await this.api.post('/auth/verify-password', {
        email: email,
        employeeId: employeeId,
        password: password
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Password verification error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Set Mobile Password for new users
   */
  async setMobilePassword(email, mobilePassword, confirmPassword) {
    try {
      console.log('🔐 Setting mobile password for:', email);
      
      const response = await this.api.post('/auth/set-mobile-password', {
        email: email,
        mobilePassword: mobilePassword,
        confirmPassword: confirmPassword
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Set password error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Regular Login
   */
  async login(username, password) {
    try {
      console.log('🔐 Logging in user:', username);
      
      const response = await this.api.post('/auth/login', {
        username: username,
        password: password
      });
      
      const result = response.data;
      
      // Store tokens if login successful
      if (result.success && result.data && result.data.tokens) {
        await this.saveTokens(result.data.tokens, result.data.user);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Quick Login (existing authenticated user)
   */
  async quickLogin(userId, deviceInfo = {}) {
    try {
      console.log('⚡ Quick login attempt for user:', userId);
      
      const response = await this.api.post('/auth/quick-login', {
        userId: userId,
        deviceInfo: {
          deviceId: deviceInfo.deviceId || 'mobile_app',
          platform: deviceInfo.platform || 'react-native',
          version: deviceInfo.version || '1.0.0',
          model: deviceInfo.model || 'Mobile Device'
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Quick login error:', error);
      
      // If quick login fails with specific errors, try to recover
      if (error.response && error.response.status === 401) {
        const errorMessage = error.response.data?.message || '';
        
        // Check if it's a user not found or session issue
        if (errorMessage.includes('User account not found') || 
            errorMessage.includes('Session expired') ||
            errorMessage.includes('No active session')) {
          
          console.log('🔄 Attempting session recovery...');
          try {
            // Try to get user info from stored data
            const userData = await this.getStoredUserData();
            if (userData && userData.email) {
              const recoveryResponse = await this.recoverUserSession(userData.email);
              
              if (recoveryResponse.success && recoveryResponse.data.action === 'retry_quick_login') {
                console.log('✅ Session recovered, retrying quick login...');
                // Retry the quick login with recovered session
                const retryResponse = await this.api.post('/auth/quick-login', {
                  userId: recoveryResponse.data.userId,
                  deviceInfo: {
                    deviceId: deviceInfo.deviceId || 'mobile_app',
                    platform: deviceInfo.platform || 'react-native',
                    version: deviceInfo.version || '1.0.0',
                    model: deviceInfo.model || 'Mobile Device'
                  }
                });
                return retryResponse.data;
              } else {
                // Recovery suggests password login is needed
                throw new Error('Password login required - session could not be recovered');
              }
            }
          } catch (recoveryError) {
            console.error('❌ Session recovery failed:', recoveryError);
          }
        }
      }
      
      throw this.handleError(error);
    }
  }

  /**
   * Recover user session
   */
  async recoverUserSession(email) {
    try {
      console.log('🔄 Recovering user session for:', email);
      const response = await this.api.post('/auth/recover-session', { email });
      return response.data;
    } catch (error) {
      console.error('❌ Session recovery error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get stored user data (helper method)
   */
  async getStoredUserData() {
    try {
      // This would typically use AsyncStorage or SecureStore
      // For now, return null - implement based on your storage solution
      return null;
    } catch (error) {
      console.error('Error getting stored user data:', error);
      return null;
    }
  }

  /**
   * Get Saved Accounts
   */
  async getSavedAccounts() {
    try {
      const response = await this.api.get('/auth/saved-accounts');
      return response.data;
    } catch (error) {
      console.error('❌ Get saved accounts error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      console.log('🚪 Logging out...');
      
      await this.api.post('/auth/logout');
      await this.clearTokens();
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Clear tokens anyway
      await this.clearTokens();
      throw this.handleError(error);
    }
  }

  /**
   * Health Check
   */
  async healthCheck() {
    try {
      const response = await this.api.get('/auth/health');
      return response.data;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Network Test Ping
   */
  async ping() {
    try {
      const response = await this.api.get('/network-test/ping');
      return response.data;
    } catch (error) {
      console.error('❌ Ping failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Token Management
   */
  async saveTokens(tokens, userData = null) {
    try {
      console.log('💾 Saving authentication tokens...');
      await SecureStore.setItemAsync('accessToken', tokens.accessToken);
      await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
      
      if (userData) {
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      }
      
      console.log('✅ Tokens saved successfully');
    } catch (error) {
      console.error('❌ Error saving tokens:', error);
      throw error;
    }
  }

  async getStoredTokens() {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const userData = await SecureStore.getItemAsync('userData');
      
      return {
        accessToken,
        refreshToken,
        userData: userData ? JSON.parse(userData) : null
      };
    } catch (error) {
      console.error('❌ Error getting stored tokens:', error);
      return null;
    }
  }

  async clearTokens() {
    try {
      console.log('🗑️ Clearing stored tokens');
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('userData');
      console.log('✅ Tokens cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing tokens:', error);
    }
  }

  /**
   * Error Handling
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'Server error occurred';
      return new Error(message);
    } else if (error.request) {
      // Network error
      console.error('🚫 Network Error Details:', error.request);
      return new Error('Network connection failed. Please check if the server is running and your connection is stable.');
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  /**
   * Get Server Status
   */
  async getServerStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/auth/health`, { timeout: 5000 });
      return {
        online: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      return {
        online: false,
        error: error.message,
        details: error.code === 'ECONNREFUSED' ? 'Server is not running' : 'Network error'
      };
    }
  }

  /**
   * Test Connection
   */
  async testConnection() {
    console.log('🔗 Testing connection to NestJS backend...');
    console.log('🌐 Backend URL:', this.baseURL);
    
    const status = await this.getServerStatus();
    
    if (status.online) {
      console.log('✅ Server is online and responding');
      return { success: true, message: 'Connection successful' };
    } else {
      console.error('❌ Server is offline or unreachable');
      console.error('📋 Error details:', status.details);
      return { 
        success: false, 
        message: status.details,
        suggestion: 'Please ensure the NestJS server is running on port 3001'
      };
    }
  }

  // =============================================================================
  // IOU METHODS
  // =============================================================================

  /**
   * Create a new IOU
   */
  async createIOU(iouData) {
    try {
      console.log('📝 Creating IOU:', iouData);
      
      const response = await this.api.post('/iou', iouData);
      
      return response.data;
    } catch (error) {
      console.error('❌ Create IOU error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all IOUs with optional filtering
   */
  async getIOUs(queryParams = {}) {
    try {
      console.log('📋 Fetching IOUs with params:', queryParams);
      
      const response = await this.api.get('/iou', { params: queryParams });
      
      return response.data;
    } catch (error) {
      console.error('❌ Get IOUs error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get single IOU by ID
   */
  async getIOU(id) {
    try {
      console.log('📄 Fetching IOU:', id);
      
      const response = await this.api.get(`/iou/${id}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Get IOU error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update IOU
   */
  async updateIOU(id, updateData) {
    try {
      console.log('✏️ Updating IOU:', id, updateData);
      
      const response = await this.api.patch(`/iou/${id}`, updateData);
      
      return response.data;
    } catch (error) {
      console.error('❌ Update IOU error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Mark IOU as paid
   */
  async markIOUAsPaid(id) {
    try {
      console.log('💰 Marking IOU as paid:', id);
      
      const response = await this.api.patch(`/iou/${id}/mark-paid`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Mark IOU as paid error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete IOU
   */
  async deleteIOU(id) {
    try {
      console.log('🗑️ Deleting IOU:', id);
      
      const response = await this.api.delete(`/iou/${id}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Delete IOU error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user IOU statistics
   */
  async getUserIOUStats(userId) {
    try {
      console.log('📊 Fetching IOU stats for user:', userId);
      
      const response = await this.api.get(`/iou/stats/${userId}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Get IOU stats error:', error);
      throw this.handleError(error);
    }
  }

  // =============================================================================
  // PROOF METHODS
  // =============================================================================

  /**
   * Create a new proof
   */
  async createProof(proofData) {
    try {
      console.log('📸 Creating proof:', proofData);
      
      const response = await this.api.post('/api/proof', proofData);
      
      return response.data;
    } catch (error) {
      console.error('❌ Create proof error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all proofs with optional filtering
   */
  async getProofs(queryParams = {}) {
    try {
      console.log('📋 Fetching proofs with params:', queryParams);
      
      const response = await this.api.get('/api/proof', { params: queryParams });
      
      return response.data;
    } catch (error) {
      console.error('❌ Get proofs error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get single proof by ID
   */
  async getProof(id) {
    try {
      console.log('📄 Fetching proof:', id);
      
      const response = await this.api.get(`/api/proof/${id}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Get proof error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update proof
   */
  async updateProof(id, updateData) {
    try {
      console.log('✏️ Updating proof:', id, updateData);
      
      const response = await this.api.patch(`/api/proof/${id}`, updateData);
      
      return response.data;
    } catch (error) {
      console.error('❌ Update proof error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Submit proof
   */
  async submitProof(id) {
    try {
      console.log('📤 Submitting proof:', id);
      
      const response = await this.api.post(`/api/proof/${id}/submit`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Submit proof error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete proof
   */
  async deleteProof(id) {
    try {
      console.log('🗑️ Deleting proof:', id);
      
      const response = await this.api.delete(`/api/proof/${id}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Delete proof error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get proof stats
   */
  async getProofStats() {
    try {
      console.log('📊 Fetching proof stats');
      
      const response = await this.api.get('/api/proof/stats/summary');
      
      return response.data;
    } catch (error) {
      console.error('❌ Get proof stats error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get proofs by category
   */
  async getProofsByCategory(category) {
    try {
      console.log('📂 Fetching proofs by category:', category);
      
      const response = await this.api.get(`/api/proof/category/${category}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Get proofs by category error:', error);
      throw this.handleError(error);
    }
  }

  // =============================================================================
  // SETTLEMENT METHODS
  // =============================================================================

  /**
   * Create a new settlement
   */
  async createSettlement(settlementData) {
    try {
      console.log('🏦 Creating settlement:', settlementData);
      
      const response = await this.api.post('/api/settlement', settlementData);
      
      return response.data;
    } catch (error) {
      console.error('❌ Create settlement error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all settlements with optional filtering
   */
  async getSettlements(queryParams = {}) {
    try {
      console.log('📋 Fetching settlements with params:', queryParams);
      
      const response = await this.api.get('/api/settlement', { params: queryParams });
      
      return response.data;
    } catch (error) {
      console.error('❌ Get settlements error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get single settlement by ID
   */
  async getSettlement(id) {
    try {
      console.log('📄 Fetching settlement:', id);
      
      const response = await this.api.get(`/api/settlement/${id}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Get settlement error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update settlement
   */
  async updateSettlement(id, updateData) {
    try {
      console.log('✏️ Updating settlement:', id, updateData);
      
      const response = await this.api.patch(`/api/settlement/${id}`, updateData);
      
      return response.data;
    } catch (error) {
      console.error('❌ Update settlement error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Submit settlement
   */
  async submitSettlement(id) {
    try {
      console.log('📤 Submitting settlement:', id);
      
      const response = await this.api.post(`/api/settlement/${id}/submit`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Submit settlement error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Approve settlement
   */
  async approveSettlement(id) {
    try {
      console.log('✅ Approving settlement:', id);
      
      const response = await this.api.post(`/api/settlement/${id}/approve`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Approve settlement error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Reject settlement
   */
  async rejectSettlement(id) {
    try {
      console.log('❌ Rejecting settlement:', id);
      
      const response = await this.api.post(`/api/settlement/${id}/reject`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Reject settlement error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete settlement
   */
  async deleteSettlement(id) {
    try {
      console.log('🗑️ Deleting settlement:', id);
      
      const response = await this.api.delete(`/api/settlement/${id}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Delete settlement error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get settlement stats
   */
  async getSettlementStats() {
    try {
      console.log('📊 Fetching settlement stats');
      
      const response = await this.api.get('/api/settlement/stats/summary');
      
      return response.data;
    } catch (error) {
      console.error('❌ Get settlement stats error:', error);
      throw this.handleError(error);
    }
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
      
      const response = await this.api.get('/approvals', { params });
      
      return response.data;
    } catch (error) {
      console.error('❌ Get approvals error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get modules list for dropdown
   */
  async getModules() {
    try {
      console.log('📁 Fetching modules list');
      
      const response = await this.api.get('/approvals/modules');
      
      return response.data;
    } catch (error) {
      console.error('❌ Get modules error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create new approval
   */
  async createApproval(approvalData) {
    try {
      console.log('➕ Creating approval:', approvalData);
      
      const response = await this.api.post('/approvals', approvalData);
      
      return response.data;
    } catch (error) {
      console.error('❌ Create approval error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Approve an approval
   */
  async approveApproval(id, data = {}) {
    try {
      console.log('✅ Approving approval:', id);
      
      const response = await this.api.post(`/approvals/${id}/approve`, data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Approve approval error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Reject an approval
   */
  async rejectApproval(id, data = {}) {
    try {
      console.log('❌ Rejecting approval:', id);
      
      const response = await this.api.post(`/approvals/${id}/reject`, data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Reject approval error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get pending approvals
   */
  async getPendingApprovals() {
    try {
      console.log('⏳ Fetching pending approvals');
      
      const response = await this.api.get('/approvals/pending');
      
      return response.data;
    } catch (error) {
      console.error('❌ Get pending approvals error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get approval stats
   */
  async getApprovalStats() {
    try {
      console.log('📊 Fetching approval stats');
      
      const response = await this.api.get('/approvals/stats/summary');
      
      return response.data;
    } catch (error) {
      console.error('❌ Get approval stats error:', error);
      throw this.handleError(error);
    }
  }
}

// Export singleton instance
const nestjsApiService = new NestJSApiService();

// Log configuration on service creation
console.log('🔧 NestJS API Service initialized');
console.log('🌐 Backend URL:', nestjsApiService.baseURL);

export default nestjsApiService;