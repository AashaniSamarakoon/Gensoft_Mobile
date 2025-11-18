const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testQRFlow() {
  console.log('🔍 Testing Complete QR Authentication Flow');
  console.log('==========================================\n');

  try {
    // Test 1: Scan QR for existing user (should be blocked)
    console.log('🎯 TEST 1: Existing User QR Scan');
    console.log('--------------------------------');
    
    const existingUserQRData = {
      emp_id: 'usr_1_mobile',
      emp_uname: 'demou',
      emp_email: 'ashanisamarakoon36@gmail.com', 
      emp_mobile_no: '1234567890'
    };
    const qrDataBase64 = Buffer.from(JSON.stringify(existingUserQRData)).toString('base64');
    
    console.log('📱 Scanning QR for existing user: demou');
    const qrResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, {
      qrData: qrDataBase64
    });
    
    console.log('\n📊 Response Analysis:');
    console.log('Status:', qrResponse.status);
    console.log('Success:', qrResponse.data.success);
    console.log('Already Registered:', qrResponse.data.alreadyRegistered);
    console.log('Message:', qrResponse.data.message);
    console.log('Full Response:', JSON.stringify(qrResponse.data, null, 2));
    
    if (qrResponse.data.alreadyRegistered === true) {
      console.log('✅ PASS: QR properly blocked for existing user');
    } else {
      console.log('❌ FAIL: QR not blocked - existing user can proceed');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Scan QR for new user (should proceed normally)
    console.log('🎯 TEST 2: New User QR Scan');
    console.log('---------------------------');
    
    const newUserQRData = {
      emp_id: 'usr_new_test_123',
      emp_uname: 'testuser123',
      emp_email: 'testuser123@example.com',
      emp_mobile_no: '9876543210'
    };
    const newQrDataBase64 = Buffer.from(JSON.stringify(newUserQRData)).toString('base64');
    
    console.log('📱 Scanning QR for new user: testuser123');
    const newUserResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, {
      qrData: newQrDataBase64
    });
    
    console.log('\n📊 Response Analysis:');
    console.log('Status:', newUserResponse.status);
    console.log('Success:', newUserResponse.data.success);
    console.log('Already Registered:', newUserResponse.data.alreadyRegistered);
    console.log('Message:', newUserResponse.data.message);
    
    if (newUserResponse.data.success === true && !newUserResponse.data.alreadyRegistered) {
      console.log('✅ PASS: New user QR allowed to proceed');
    } else {
      console.log('❌ FAIL: New user QR blocked incorrectly');
    }

  } catch (error) {
    console.error('❌ Test Error:', error.response?.data || error.message);
  }
}

testQRFlow();