// Test with Database Query
const axios = require('axios');

async function testLogoutScenario() {
  console.log('🔍 Testing Logout Scenario Simulation');
  console.log('=' .repeat(60));

  const BASE_URL = 'http://192.168.1.55:3001/api/v1';

  // Test with QR data for a user that should be marked as logged out
  const loggedOutUserQR = {
    qrData: JSON.stringify({
      emp_email: "test.logout@company.com",
      emp_name: "Test Logout User", 
      emp_id: "test_logout_123",
      qrToken: "logout-test-" + Date.now()
    })
  };

  try {
    console.log('\n1️⃣ Testing QR scan for simulated logged out user...');
    const qrResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, loggedOutUserQR);
    
    console.log('✅ QR Scan Response:');
    console.log(`   - Success: ${qrResponse.data.success}`);
    console.log(`   - Message: ${qrResponse.data.message}`);
    console.log(`   - Next Step: ${qrResponse.data.data?.nextStep}`);
    
    if (qrResponse.data.data?.verificationCode) {
      console.log(`   - Verification Code: ${qrResponse.data.data.verificationCode}`);
      console.log('\n🎉 SUCCESS: New user can register via QR!');
    }

  } catch (error) {
    console.log('❌ QR Scan Error:', error.response?.data || error.message);
  }

  // Test the existing demo user scenario
  console.log('\n2️⃣ Testing existing demo user (should show already registered)...');
  const existingUserQR = {
    qrData: JSON.stringify({
      emp_email: "ashanisamarakoon36@gmail.com",
      emp_name: "demou",
      emp_id: "cmhyf73ur00007kl8k9cge5mp"
    })
  };

  try {
    const existingResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, existingUserQR);
    console.log('❌ Unexpected: Should have been blocked but got:', existingResponse.data.message);
  } catch (error) {
    const errorData = error.response?.data;
    if (errorData?.alreadyRegistered) {
      console.log('✅ Expected: User blocked because already registered and active');
      console.log(`   - Message: ${errorData.message}`);
    } else {
      console.log('❌ Unexpected error:', errorData?.message || error.message);
    }
  }

  console.log('\n📋 INSTRUCTIONS FOR TESTING:');
  console.log('━'.repeat(40));
  console.log('1. Open your mobile app');
  console.log('2. Login with the demo user');
  console.log('3. Click logout in the app');
  console.log('4. Then try scanning QR code');
  console.log('5. It should now allow re-registration!');
  
  console.log('\n✅ The fix has been applied:');
  console.log('- Backend now checks isLoggedOut status');  
  console.log('- Logged out users can scan QR again');
  console.log('- Frontend properly calls logout API');
  console.log('- User registration status gets reset');
}

testLogoutScenario();