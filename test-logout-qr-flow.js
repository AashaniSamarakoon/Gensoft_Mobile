// Test Logout and QR Re-registration Flow
const axios = require('axios');

const BASE_URL = 'http://192.168.1.55:3001/api/v1';

async function testLogoutAndReRegistration() {
  console.log('🧪 Testing Logout and QR Re-registration Flow');
  console.log('=' .repeat(60));

  try {
    // Test 1: Simulate QR scan for existing user
    console.log('\n1️⃣ Testing QR scan for existing user...');
    const qrData = {
      qrData: JSON.stringify({
        emp_email: "demou.ashanisa.marakoo@gmail.com",
        emp_name: "demou",
        emp_id: "cmhvf73ur00007kl8k9cge5mp",
        qrToken: "test-token-123"
      })
    };

    try {
      const qrResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, qrData);
      console.log('✅ QR Scan Response:', qrResponse.data);
    } catch (qrError) {
      console.log('📋 QR Scan Response:', qrError.response?.data || qrError.message);
      
      if (qrError.response?.data?.alreadyRegistered) {
        console.log('👆 This is expected if user is already registered and active');
      }
    }

    // Test 2: Check saved accounts
    console.log('\n2️⃣ Testing saved accounts endpoint...');
    try {
      const savedAccountsResponse = await axios.get(`${BASE_URL}/auth/saved-accounts`);
      console.log('✅ Saved Accounts:', savedAccountsResponse.data);
    } catch (error) {
      console.log('❌ Saved Accounts Error:', error.response?.data || error.message);
    }

    // Test 3: Check auth health
    console.log('\n3️⃣ Testing auth health...');
    const healthResponse = await axios.get(`${BASE_URL}/auth/health`);
    console.log('✅ Auth Health:', healthResponse.data);

    console.log('\n🎯 Test Summary:');
    console.log('- If you see "already registered", logout from the mobile app first');
    console.log('- After logout, the user should be marked as isLoggedOut: true in DB');
    console.log('- Then QR scan should work again for re-registration');
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

testLogoutAndReRegistration();