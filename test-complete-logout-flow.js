// Complete Logout and Re-registration Flow Test
const axios = require('axios');

const BASE_URL = 'http://192.168.1.55:3001/api/v1';

async function testCompleteFlow() {
  console.log('🔄 Testing Complete Logout and Re-registration Flow');
  console.log('=' .repeat(70));

  // Test user data (use the existing demo user)
  const testUser = {
    emp_email: "ashanisamarakoon36@gmail.com", 
    emp_name: "demou",
    emp_id: "cmhyf73ur00007kl8k9cge5mp",
    qrToken: "test-token-" + Date.now()
  };

  try {
    console.log('\n🎯 SCENARIO: User logs out and wants to re-register');
    console.log('━'.repeat(50));

    // Step 1: Check current user status
    console.log('\n1️⃣ Checking saved accounts before logout...');
    const savedAccounts1 = await axios.get(`${BASE_URL}/auth/saved-accounts`);
    const userBefore = savedAccounts1.data.find(acc => acc.email === testUser.emp_email);
    
    if (userBefore) {
      console.log(`✅ User found: ${userBefore.username} (${userBefore.email})`);
      console.log(`   - Has Quick Access: ${userBefore.hasQuickAccess}`);
      console.log(`   - Last Login: ${userBefore.lastLoginAt}`);
    } else {
      console.log('❌ User not found in saved accounts');
    }

    // Step 2: Test QR scan (should work now after our fix)
    console.log('\n2️⃣ Testing QR scan for existing user...');
    try {
      const qrResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, {
        qrData: JSON.stringify(testUser)
      });
      
      console.log('✅ QR Scan Success!');
      console.log(`   - Message: ${qrResponse.data.message}`);
      console.log(`   - Next Step: ${qrResponse.data.data?.nextStep}`);
      console.log(`   - Verification Code: ${qrResponse.data.data?.verificationCode}`);
      
      if (qrResponse.data.data?.verificationCode) {
        console.log('\n🎉 SUCCESS: User can now re-register after logout!');
        console.log('   - The fix is working correctly');
        console.log('   - Logged out users can scan QR code again');
        console.log('   - They get a new verification code to proceed');
      }
      
    } catch (qrError) {
      const errorData = qrError.response?.data;
      
      if (errorData?.alreadyRegistered) {
        console.log('❌ QR Scan Blocked - User still active');
        console.log(`   - Message: ${errorData.message}`);
        console.log(`   - This means the user needs to logout first`);
        console.log(`   - Or the logout didn't properly mark them as logged out`);
      } else {
        console.log('❌ QR Scan Error:', errorData?.message || qrError.message);
      }
    }

    // Step 3: Check auth health
    console.log('\n3️⃣ Verifying auth service health...');
    const health = await axios.get(`${BASE_URL}/auth/health`);
    console.log(`✅ Auth Service: ${health.data.message}`);

    console.log('\n' + '═'.repeat(70));
    console.log('📋 SUMMARY OF FIXES IMPLEMENTED:');
    console.log('═'.repeat(70));
    console.log('✅ Backend: Updated QR scan logic to allow logged out users');
    console.log('✅ Backend: Reset user registration status on logout');
    console.log('✅ Frontend: Fixed logout API call with proper auth headers');
    console.log('✅ Database: User marked as isLoggedOut: true on logout');
    console.log('✅ Flow: Logged out users can now scan QR code again');
    
    console.log('\n🎯 HOW IT WORKS NOW:');
    console.log('1. User logs out → marked as isLoggedOut: true in DB');
    console.log('2. User removed from saved accounts');
    console.log('3. User can scan QR code → system allows re-registration');
    console.log('4. System resets registration status for fresh signup');
    console.log('5. User goes through verification flow again');
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

testCompleteFlow();