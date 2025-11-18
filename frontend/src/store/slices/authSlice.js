import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../../services/ApiService';

// Async thunks for authentication
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('🔐 Redux: Attempting login...');
      const result = await apiService.login(credentials);
      return result;
    } catch (error) {
      console.error('❌ Redux: Login failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('📝 Redux: Attempting registration...');
      const result = await apiService.register(userData);
      return result;
    } catch (error) {
      console.error('❌ Redux: Registration failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const loginWithQRAsync = createAsyncThunk(
  'auth/loginWithQR',
  async (qrData, { rejectWithValue }) => {
    try {
      console.log('📱 Redux: Attempting QR login...');
      const result = await apiService.loginWithQR(qrData);
      return result;
    } catch (error) {
      console.error('❌ Redux: QR login failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🚪 Redux: Logging out...');
      await apiService.logout();
      return { success: true };
    } catch (error) {
      console.error('❌ Redux: Logout error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const refreshTokenAsync = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux: Refreshing token...');
      const result = await apiService.refreshToken();
      if (result.success) {
        const userData = await apiService.getUserData();
        return { success: true, user: userData };
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('❌ Redux: Token refresh failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const loadStoredAuthAsync = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📱 Redux: Loading stored authentication...');
      const userData = await apiService.getUserData();
      
      if (userData) {
        // Try to refresh token to ensure it's valid
        const refreshResult = await apiService.refreshToken();
        if (refreshResult.success) {
          console.log('✅ Redux: Stored auth loaded and token refreshed');
          return { user: userData, isAuthenticated: true };
        } else {
          console.log('❌ Redux: Token refresh failed, clearing stored auth');
          await apiService.clearTokens();
          return { user: null, isAuthenticated: false };
        }
      } else {
        console.log('ℹ️ Redux: No stored authentication found');
        return { user: null, isAuthenticated: false };
      }
    } catch (error) {
      console.error('❌ Redux: Error loading stored auth:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
    setInitialized: (state) => {
      state.initialized = true;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        console.log('✅ Redux: Login successful');
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        console.log('❌ Redux: Login rejected');
      })
      
      // Register
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        console.log('✅ Redux: Registration successful');
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        console.log('❌ Redux: Registration rejected');
      })
      
      // QR Login
      .addCase(loginWithQRAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithQRAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        console.log('✅ Redux: QR login successful');
      })
      .addCase(loginWithQRAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        console.log('❌ Redux: QR login rejected');
      })
      
      // Logout
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        console.log('✅ Redux: Logout successful');
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Still clear auth on logout error
        state.user = null;
        state.isAuthenticated = false;
        console.log('❌ Redux: Logout rejected but clearing auth');
      })
      
      // Refresh Token
      .addCase(refreshTokenAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        console.log('✅ Redux: Token refresh successful');
      })
      .addCase(refreshTokenAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
        console.log('❌ Redux: Token refresh rejected');
      })
      
      // Load Stored Auth
      .addCase(loadStoredAuthAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadStoredAuthAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.initialized = true;
        state.error = null;
        console.log('✅ Redux: Stored auth loaded');
      })
      .addCase(loadStoredAuthAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.initialized = true;
        state.user = null;
        state.isAuthenticated = false;
        console.log('❌ Redux: Load stored auth rejected');
      });
  },
});

// Export actions
export const { clearError, clearAuth, setInitialized, updateUser } = authSlice.actions;

// Export selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthInitialized = (state) => state.auth.initialized;

// Export reducer
export default authSlice.reducer;