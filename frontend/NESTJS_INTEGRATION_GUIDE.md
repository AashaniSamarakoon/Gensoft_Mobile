# NestJS Backend Integration Guide

This guide explains how to integrate your React Native frontend with your NestJS backend running on `http://localhost:3000/api/v1`.

## 🚀 Setup Complete

The following components have been added and configured:

### 📦 Installed Packages
- `@reduxjs/toolkit` - Modern Redux toolkit
- `react-redux` - React Redux bindings  
- `redux-persist` - State persistence
- `axios` - HTTP client with interceptors
- `expo-secure-store` - Secure token storage
- `react-native-vector-icons` - Icons
- `react-native-elements` - UI components

### 🏗️ Architecture Components

#### 1. Redux Store (`src/store/`)
- **`index.js`** - Store configuration with persistence
- **`slices/authSlice.js`** - Authentication state management
- **`slices/erpSlice.js`** - ERP data management (IOUs, Proofs, etc.)
- **`slices/uiSlice.js`** - UI state management

#### 2. Enhanced API Service (`services/ApiService.js`)
- Axios-based HTTP client
- Automatic token refresh on 401 errors
- Request/response interceptors
- Secure token storage with Expo SecureStore
- Full CRUD operations for ERP entities

#### 3. Context Integration (`src/context/ReduxAuthContext.js`)
- Redux-powered authentication context
- Backward compatibility with existing AuthContext
- Automatic error handling and user feedback

#### 4. Custom Hooks (`src/hooks/useERP.js`)
- `useIOUs()` - IOU management
- `useProofs()` - Proof management  
- `useSettlements()` - Settlement management
- `useApprovals()` - Approval workflow
- `useDashboard()` - Dashboard statistics

#### 5. Configuration (`src/config/apiConfig.js`)
- Centralized API configuration
- Environment-specific settings
- Feature flags for gradual migration
- Error/success message constants

## 🔧 Configuration

### API Base URL
The API is configured to connect to your combined backend+middleware server on port 3000:

```javascript
// Development (default)
const API_BASE_URL = 'http://localhost:3000/api/v1';

// For physical device testing, change to your computer's IP:
// const API_BASE_URL = 'http://192.168.1.100:3000/api/v1';
```

**Important:** This setup works with your new combined server that includes both backend and middleware functionality on port 3000, replacing the previous separate servers on ports 4000 and 5000.

### Environment Configuration
Edit `src/config/apiConfig.js` to change settings:

```javascript
const API_CONFIG = {
  development: {
    // Combined backend+middleware server on port 3000
    BASE_URL: 'http://localhost:3000/api/v1',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
  },
  production: {
    // Your production combined server
    BASE_URL: 'https://your-production-server.com/api/v1',
    TIMEOUT: 15000,
    RETRY_ATTEMPTS: 2,
  },
};
```

You can also use the centralized backend configuration in `src/config/backendConfig.js` for consistent URL management across the app.

## 📱 Usage Examples

### Authentication with Redux

```javascript
import { useReduxAuth } from '../context/ReduxAuthContext';

const LoginScreen = () => {
  const { login, loading, error } = useReduxAuth();

  const handleLogin = async () => {
    const result = await login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (result.success) {
      // User is now authenticated and redirected
      console.log('Login successful!');
    }
  };

  return (
    // Your login UI
  );
};
```

### ERP Data Management

```javascript
import { useIOUs } from '../hooks/useERP';

const IOUListScreen = () => {
  const { ious, loading, fetchIOUs, createIOU } = useIOUs();

  useEffect(() => {
    fetchIOUs(); // Loads data from your NestJS backend
  }, []);

  const handleCreateIOU = async () => {
    const result = await createIOU({
      amount: 100.00,
      description: 'Office supplies',
      category: 'expenses'
    });
    
    if (result.success) {
      // IOU created and state updated automatically
    }
  };

  return (
    <View>
      {ious.map(iou => (
        <Text key={iou.id}>{iou.description}: ${iou.amount}</Text>
      ))}
    </View>
  );
};
```

### Using the Direct API Service

```javascript
import apiService from '../services/ApiService';

const SomeComponent = () => {
  const loadData = async () => {
    try {
      // Get IOUs with filters
      const ious = await apiService.getIOUs({ status: 'pending' });
      
      // Create new proof
      const proof = await apiService.createProof({
        amount: 250.00,
        description: 'Travel expenses',
        attachments: ['receipt.jpg']
      });
      
      console.log('Data loaded successfully');
    } catch (error) {
      console.error('API Error:', error.message);
    }
  };
};
```

## 🔄 Migration from Old API Service

### Step 1: Gradual Migration
The new system works alongside your existing `src/services/apiService.js`. You can migrate screens one by one.

### Step 2: Update Screens to Use Redux
Replace direct API calls with Redux hooks:

```javascript
// OLD WAY
import apiService from '../services/apiService';

const MyScreen = () => {
  const [ious, setIOUs] = useState([]);
  
  useEffect(() => {
    apiService.getIOUs().then(response => {
      setIOUs(response.data);
    });
  }, []);
};

// NEW WAY  
import { useIOUs } from '../hooks/useERP';

const MyScreen = () => {
  const { ious, loading, fetchIOUs } = useIOUs();
  
  useEffect(() => {
    fetchIOUs();
  }, []);
};
```

### Step 3: Update Authentication
Replace AuthContext with ReduxAuthContext:

```javascript
// OLD WAY
import { useAuth } from '../context/AuthContext';

// NEW WAY
import { useReduxAuth } from '../context/ReduxAuthContext';
```

## 🔒 Security Features

1. **Secure Token Storage**: Uses Expo SecureStore for sensitive data
2. **Automatic Token Refresh**: Handles 401 errors transparently
3. **Request Interceptors**: Adds authentication headers automatically
4. **Error Handling**: Comprehensive error handling with user feedback

## 📊 Expected NestJS Backend Structure

Your NestJS backend should provide these endpoints:

```
POST /api/v1/auth/login
POST /api/v1/auth/register  
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/auth/profile

GET  /api/v1/ious
POST /api/v1/ious
PUT  /api/v1/ious/:id
DELETE /api/v1/ious/:id

GET  /api/v1/proofs
POST /api/v1/proofs
PUT  /api/v1/proofs/:id

GET  /api/v1/settlements
POST /api/v1/settlements
PUT  /api/v1/settlements/:id

GET  /api/v1/approvals
POST /api/v1/approvals/:id/approve
POST /api/v1/approvals/:id/reject

GET  /api/v1/dashboard/stats
GET  /api/v1/health
```

## 📱 Testing the Integration

1. **Start your NestJS backend** on `http://localhost:3000`
2. **Start the React Native app**: `npm start`
3. **Test Authentication**: Try logging in with valid credentials
4. **Test Data Loading**: Navigate to screens that load ERP data
5. **Check Network Tab**: Verify API calls are made to your backend

## 🐛 Troubleshooting

### Network Connection Issues
- For Android Emulator: Use `http://10.0.2.2:3000/api/v1`
- For iOS Simulator: Use `http://localhost:3000/api/v1`
- For Physical Device: Use your computer's IP address

### Token Issues
Check SecureStore tokens:
```javascript
import * as SecureStore from 'expo-secure-store';

const checkTokens = async () => {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  console.log('Tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
};
```

### Redux DevTools
Enable Redux DevTools in development to monitor state changes:
- Install Redux DevTools browser extension
- State changes will be visible in the debugging tools

## 🚀 Next Steps

1. **Test the Sample Screen**: Check `src/screens/ReduxDashboardScreen.js`
2. **Migrate Existing Screens**: Gradually update screens to use Redux hooks
3. **Add Error Boundaries**: Implement error boundaries for better error handling
4. **Implement Offline Support**: Add offline data persistence (optional)
5. **Add Analytics**: Implement usage tracking (optional)

## 📞 Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your NestJS backend is running and accessible
3. Test API endpoints directly with a tool like Postman
4. Check network configuration for device-specific issues

The integration is now complete and ready for testing! 🎉