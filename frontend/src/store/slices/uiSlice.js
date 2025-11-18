import { createSlice } from '@reduxjs/toolkit';

// Initial state for UI management
const initialState = {
  // Navigation
  currentScreen: 'Dashboard',
  navigationHistory: [],
  
  // Loading states
  globalLoading: false,
  screenLoading: false,
  
  // Modals and overlays
  activeModal: null,
  modalData: null,
  showSidebar: false,
  
  // Notifications
  notifications: [],
  
  // Theme and UI preferences
  theme: 'light', // 'light' | 'dark'
  language: 'en',
  
  // Network status
  isOnline: true,
  lastSync: null,
  
  // Search and filters
  searchQuery: '',
  activeFilters: {},
  
  // Forms
  formDirty: false,
  formErrors: {},
  
  // Scanner/Camera
  scannerActive: false,
  cameraPermission: null,
  
  // Refresh control
  refreshing: false,
  
  // Bottom sheet / action sheet
  bottomSheetVisible: false,
  bottomSheetContent: null,
  
  // Snackbar/Toast messages
  snackbar: {
    visible: false,
    message: '',
    type: 'info', // 'info' | 'success' | 'warning' | 'error'
    duration: 3000,
  },
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Navigation
    setCurrentScreen: (state, action) => {
      state.navigationHistory.push(state.currentScreen);
      state.currentScreen = action.payload;
    },
    
    goBack: (state) => {
      if (state.navigationHistory.length > 0) {
        state.currentScreen = state.navigationHistory.pop();
      }
    },
    
    resetNavigation: (state) => {
      state.currentScreen = 'Dashboard';
      state.navigationHistory = [];
    },
    
    // Loading states
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    
    setScreenLoading: (state, action) => {
      state.screenLoading = action.payload;
    },
    
    // Modals
    showModal: (state, action) => {
      state.activeModal = action.payload.type;
      state.modalData = action.payload.data || null;
    },
    
    hideModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
    
    // Sidebar
    toggleSidebar: (state) => {
      state.showSidebar = !state.showSidebar;
    },
    
    setSidebar: (state, action) => {
      state.showSidebar = action.payload;
    },
    
    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    markNotificationRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Language
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    
    // Network status
    setNetworkStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    
    setLastSync: (state, action) => {
      state.lastSync = action.payload || new Date().toISOString();
    },
    
    // Search and filters
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      if (value === null || value === undefined || value === '') {
        delete state.activeFilters[key];
      } else {
        state.activeFilters[key] = value;
      }
    },
    
    clearFilters: (state) => {
      state.activeFilters = {};
    },
    
    // Forms
    setFormDirty: (state, action) => {
      state.formDirty = action.payload;
    },
    
    setFormError: (state, action) => {
      const { field, error } = action.payload;
      if (error) {
        state.formErrors[field] = error;
      } else {
        delete state.formErrors[field];
      }
    },
    
    clearFormErrors: (state) => {
      state.formErrors = {};
    },
    
    // Scanner
    setScannerActive: (state, action) => {
      state.scannerActive = action.payload;
    },
    
    setCameraPermission: (state, action) => {
      state.cameraPermission = action.payload;
    },
    
    // Refresh control
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    },
    
    // Bottom sheet
    showBottomSheet: (state, action) => {
      state.bottomSheetVisible = true;
      state.bottomSheetContent = action.payload;
    },
    
    hideBottomSheet: (state) => {
      state.bottomSheetVisible = false;
      state.bottomSheetContent = null;
    },
    
    // Snackbar
    showSnackbar: (state, action) => {
      state.snackbar = {
        visible: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 3000,
      };
    },
    
    hideSnackbar: (state) => {
      state.snackbar = {
        ...state.snackbar,
        visible: false,
      };
    },
    
    // Reset UI state (useful on logout)
    resetUI: (state) => {
      return {
        ...initialState,
        theme: state.theme, // Preserve theme preference
        language: state.language, // Preserve language preference
      };
    },
  },
});

// Export actions
export const {
  setCurrentScreen,
  goBack,
  resetNavigation,
  setGlobalLoading,
  setScreenLoading,
  showModal,
  hideModal,
  toggleSidebar,
  setSidebar,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  setTheme,
  toggleTheme,
  setLanguage,
  setNetworkStatus,
  setLastSync,
  setSearchQuery,
  setFilter,
  clearFilters,
  setFormDirty,
  setFormError,
  clearFormErrors,
  setScannerActive,
  setCameraPermission,
  setRefreshing,
  showBottomSheet,
  hideBottomSheet,
  showSnackbar,
  hideSnackbar,
  resetUI,
} = uiSlice.actions;

// Export selectors
export const selectCurrentScreen = (state) => state.ui.currentScreen;
export const selectNavigationHistory = (state) => state.ui.navigationHistory;
export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectScreenLoading = (state) => state.ui.screenLoading;

export const selectActiveModal = (state) => state.ui.activeModal;
export const selectModalData = (state) => state.ui.modalData;
export const selectShowSidebar = (state) => state.ui.showSidebar;

export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadNotifications = (state) => 
  state.ui.notifications.filter(n => !n.read);

export const selectTheme = (state) => state.ui.theme;
export const selectLanguage = (state) => state.ui.language;

export const selectNetworkStatus = (state) => state.ui.isOnline;
export const selectLastSync = (state) => state.ui.lastSync;

export const selectSearchQuery = (state) => state.ui.searchQuery;
export const selectActiveFilters = (state) => state.ui.activeFilters;

export const selectFormDirty = (state) => state.ui.formDirty;
export const selectFormErrors = (state) => state.ui.formErrors;

export const selectScannerActive = (state) => state.ui.scannerActive;
export const selectCameraPermission = (state) => state.ui.cameraPermission;

export const selectRefreshing = (state) => state.ui.refreshing;

export const selectBottomSheetVisible = (state) => state.ui.bottomSheetVisible;
export const selectBottomSheetContent = (state) => state.ui.bottomSheetContent;

export const selectSnackbar = (state) => state.ui.snackbar;

// Export reducer
export default uiSlice.reducer;