import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';
import nestjsApiService from '../../services/nestjsApiService';
import LocalStorageService from '../services/LocalStorageService';
import { getBaseURLRaw } from '../config/apiConfig.js';
import savedAccountsApi from '../services/SavedAccountsApiService';

// Backend URL for combined backend+middleware server - CENTRALIZED CONFIG

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  // Initialize authentication on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔄 Initializing authentication...');
      
      // First, validate storage integrity and cleanup corrupted data
      try {
        console.log('🔍 Checking AsyncStorage integrity...');
        const isValid = await LocalStorageService.validateStorageIntegrity();
        
        if (!isValid) {
          console.warn('⚠️ Storage integrity issues detected, running cleanup...');
          await LocalStorageService.cleanupCorruptedData();
        }
      } catch (error) {
        console.error('❌ Storage validation error:', error);
        // Run cleanup anyway to be safe
        await LocalStorageService.cleanupCorruptedData();
      }
      
      // Load saved accounts list
      try {
        const savedAccounts = await LocalStorageService.getItem('@saved_accounts');
        if (savedAccounts && Array.isArray(savedAccounts)) {
          setAccounts(savedAccounts);
          console.log('📋 Loaded', savedAccounts.length, 'saved accounts');
        }
      } catch (error) {
        console.log('ℹ️ No saved accounts found or corrupted data cleaned');
      }
      
      // Just finish loading - don't auto-authenticate
      // Let the normal flow (splash -> onboarding -> welcome -> login) handle authentication
      console.log('ℹ️ Auth initialization complete - letting normal flow handle authentication');
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  // QR login is now handled directly in QRScannerScreen
  // This method is kept for backward compatibility but should not be used
  const loginWithQR = async (qrData) => {
    console.warn('⚠️ loginWithQR is deprecated - QR authentication should be handled by the QRScannerScreen directly');
    return { success: false, error: 'Use QRScannerScreen for QR authentication' };
  };

  const selectAccount = async (accountId) => {
    try {
      setLoading(true);
      console.log('👤 Selecting account:', accountId);
      
      // Find the account in the accounts list
      const account = accounts.find(acc => {
        const accId = acc.user?.id || acc.id;
        return accId === accountId;
      });
      
      if (!account) {
        throw new Error('Account not found');
      }
      
      console.log('🔍 Found account:', account.user?.username || account.username);
      
      // Try quick login first
      const quickLoginResult = await quickLogin(account);
      
      if (quickLoginResult.success) {
        console.log('✅ Quick login successful');
        return { success: true };
      } else if (quickLoginResult.needsPassword) {
        console.log('🔐 Password required:', quickLoginResult.reason);
        // Instead of showing error, navigate to login screen with account context
        return { 
          success: false, 
          needsPassword: true, 
          reason: quickLoginResult.reason,
          account: account,
          navigateToLogin: true 
        };
      } else {
        throw new Error(quickLoginResult.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Account selection error:', error);
      
      // Check if it's a re-authentication error
      if (error.message && error.message.includes('Re-authentication required')) {
        console.log('🔐 Re-authentication required - navigating to login screen');
        const account = accounts.find(acc => {
          const accId = acc.user?.id || acc.id;
          return accId === accountId;
        });
        return { 
          success: false, 
          needsPassword: true, 
          reason: 'Session expired, please enter your password',
          account: account,
          navigateToLogin: true 
        };
      }
      
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log('🚪 Logging out current user only...');
      
      // Get current user info before clearing
      const currentUser = user;
      const currentUserId = currentUser?.id;
      const currentUserEmail = currentUser?.email;
      const currentEmployeeId = currentUser?.employeeId;
      
      console.log(`🗑️ Removing user ${currentUser?.username} (${currentUserEmail}) from saved accounts`);
      console.log(`🔍 Current userId: ${currentUserId}`);
      console.log(`📋 Accounts before removal:`, accounts.length);

      // Call backend logout to reset user's database state
      if (currentUser) {
        try {
          console.log('Calling backend logout API...');
          const authToken = await LocalStorageService.getItem('@auth_token');
          const logoutResponse = await fetch(`${getBaseURLRaw()}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });

          const logoutResult = await logoutResponse.json();
          
          if (logoutResponse.ok && logoutResult.success) {
            console.log('✅ Backend logout successful - user can now re-register with QR code');
          } else {
            console.warn('⚠️ Backend logout failed, but continuing with frontend logout:', logoutResult.error);
          }
        } catch (backendError) {
          console.warn('⚠️ Backend logout request failed, but continuing with frontend logout:', backendError.message);
        }
      }
      
      // Remove ONLY the current user from saved accounts
      if (currentUserId) {
        const updatedAccounts = accounts.filter(account => {
          const accountUserId = account.user?.id || account.id;
          console.log(`🔎 Checking account ${account.user?.username} - ID: ${accountUserId} vs ${currentUserId}`);
          return accountUserId !== currentUserId;
        });
        
        // Update saved accounts (remove current user)
        setAccounts(updatedAccounts);
        await LocalStorageService.setItem('@saved_accounts', updatedAccounts);
        
        console.log(`📝 Updated accounts list - removed current user, ${updatedAccounts.length} accounts remaining`);
        console.log(`💾 Saved to localStorage with key: @saved_accounts`);
        
        // Verify what was actually saved
        const verifyAccounts = await LocalStorageService.getItem('@saved_accounts');
        console.log(`✅ Verification - localStorage now contains:`, verifyAccounts?.length || 0, 'accounts');
      }
      
      // Clear current session data only
      await LocalStorageService.removeItem('@auth_token');
      await LocalStorageService.removeItem('@user_data');
      await LocalStorageService.removeItem('@company_data');
      await LocalStorageService.removeItem('@login_session');
      
      // Clear current user's cached data
      await LocalStorageService.removeItem('@dashboard_cache');
      await LocalStorageService.removeItem('@iou_cache');
      await LocalStorageService.removeItem('@proof_cache');
      
      // Clear API service token
      apiService.setAuthToken(null);
      
      // Reset current session state (but keep other accounts)
      setUser(null);
      setCompany(null);
      setIsAuthenticated(false);
      setHasLoggedOut(true); // Set flag to indicate user has logged out
      
      console.log('✅ User logged out - account removed from saved list (must scan QR to re-register)');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset logout flag when user starts new session
  const clearLogoutFlag = () => {
    setHasLoggedOut(false);
  };

  // Smart login functions with enhanced session validation
  const checkLoginSecurity = (lastLogin) => {
    if (!lastLogin) return { needsPassword: true, reason: 'No previous login found', type: 'missing_session' };

    const lastLoginDate = new Date(lastLogin);
    const now = new Date();
    const daysSinceLogin = (now - lastLoginDate) / (1000 * 60 * 60 * 24);
    const hoursSinceLogin = (now - lastLoginDate) / (1000 * 60 * 60);

    // Security conditions with enhanced messaging
    if (daysSinceLogin >= 7) {
      return { 
        needsPassword: true, 
        reason: 'Last login was more than 7 days ago', 
        type: 'extended_absence',
        days: Math.floor(daysSinceLogin)
      };
    }
    
    if (daysSinceLogin >= 3) {
      return { 
        needsPassword: true, 
        reason: 'Last login was more than 3 days ago', 
        type: 'session_expired',
        days: Math.floor(daysSinceLogin)
      };
    }
    
    if (hoursSinceLogin >= 24) {
      return { 
        needsPassword: true, 
        reason: 'Last login was more than 24 hours ago', 
        type: 'daily_timeout',
        hours: Math.floor(hoursSinceLogin)
      };
    }

    // If login was recent (within 24 hours), allow quick access
    return { 
      needsPassword: false, 
      reason: 'Recent login within security window', 
      type: 'valid_session',
      hours: Math.floor(hoursSinceLogin)
    };
  };

  // New function to validate current session for dashboard access
  const validateDashboardAccess = async () => {
    try {
      if (!user) {
        return { valid: false, reason: 'No authenticated user found' };
      }

      const sessionData = await LocalStorageService.getItem(`@session_${user.id}`);
      
      if (!sessionData || !sessionData.loginTime) {
        return { valid: false, reason: 'No login session found' };
      }

      const securityCheck = checkLoginSecurity(sessionData.loginTime);
      
      if (securityCheck.needsPassword) {
        return {
          valid: false,
          reason: securityCheck.reason,
          type: securityCheck.type,
          lastLogin: sessionData.loginTime
        };
      }

      return { valid: true, reason: 'Session is valid' };
    } catch (error) {
      console.log('Dashboard access validation error:', error);
      return { valid: false, reason: 'Session validation failed' };
    }
  };

  const quickLogin = async (account) => {
    try {
      setLoading(true);
      console.log('⚡ Attempting quick login for:', account.user?.username || account.username);

      // Get stored session info for this account
      const storedSession = await LocalStorageService.getItem(`@session_${account.user?.id || account.id}`);
      
      if (!storedSession) {
        console.log('📝 No stored session found, password required for first-time quick login setup');
        return { 
          success: false, 
          needsPassword: true, 
          reason: 'Please enter password to enable quick access for future logins',
          account: account 
        };
      }

      // Check security conditions
      const securityCheck = checkLoginSecurity(storedSession.loginTime);
      
      if (securityCheck.needsPassword) {
        console.log('🔒 Password required:', securityCheck.reason);
        return { 
          success: false, 
          needsPassword: true, 
          reason: securityCheck.reason,
          account: account 
        };
      }

      // Perform quick login without password
      console.log('✅ Security check passed:', securityCheck.reason);
      
      // Validate token is still valid by making a quick API call
      const accountUser = account.user || account;
      const token = storedSession.token;
      
      if (!token) {
        throw new Error('No token in stored session');
      }

      // Set token temporarily to test validity
      apiService.setAuthToken(token);
      
      // Try quick login using nestjsApiService
      try {
        const quickLoginData = await nestjsApiService.quickLogin(accountUser.id, {
          deviceId: 'mobile_app',
          platform: 'react-native',
          version: '1.0.0'
        });

        if (!quickLoginData.success) {
          // Check if it's a specific error that requires password login
          if (quickLoginData.message && (
            quickLoginData.message.includes('not available') ||
            quickLoginData.message.includes('expired') ||
            quickLoginData.message.includes('not found')
          )) {
            console.log('🔐 Quick login expired, password required');
            return { 
              success: false, 
              needsPassword: true, 
              reason: 'Session expired, please enter password',
              account: account 
            };
          }
          throw new Error('Quick login not available: ' + quickLoginData.message);
        }

        // Quick login successful, use new tokens
        const newToken = quickLoginData.data.tokens.accessToken;
        const userInfo = quickLoginData.data.user;
        const sessionInfo = quickLoginData.data.session;

        // Clear API service token first
        await apiService.setAuthToken(null);
        
        // Store new session data directly (no need to call switchUser for same user)
        await LocalStorageService.setItem('@auth_token', newToken);
        await LocalStorageService.setItem('@user_data', userInfo);
        await LocalStorageService.setItem('@login_session', {
          token: newToken,
          refreshToken: quickLoginData.data.tokens.refreshToken,
          loginTime: new Date().toISOString(),
          loginMethod: 'QUICK_LOGIN',
          sessionId: sessionInfo.sessionId,
          expiresAt: sessionInfo.expiresAt
        });

        // Set token for ApiService before setting authenticated state
        await apiService.setAuthToken(newToken);
        
        // Also save tokens for nestjsApiService
        await nestjsApiService.saveTokens(quickLoginData.data.tokens, userInfo);

        // Update stored session with new login time
        await LocalStorageService.setItem(`@session_${userInfo.id}`, {
          token: newToken,
          refreshToken: quickLoginData.data.tokens.refreshToken,
          loginTime: new Date().toISOString(),
          sessionId: sessionInfo.sessionId,
          expiresAt: sessionInfo.expiresAt
        });

        setUser(userInfo);
        setIsAuthenticated(true);
        setHasLoggedOut(false);

        console.log('⚡ Quick login successful for:', userInfo.username);
        return { success: true, method: 'quick' };

      } catch (tokenError) {
        console.log('🔒 Token invalid, password required:', tokenError.message);
        return { 
          success: false, 
          needsPassword: true, 
          reason: 'Session expired, please enter password',
          account: account 
        };
      }

    } catch (error) {
      console.error('❌ Quick login error:', error);
      
      // Check if it's a JSON parsing error or storage corruption
      if (error.message && error.message.includes('JSON')) {
        console.warn('🧹 Storage corruption detected, cleaning up...');
        try {
          await LocalStorageService.cleanupCorruptedData();
          await LocalStorageService.removeItem(`@session_${account.user?.id || account.id}`);
        } catch (cleanupError) {
          console.error('Cleanup failed:', cleanupError);
        }
      }
      
      return { 
        success: false, 
        needsPassword: true, 
        reason: error.message && error.message.includes('JSON') ? 
          'Data corruption detected - please login with password to restore access' :
          'Session expired, please enter password',
        account: account 
      };
    } finally {
      setLoading(false);
    }
  };

  const saveAccountSession = async (loginData) => {
    try {
      const sessionData = {
        token: loginData.token,
        userId: loginData.user.id,
        username: loginData.user.username,
        email: loginData.user.email,
        loginTime: new Date().toISOString(),
        loginMethod: 'PASSWORD_LOGIN'
      };

      // Save session for quick access
      await LocalStorageService.setItem(`@session_${loginData.user.id}`, sessionData);
      console.log('💾 Saved session for quick access:', loginData.user.username);
      
    } catch (error) {
      console.error('❌ Failed to save session:', error);
    }
  };

  // Switch user function - carefully manages state transitions to prevent app refresh
  const switchUser = async () => {
    console.log('🔄 Switching users - clearing current session...');
    
    // Store the current accounts list before clearing
    const currentAccounts = accounts;
    
    // Clear current user-specific storage
    await LocalStorageService.removeItem('@auth_token');
    await LocalStorageService.removeItem('@user_data');
    await LocalStorageService.removeItem('@company_data');
    await LocalStorageService.removeItem('@login_session');
    
    // Clear cached data
    await LocalStorageService.removeItem('@dashboard_cache');
    await LocalStorageService.removeItem('@iou_cache');
    await LocalStorageService.removeItem('@proof_cache');
    await LocalStorageService.removeItem('@settlement_cache');
    
    // Clear API service token
    await apiService.setAuthToken(null);
    
    // Reset current session state carefully
    setUser(null);
    setCompany(null);
    setIsAuthenticated(false);
    // Preserve accounts list
    setAccounts(currentAccounts);
    
    console.log('✅ User switch complete - ready for new login');
  };

  const clearAccounts = async () => {
    // Clear local storage
    setAccounts([]);
    await LocalStorageService.removeItem('@saved_accounts');
    
    // Also clear from database
    try {
      await savedAccountsApi.clearDeviceAccounts();
      console.log('🗑️ Cleared all saved accounts (local + database)');
    } catch (dbError) {
      console.log('🗑️ Cleared local accounts (database clear failed):', dbError);
    }
  };

  // Remove specific account by username or ID
  const removeSpecificAccount = async (accountToRemove) => {
    try {
      const accountId = accountToRemove.user?.id || accountToRemove.id;
      const accountUsername = accountToRemove.user?.username || accountToRemove.username;
      
      console.log('🗑️ Removing account:', accountUsername, 'ID:', accountId);
      
      // Filter out the account to remove (LOCAL STORAGE)
      const updatedAccounts = accounts.filter(acc => {
        const accId = acc.user?.id || acc.id;
        const accUsername = acc.user?.username || acc.username;
        return accId !== accountId && accUsername !== accountUsername;
      });
      
      // Update state and localStorage
      setAccounts(updatedAccounts);
      await LocalStorageService.setItem('@saved_accounts', updatedAccounts);
      
      // Also remove the session data for this account
      await LocalStorageService.removeItem(`@session_${accountId}`);
      
      // ALSO REMOVE FROM DATABASE if it's the current user
      if (user && user.id === accountId) {
        try {
          await savedAccountsApi.removeAccountFromDatabase();
          console.log('✅ Account also removed from database');
        } catch (dbError) {
          console.log('⚠️ Failed to remove from database (continuing with local removal):', dbError);
        }
      }
      
      console.log('✅ Account removed successfully. Remaining accounts:', updatedAccounts.length);
      return true;
    } catch (error) {
      console.log('❌ Error removing account:', error);
      return false;
    }
  };

  // Debug function to show current accounts
  const debugAccounts = () => {
    console.log('📋 Current saved accounts:', accounts.length);
    accounts.forEach((acc, index) => {
      console.log(`${index + 1}. ${acc.user?.username} (${acc.user?.email})`);
    });
  };

  // Force reload accounts from localStorage
  const reloadAccounts = async () => {
    try {
      const savedAccounts = await LocalStorageService.getItem('@saved_accounts');
      if (savedAccounts && Array.isArray(savedAccounts)) {
        setAccounts(savedAccounts);
        console.log('🔄 Reloaded', savedAccounts.length, 'accounts from localStorage');
      } else {
        setAccounts([]);
        console.log('🔄 No saved accounts found in localStorage');
      }
    } catch (error) {
      console.error('❌ Error reloading accounts:', error);
      setAccounts([]);
    }
  };

  // Regular login function for username/password
  const login = async (loginResponse) => {
    try {
      setLoading(true);
      console.log('🔐 Processing login response...');
      
      // FIRST: Clear any existing user data to prevent data mixing
      await switchUser();
      
      if (loginResponse.token && loginResponse.user) {
        // Store NEW user authentication data
        await LocalStorageService.setItem('@auth_token', loginResponse.token);
        await LocalStorageService.setItem('@user_data', loginResponse.user);
        await LocalStorageService.setItem('@login_session', {
          userId: loginResponse.user.id,
          username: loginResponse.user.username,
          email: loginResponse.user.email,
          loginTime: new Date().toISOString()
        });
        
        // Set API token for all future requests
        await apiService.setAuthToken(loginResponse.token);
        
        // Update state with NEW user
        setUser(loginResponse.user);
        setIsAuthenticated(true);
        setHasLoggedOut(false); // Clear logout flag on successful login
        
        // Save session for future quick access
        await saveAccountSession(loginResponse);
        
        // Add to accounts list if not already present
        const existingAccount = accounts.find(acc => {
          const accUserId = acc.user?.id || acc.id;
          return accUserId === loginResponse.user.id;
        });
        if (!existingAccount) {
          const newAccounts = [...accounts, loginResponse];
          setAccounts(newAccounts);
          await LocalStorageService.setItem('@saved_accounts', newAccounts);
          console.log('➕ Added new account to switcher:', loginResponse.user.username);
        } else {
          console.log('👤 Account already in switcher:', loginResponse.user.username);
        }
        
        console.log('✅ Login successful for NEW user:', loginResponse.user.username);
        console.log('🔒 User session established with token validation');
        return { success: true };
      } else {
        throw new Error('Invalid login response - missing token or user data');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Account switching without full logout - prevents app refresh by managing state carefully
  const switchToAccount = async (accountData) => {
    try {
      setLoading(true);
      console.log('🔄 Switching to account:', accountData.user?.username || accountData.username);
      
      // Store current accounts to preserve them
      const currentAccounts = accounts;
      
      // First update isAuthenticated to false to trigger navigation to AuthStack
      setIsAuthenticated(false);
      
      // Small delay to ensure navigation has started
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Clear current user data but keep accounts list
      await LocalStorageService.removeItem('@auth_token');
      await LocalStorageService.removeItem('@user_data');
      await LocalStorageService.removeItem('@company_data');
      await LocalStorageService.removeItem('@login_session');
      
      // Clear cached data
      await LocalStorageService.removeItem('@dashboard_cache');
      await LocalStorageService.removeItem('@iou_cache');
      await LocalStorageService.removeItem('@proof_cache');
      await LocalStorageService.removeItem('@settlement_cache');
      
      // Set new user data
      await LocalStorageService.setItem('@auth_token', accountData.token);
      await LocalStorageService.setItem('@user_data', accountData.user);
      await LocalStorageService.setItem('@company_data', accountData.company);
      await LocalStorageService.setItem('@login_session', {
        userId: accountData.user.id,
        username: accountData.user.username,
        email: accountData.user.email,
        loginTime: new Date().toISOString()
      });
      
      // Update API service token
      await apiService.setAuthToken(accountData.token);
      
      // Update context state with new user
      setUser(accountData.user);
      setCompany(accountData.company);
      setAccounts(currentAccounts); // Preserve accounts
      setHasLoggedOut(false);
      
      // Finally, authenticate to trigger navigation to MainStack
      setIsAuthenticated(true);
      
      console.log('✅ Account switched successfully to:', accountData.user?.username || accountData.username);
      return true;
    } catch (error) {
      console.error('❌ Account switch error:', error);
      // Restore authentication state on error
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (loginData) => {
    try {
      console.log('➕ Adding new account:', loginData.user.username);
      
      // Add to accounts list if not already present
      const existingAccount = accounts.find(acc => {
        const accUserId = acc.user?.id || acc.id;
        return accUserId === loginData.user.id;
      });
      
      if (!existingAccount) {
        const newAccounts = [...accounts, loginData];
        setAccounts(newAccounts);
        await LocalStorageService.setItem('@saved_accounts', newAccounts);
        console.log('💾 Account saved for future quick login');
      } else {
        console.log('👤 Account already exists in saved list');
      }
      
      // Switch to the new account
      await switchToAccount(loginData);
      return true;
    } catch (error) {
      console.error('❌ Add account error:', error);
      return false;
    }
  };

  const value = {
    // State
    user,
    company,
    accounts,
    loading,
    isAuthenticated,
    hasLoggedOut,
    
    // Methods
    login,
    loginWithQR,
    selectAccount,
    logout,
    switchUser,
    switchToAccount,
    addAccount,
    clearAccounts,
    debugAccounts,
    reloadAccounts,
    initializeAuth,
    clearLogoutFlag,
    quickLogin,
    checkLoginSecurity,
    saveAccountSession,
    validateDashboardAccess,
    removeSpecificAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
