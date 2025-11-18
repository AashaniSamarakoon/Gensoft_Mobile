# Backend Configuration Update Summary

## ✅ **Configuration Updated for Port 3000 Combined Server**

Your React Native frontend has been successfully reconfigured to work with your new combined backend+middleware server running on **port 3000** instead of the previous separate servers on ports 4000 and 5000.

## 📝 **Files Updated**

### 1. Main API Services
- **`src/services/apiService.js`** - Updated to use `http://localhost:3000`
- **`services/ApiService.js`** - Uses centralized config pointing to port 3000

### 2. Authentication Context
- **`src/context/AuthContext.js`** - Updated backend URL to port 3000

### 3. Screen Components
All these screens now point to your combined server:
- **`src/screens/VerificationScreen.js`**
- **`src/screens/SetPasswordScreen.js`** 
- **`src/screens/QRScannerScreen.js`** (3 different API calls updated)
- **`src/screens/LoginScreen.js`**

### 4. Components
- **`src/components/AccountSwitcher.js`** - Updated backend URL

### 5. Configuration Files
- **`src/config/apiConfig.js`** - Updated for combined server setup
- **`src/config/backendConfig.js`** - New centralized configuration utility

## 🔧 **Current Configuration**

```javascript
// All services now point to:
const BACKEND_URL = 'http://localhost:3000'

// API endpoints use:
const API_BASE_URL = 'http://localhost:3000/api/v1'
```

## 🌐 **Network Setup**

### For Emulator/Simulator:
- **URL:** `http://localhost:3000`
- **Status:** ✅ Ready to use

### For Physical Device Testing:
Update any of these files to use your computer's IP address:
```javascript
// Change localhost to your actual IP address
const BACKEND_URL = 'http://192.168.1.XXX:3000';
```

## 🎯 **Expected Server Endpoints**

Your combined server on port 3000 should now handle:

### Authentication Endpoints:
- `POST http://localhost:3000/api/auth/login`
- `POST http://localhost:3000/api/auth/qr-scan` 
- `POST http://localhost:3000/api/auth/logout`
- `POST http://localhost:3000/api/auth/register`
- `POST http://localhost:3000/api/auth/refresh`

### ERP Data Endpoints:
- `GET http://localhost:3000/api/iou/list`
- `POST http://localhost:3000/api/iou`
- `GET http://localhost:3000/api/proof`
- `GET http://localhost:3000/api/settlement`

### Legacy Mobile Backend Endpoints:
- `GET http://localhost:3000/api/accounts/:phone`
- `POST http://localhost:3000/api/auth/account-login`
- `POST http://localhost:3000/api/auth/qr-image-scan`

## 🔄 **Migration Benefits**

1. **Unified Server:** Single server handles all requests
2. **Simplified Configuration:** One port to manage (3000)
3. **Better Performance:** No cross-server communication delays
4. **Easier Deployment:** Single server deployment
5. **Consistent APIs:** Unified API structure

## 🧪 **Testing the New Configuration**

1. **Start your combined server** on port 3000
2. **Use the ApiTestScreen** (`src/screens/ApiTestScreen.js`) to verify connectivity:
   ```bash
   # Should now test against localhost:3000
   ```

3. **Test authentication flow:**
   - QR scanning should work with combined server
   - Login should authenticate against port 3000
   - Data loading should fetch from port 3000

## 🚨 **Important Notes**

- **Old Configuration Removed:** No more references to ports 4000 or 5000
- **Environment Variable:** Still respects `REACT_APP_MOBILE_BACKEND_URL` if set
- **Backward Compatibility:** All existing functionality preserved
- **Centralized Config:** New `backendConfig.js` for consistent URL management

## 📱 **Device Testing Setup**

For testing on physical devices, update the environment variable or modify the configuration:

```bash
# Option 1: Set environment variable
export REACT_APP_MOBILE_BACKEND_URL=http://192.168.1.100:3000

# Option 2: Update src/config/backendConfig.js
export const DeviceConfig = {
  PHYSICAL_DEVICE_URL: 'http://192.168.1.100:3000',
};
```

## ✅ **Next Steps**

1. **Start your combined server** on port 3000
2. **Test the mobile app** with the new configuration
3. **Verify all authentication flows** work correctly
4. **Test ERP data operations** (IOUs, Proofs, etc.)
5. **Update any deployment scripts** to use port 3000

Your React Native frontend is now fully configured to work with your combined backend+middleware server on port 3000! 🚀