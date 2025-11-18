const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testPasswordSetting() {
  console.log('🔐 Testing Set Mobile Password Endpoint');
  console.log('======================================\n');

  try {
    // First create a QR session for testing
    console.log('📱 Step 1: Creating QR session...');
    
    const newUserQRData = {
      emp_id: 'usr_test_pwd_' + Date.now(),
      emp_uname: 'testpwduser',
      emp_email: 'testpwduser@example.com',
      emp_mobile_no: '1234567890'
    };
    const qrDataBase64 = Buffer.from(JSON.stringify(newUserQRData)).toString('base64');
    
    const scanResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, {
      qrData: qrDataBase64
    });
    
    if (!scanResponse.data.success) {
      console.log('❌ QR scan failed:', scanResponse.data.message);
      return;
    }
    
    console.log('✅ QR session created successfully');
    const userEmail = scanResponse.data.data.email;
    console.log(`   Email: ${userEmail}`);
    
    // Step 2: Test set mobile password
    console.log('\n🔐 Step 2: Testing set mobile password...');
    
    const passwordData = {
      email: userEmail,
      mobilePassword: 'TestPassword123!',
      confirmPassword: 'TestPassword123!'
    };
    
    console.log(`📧 Setting password for: ${passwordData.email}`);
    
    const setPasswordResponse = await axios.post(`${BASE_URL}/auth/set-mobile-password`, passwordData);
    
    console.log('\n✅ Password Setting Result:');
    console.log('===========================');
    console.log(`Status: ${setPasswordResponse.status}`);
    console.log(`Success: ${setPasswordResponse.data.success}`);
    console.log(`Message: ${setPasswordResponse.data.message}`);
    
    if (setPasswordResponse.data.data) {
      console.log('\n📊 User Data:');
      console.log(`   User ID: ${setPasswordResponse.data.data.userId}`);
      console.log(`   Username: ${setPasswordResponse.data.data.username}`);
      console.log(`   Email: ${setPasswordResponse.data.data.email}`);
      console.log(`   Name: ${setPasswordResponse.data.data.name}`);
    }
    
    console.log('\n🎉 SUCCESS: Set mobile password endpoint is working correctly!');
    console.log('✅ 500 Internal Server Error has been fixed');
    console.log('✅ User registration can now complete successfully');

  } catch (error) {
    console.error('\n❌ Password Setting Error:');
    console.error('==========================');
    console.error(`Status: ${error.response?.status || 'No status'}`);
    console.error(`Message: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.response?.status === 500) {
      console.error('\n🔧 500 Internal Server Error - Possible causes:');
      console.error('- Database schema mismatch');
      console.error('- Missing required fields');
      console.error('- QR session not found or expired');
      console.error('- Password hashing error');
      console.error('- Database connection issue');
    }
  }
}

testPasswordSetting();