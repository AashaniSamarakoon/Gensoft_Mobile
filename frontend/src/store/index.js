import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slice reducers
import authSlice from './slices/authSlice';
import erpSlice from './slices/erpSlice';
import uiSlice from './slices/uiSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state
};

// Auth persist configuration (more specific)
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  blacklist: ['loading'], // Don't persist loading states
};

// Combine reducers
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authSlice),
  erp: erpSlice,
  ui: uiSlice,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register'],
      },
    }),
  devTools: __DEV__, // Enable Redux DevTools in development
});

export const persistor = persistStore(store);

// Export types for TypeScript (if you decide to migrate later)
// Commented out since this is a JavaScript file - uncomment if you migrate to TypeScript
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;