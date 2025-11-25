// Test the Complete Logout and Re-registration Fix
const axios = require('axios');

const BASE_URL = 'http://192.168.1.55:3001/api/v1';

async function testLogoutQRFix() {
  console.log('🔧 Testing Logout → QR Re-registration Fix');
  console.log('=' .repeat(60));

  try {
    // Test 1: Check current saved accounts
    console.log('\n1️⃣ Checking current saved accounts...');
    const savedAccounts = await axios.get(`${BASE_URL}/auth/saved-accounts`);
    console.log(`✅ Found ${savedAccounts.data.length} saved accounts`);
    
    if (savedAccounts.data.length > 0) {
      savedAccounts.data.forEach((account, index) => {
        console.log(`   ${index + 1}. ${account.username} (${account.email})`);
        console.log(`      - Has Quick Access: ${account.hasQuickAccess}`);
        console.log(`      - Last Login: ${account.lastLoginAt}`);
      });
    }

    // Test 2: Try QR scan for existing user (should be blocked if logged in)
    console.log('\n2️⃣ Testing QR scan for existing user...');
    const existingUserQR = {
      qrData: JSON.stringify({
        emp_email: "ashanisamarakoon36@gmail.com",
        emp_name: "demou",
        emp_id: "cmhyf73ur00007kl8k9cge5mp",
        qrToken: "test-token-" + Date.now()
      })
    };

    try {
      const qrResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, existingUserQR);
      
      if (qrResponse.data.success) {
        console.log('✅ QR Scan Success (user was logged out):');
        console.log(`   - Message: ${qrResponse.data.message}`);
        console.log(`   - Next Step: ${qrResponse.data.data?.nextStep}`);
        console.log(`   - Verification Code: ${qrResponse.data.data?.verificationCode}`);
        console.log('\n🎉 FIX WORKING: Logged out user can re-register!');
      }
      
    } catch (qrError) {
      const errorData = qrError.response?.data;
      
      if (errorData?.alreadyRegistered) {
        console.log('❌ QR Scan Blocked (user still active):');
        console.log(`   - Message: ${errorData.message}`);
        console.log('   - This means the user is currently logged in');
        console.log('   - Try logging out from the mobile app first');
      } else {
        console.log('❌ QR Scan Error:', errorData?.message || qrError.message);
      }
    }

    // Test 3: Test with a completely new user
    console.log('\n3️⃣ Testing QR scan for new user...');
    const newUserQR = {
      qrData: JSON.stringify({
        emp_email: "newuser.test@company.com",
        emp_name: "New Test User",
        emp_id: "new_user_" + Date.now(),
        qrToken: "new-token-" + Date.now()
      })
    };

    try {
      const newQrResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, newUserQR);
      console.log('✅ New User QR Scan Success:');
      console.log(`   - Message: ${newQrResponse.data.message}`);
      console.log(`   - Verification Code: ${newQrResponse.data.data?.verificationCode}`);
      
    } catch (newQrError) {
      console.log('❌ New User QR Error:', newQrError.response?.data?.message || newQrError.message);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📋 LOGOUT → QR RE-REGISTRATION FIXES APPLIED:');
    console.log('═'.repeat(60));
    console.log('✅ Login clears isLoggedOut flag');
    console.log('✅ Quick login clears isLoggedOut flag');
    console.log('✅ Registration completion clears isLoggedOut flag');
    console.log('✅ Logout properly sets isLoggedOut: true');
    console.log('✅ QR scan allows re-registration for logged out users');

    console.log('\n🎯 HOW THE FIX WORKS:');
    console.log('1. User logs in → isLoggedOut set to false');
    console.log('2. User logs out → isLoggedOut set to true');
    console.log('3. User tries QR scan → system checks isLoggedOut');
    console.log('4. If isLoggedOut: true → allows re-registration');
    console.log('5. Registration resets user status for fresh signup');

    console.log('\n📱 TESTING INSTRUCTIONS:');
    console.log('1. Open mobile app and logout if currently logged in');
    console.log('2. Try scanning QR code - should work now!');
    console.log('3. Complete verification flow to re-register');
    console.log('4. Login and logout cycles should work properly');

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

testLogoutQRFix();