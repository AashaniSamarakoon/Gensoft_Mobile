// Fix logout issue by manually logging out the user
const axios = require('axios');

const BASE_URL = 'http://192.168.1.55:3001';

async function fixLogoutIssue() {
  console.log('🔧 FIXING LOGOUT ISSUE FOR DEMOU USER');
  console.log('=' .repeat(60));

  try {
    // Step 1: Logout demou user via debug endpoint
    console.log('\n1️⃣ Forcing logout for demou user...');
    
    const logoutResponse = await axios.post(`${BASE_URL}/debug/logout-user`, {
      email: "ashanisamarakoon36@gmail.com"
    });
    
    console.log('✅ Forced logout result:');
    console.log(`   - Success: ${logoutResponse.data.success}`);
    console.log(`   - Message: ${logoutResponse.data.message}`);
    console.log(`   - Data: ${JSON.stringify(logoutResponse.data.data)}`);

    // Step 2: Wait a moment for database to update
    console.log('\n2️⃣ Waiting for database update...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Test QR scan again
    console.log('\n3️⃣ Testing QR scan after forced logout...');
    
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
      const qrResponse = await axios.post(`${BASE_URL}/api/v1/auth/scan-qr`, qrData);
      
      console.log('🎉 QR SCAN SUCCESS AFTER LOGOUT:');
      console.log(`   - Success: ${qrResponse.data.success}`);
      console.log(`   - Message: ${qrResponse.data.message}`);
      console.log(`   - Next Step: ${qrResponse.data.data?.nextStep}`);
      console.log(`   - Verification Code: ${qrResponse.data.data?.verificationCode}`);
      
      console.log('\n✅ ISSUE FIXED: User can now scan QR after logout!');
      
    } catch (qrError) {
      const errorData = qrError.response?.data;
      
      if (errorData?.alreadyRegistered) {
        console.log('❌ STILL BLOCKED:');
        console.log(`   - Message: ${errorData.message}`);
        console.log('   - The logout process may not be working properly');
        console.log('   - User is still marked as active in database');
      } else {
        console.log('❌ QR Error:', errorData?.message || qrError.message);
      }
    }

    // Step 4: Check saved accounts again
    console.log('\n4️⃣ Checking saved accounts after logout...');
    
    const savedAccounts = await axios.get(`${BASE_URL}/api/v1/auth/saved-accounts`);
    
    const demouUser = savedAccounts.data.find(user => user.username === 'demou');
    if (demouUser) {
      console.log(`   - Demou still in saved accounts`);
      console.log(`   - Last Login: ${demouUser.lastLoginAt}`);
      console.log(`   - Has Quick Access: ${demouUser.hasQuickAccess}`);
    } else {
      console.log('   - Demou removed from saved accounts (expected after logout)');
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📋 LOGOUT ISSUE DIAGNOSIS:');
    console.log('═'.repeat(60));
    console.log('• Mobile app successfully cleared localStorage');
    console.log('• Mobile app sent logout request to backend');  
    console.log('• Backend may not be processing logout correctly');
    console.log('• Need to verify logout endpoint authentication');

  } catch (error) {
    console.log(`❌ Fix attempt failed: ${error.message}`);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

fixLogoutIssue();