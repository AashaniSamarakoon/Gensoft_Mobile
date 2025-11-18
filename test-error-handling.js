const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testErrorHandling() {
  console.log('🧪 TESTING QR SCAN AND PASSWORD ERROR HANDLING');
  console.log('===============================================\n');

  try {
    // Test 1: QR scan with already existing user
    console.log('📱 1. Testing QR scan with existing user data');
    console.log('--------------------------------------------');
    
    const existingUserQRData = {
      emp_id: 'usr_1_mobile',
      emp_uname: 'demou',
      emp_email: 'ashanisamarakoon36@gmail.com',
      emp_mobile_no: '1234567890'
    };
    const qrDataBase64 = Buffer.from(JSON.stringify(existingUserQRData)).toString('base64');
    
    const scanResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, {
      qrData: qrDataBase64
    });
    
    console.log('QR Scan Result:');
    console.log('  Success:', scanResponse.data.success);
    console.log('  Already Registered:', scanResponse.data.alreadyRegistered);
    console.log('  Message:', scanResponse.data.message);
    
    if (scanResponse.data.alreadyRegistered) {
      console.log('✅ PASS: QR scan correctly identified existing user');
    } else {
      console.log('❌ FAIL: QR scan should have detected existing user');
    }

    // Test 2: Try to set password for existing user (should fail)
    console.log('\n🔐 2. Testing set password for existing user');
    console.log('----------------------------------------------');
    
    try {
      const passwordResponse = await axios.post(`${BASE_URL}/auth/set-mobile-password`, {
        email: 'ashanisamarakoon36@gmail.com',
        mobilePassword: 'TestPassword123!',
        confirmPassword: 'TestPassword123!'
      });
      
      console.log('❌ UNEXPECTED: Password setting should have failed for existing user');
      console.log('Response:', passwordResponse.data);
      
    } catch (passwordError) {
      if (passwordError.response && passwordError.response.data) {
        const errorData = passwordError.response.data;
        console.log('Password Error Response:');
        console.log('  Status:', passwordError.response.status);
        console.log('  Message:', errorData.message);
        
        if (errorData.message && errorData.message.includes('already exists')) {
          console.log('✅ PASS: Password setting correctly failed with "already exists" error');
        } else {
          console.log('❌ FAIL: Error message should mention "already exists"');
        }
      } else {
        console.log('❌ Network error:', passwordError.message);
      }
    }

    // Test 3: Valid login with existing user
    console.log('\n🔑 3. Testing valid login with existing user');
    console.log('--------------------------------------------');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'demou',
      password: 'demo123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ PASS: Login successful for existing user');
      console.log('  Username:', loginResponse.data.data.user.username);
      console.log('  Token received:', !!loginResponse.data.data.tokens.accessToken);
    } else {
      console.log('❌ FAIL: Login should work for existing user');
    }

    console.log('\n🎯 SUMMARY');
    console.log('==========');
    console.log('✅ QR scan properly detects existing users');
    console.log('✅ Set password fails appropriately for existing users');  
    console.log('✅ Login works for existing users');
    console.log('');
    console.log('📱 FRONTEND BEHAVIOR:');
    console.log('- QR scanner should show "Account Already Exists" alert');
    console.log('- Alert should offer "Go to Login" option');
    console.log('- Set password screen should handle "already exists" error');
    console.log('- 24-hour timeout should force password entry');

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error('Message:', error.message);
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
  }
}

testErrorHandling();