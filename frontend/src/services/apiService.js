// API Service - Connects to Combined Backend+Middleware Server (Port 3000)
const MOBILE_BACKEND_URL = process.env.REACT_APP_NESTJS_BACKEND_URL || 'http://192.168.1.55:3001';

class ApiService {
  constructor() {
    this.baseURL = MOBILE_BACKEND_URL;
    this.token = null;
    // Initialize token asynchronously
    this.initializeToken().catch(error => {
      console.log('Failed to initialize token:', error);
    });
  }

  async initializeToken() {
    // Try to restore token from AsyncStorage
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const storedToken = await AsyncStorage.getItem('@auth_token');
      if (storedToken) {
        this.token = storedToken;
        console.log('🔐 Restored auth token from AsyncStorage');
      }
    } catch (error) {
      console.log('ℹ️ No stored token found');
    }
  }

  async setAuthToken(token) {
    console.log('🔐 ApiService: Setting auth token:', token ? token.substring(0, 20) + '...' : 'NULL');
    this.token = token;
    
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      if (token) {
        // Also update AsyncStorage to ensure consistency
        await AsyncStorage.setItem('@auth_token', token);
      } else {
        await AsyncStorage.removeItem('@auth_token');
      }
    } catch (error) {
      console.error('Error saving token to AsyncStorage:', error);
    }
  }

  getAuthHeaders(skipContentType = false) {
    const headers = {};
    
    // Only set Content-Type for JSON requests, not for FormData
    if (!skipContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log('🔐 Using token:', this.token.substring(0, 20) + '...');
      
      // Decode JWT to see what emp_id is in the token (for debugging)
      try {
        const base64Url = this.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        console.log('🎟️ JWT Payload - emp_id:', payload.employeeId, 'email:', payload.email, 'username:', payload.username);
      } catch (e) {
        console.log('⚠️ Could not decode JWT for debugging');
      }
    } else {
      console.log('❌ No token available');
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(options.skipContentType),
        // Add cache-busting headers to prevent stale data
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...options.headers,
      },
    };

    try {
      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
      console.log(`🔐 Token present: ${this.token ? 'YES' : 'NO'}`);
      
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle authentication errors
      if (response.status === 401) {
        console.error('🚫 Authentication failed - token invalid or expired');
        // Clear invalid token
        this.token = null;
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.removeItem('@auth_token');
        } catch (error) {
          console.error('Error removing token from AsyncStorage:', error);
        }
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        console.error(`❌ API Error ${response.status}:`, data);
        throw new Error(data.error || data.message || `API request failed with status ${response.status}`);
      }

      console.log(`✅ API Response: ${response.status}`, data);
      return { data }; // Wrap response to match expected format
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error.message);
      
      // If it's a network error, provide more helpful message
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw error;
    }
  }

  // Generic HTTP methods
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    const config = {
      method: 'POST',
      ...options,
    };

    // Handle FormData differently - don't stringify it
    if (data instanceof FormData) {
      config.body = data;
      config.skipContentType = true; // Flag to skip Content-Type header
    } else {
      config.body = JSON.stringify(data);
    }

    return this.request(endpoint, config);
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

  // Authentication
  async loginWithQR(qrData) {
    return this.request('/auth/qr', {
      method: 'POST',
      body: JSON.stringify({ qr: qrData }),
    });
  }

  async getAccounts(phone) {
    return this.request(`/accounts/${encodeURIComponent(phone)}`);
  }

  async loginWithAccount(userId) {
    return this.request('/auth/account-login', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // IOU Management
  async getIOUs(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    const endpoint = queryString ? `/api/iou/list?${queryString}` : '/api/iou/list';
    
    console.log('📋 Making IOU API request with token:', this.token ? this.token.substring(0, 20) + '...' : 'NO TOKEN');
    console.log('🔗 Endpoint:', endpoint);
    
    return this.request(endpoint);
  }

  async createIOU(iouData) {
    return this.request('/api/iou', {
      method: 'POST',
      body: JSON.stringify(iouData),
    });
  }

  async saveDraftIOU(iouData) {
    return this.request('/api/iou', {
      method: 'POST',
      body: JSON.stringify({ ...iouData, isDraft: true }),
    });
  }

  async getIOUStats() {
    return this.request('/api/iou/stats');
  }

  async updateIOU(id, iouData) {
    return this.request(`/api/iou/${id}`, {
      method: 'PUT',
      body: JSON.stringify(iouData),
    });
  }

  async getIOUById(id) {
    return this.request(`/api/iou/${id}`);
  }

  async syncFailedIOUs() {
    return this.request('/api/iou/sync', {
      method: 'POST',
    });
  }

  // Proof Management
  async getProofs() {
    return this.request('/api/proof');
  }

  async createProof(proofData) {
    return this.request('/api/proof', {
      method: 'POST',
      body: JSON.stringify(proofData),
    });
  }

  async saveDraftProof(proofData) {
    return this.request('/proof', {
      method: 'POST',
      body: JSON.stringify({ ...proofData, isDraft: true }),
    });
  }

  // Settlement Management
  async getSettlements() {
    return this.request('/api/settlement');
  }

  async createSettlement(settlementData) {
    return this.request('/api/settlement', {
      method: 'POST',
      body: JSON.stringify(settlementData),
    });
  }

  // Mobile Tasks
  async getTasks() {
    return this.request('/tasks');
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id, taskData) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
