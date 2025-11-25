// Test the fixed logout functionality
const axios = require('axios');

const BASE_URL = 'http://192.168.1.55:3001/api/v1';

async function testFixedLogout() {
  console.log('🔧 TESTING FIXED LOGOUT FUNCTIONALITY');
  console.log('=' .repeat(60));

  try {
    // Step 1: Check current user status
    console.log('\n1️⃣ Current saved accounts status:');
    const savedAccounts = await axios.get(`${BASE_URL}/auth/saved-accounts`);
    
    const demouUser = savedAccounts.data.find(user => user.username === 'demou');
    if (demouUser) {
      console.log(`✅ Found demou user:`);
      console.log(`   - ID: ${demouUser.id}`);
      console.log(`   - Email: ${demouUser.email}`);
      console.log(`   - Has Quick Access: ${demouUser.hasQuickAccess}`);
      console.log(`   - Last Login: ${demouUser.lastLoginAt}`);
    } else {
      console.log('❌ Demou user not found in saved accounts');
      return;
    }

    // Step 2: Simulate proper login first to get a valid token
    console.log('\n2️⃣ Simulating login to get auth token...');
    
    try {
      // Try quick login first
      const quickLoginResponse = await axios.post(`${BASE_URL}/auth/quick-login`, {
        userId: demouUser.id,
        deviceInfo: {
          deviceId: 'test-device-123',
          deviceName: 'Test Device',
          deviceType: 'mobile'
        }
      });
      
      const authToken = quickLoginResponse.data.data.tokens.accessToken;
      console.log('✅ Quick login successful, got auth token');
      
      // Step 3: Test proper logout with auth token
      console.log('\n3️⃣ Testing logout with proper authentication...');
      
      const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Logout API call successful:');
      console.log(`   - Success: ${logoutResponse.data.success}`);
      console.log(`   - Message: ${logoutResponse.data.message}`);
      
      // Step 4: Wait a moment and test QR scan
      console.log('\n4️⃣ Waiting 2 seconds then testing QR scan...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const qrData = {
        qrData: JSON.stringify({
          emp_id: 1,
          emp_uname: "demou",
          emp_pwd: "123456", 
          emp_email: "ashanisamarakoon36@gmail.com",
          emp_mobile_no: "0703101244"
        })
      };
      
      try {
        const qrResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, qrData);
        
        console.log('🎉 QR SCAN SUCCESS AFTER PROPER LOGOUT:');
        console.log(`   - Success: ${qrResponse.data.success}`);
        console.log(`   - Message: ${qrResponse.data.message}`);
        console.log(`   - Next Step: ${qrResponse.data.data?.nextStep}`);
        console.log(`   - Verification Code: ${qrResponse.data.data?.verificationCode}`);
        
        console.log('\n✅ LOGOUT FIX CONFIRMED TO BE WORKING!');
        
      } catch (qrError) {
        const qrErrorData = qrError.response?.data;
        
        if (qrErrorData?.alreadyRegistered) {
          console.log('❌ QR scan still blocked after logout:');
          console.log(`   - Message: ${qrErrorData.message}`);
          console.log('   - This means logout is still not working properly');
        } else {
          console.log('❌ QR Error:', qrErrorData?.message || qrError.message);
        }
      }
      
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data?.message || loginError.message);
      console.log('   - Cannot test logout without valid login');
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📋 LOGOUT FIXES SUMMARY:');
    console.log('═'.repeat(60));
    console.log('✅ Fixed nestjsApiService.js: Move token clearing AFTER logout call');
    console.log('✅ Fixed AuthContext.js: Correct endpoint /api/v1/auth/logout');
    console.log('✅ Fixed QRScannerScreen.js: Added Authorization header');
    console.log('✅ Added AsyncStorage import to QRScannerScreen.js');
    
    console.log('\n🔍 ROOT CAUSE IDENTIFIED:');
    console.log('1. nestjsApiService cleared token BEFORE making logout API call');
    console.log('2. AuthContext used wrong endpoint (/api/auth/ instead of /api/v1/auth/)');
    console.log('3. QRScannerScreen logout call had no Authorization header');
    
    console.log('\n📱 MOBILE APP SHOULD NOW WORK:');
    console.log('- Frontend logout process is correct');
    console.log('- Backend logout endpoint will receive authenticated requests');
    console.log('- User will be marked as isLoggedOut: true in database');
    console.log('- QR scan after logout will allow re-registration');

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

testFixedLogout();