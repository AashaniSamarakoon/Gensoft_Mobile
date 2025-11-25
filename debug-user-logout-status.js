// Debug user lookup and logout status
const axios = require('axios');

const BASE_URL = 'http://192.168.1.55:3001/api/v1';

async function debugUserLogoutStatus() {
  console.log('🔍 DEBUGGING USER LOGOUT STATUS');
  console.log('=' .repeat(60));

  try {
    // Check current saved accounts
    console.log('\n1️⃣ Current saved accounts:');
    const savedAccounts = await axios.get(`${BASE_URL}/auth/saved-accounts`);
    
    savedAccounts.data.forEach((account, index) => {
      console.log(`   ${index + 1}. ${account.username} (${account.email})`);
      console.log(`      - ID: ${account.id}`);
      console.log(`      - Has Quick Access: ${account.hasQuickAccess}`);
      console.log(`      - Last Login: ${account.lastLoginAt}`);
    });

    // Find demou user and check their status
    const demouUser = savedAccounts.data.find(user => user.username === 'demou');
    
    if (demouUser) {
      console.log(`\n2️⃣ Found demou user with ID: ${demouUser.id}`);
      
      // Try to manually logout this user using debug endpoint
      console.log('\n3️⃣ Attempting manual logout via debug endpoint...');
      
      try {
        const logoutResponse = await axios.post(`http://192.168.1.55:3001/debug/logout-user`, {
          userId: demouUser.id
        });
        
        console.log('✅ Manual logout successful:');
        console.log(`   - Response: ${JSON.stringify(logoutResponse.data)}`);
        
        // Now test QR scan again
        console.log('\n4️⃣ Testing QR scan after manual logout...');
        
        const qrData = {
          qrData: JSON.stringify({
            emp_id: 1,
            emp_uname: "demou", 
            emp_pwd: "123456",
            emp_email: "ashanisamarakoon36@gmail.com",
            emp_mobile_no: "0703101244"
          })
        };
        
        const qrResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, qrData);
        
        console.log('✅ QR Scan after logout SUCCESS:');
        console.log(`   - Message: ${qrResponse.data.message}`);
        console.log(`   - Success: ${qrResponse.data.success}`);
        console.log(`   - Next Step: ${qrResponse.data.data?.nextStep}`);
        
      } catch (logoutError) {
        console.log('❌ Manual logout failed:', logoutError.response?.data?.message || logoutError.message);
      }
      
    } else {
      console.log('\n❌ Could not find demou user in saved accounts');
    }

    // Test the QR scan as-is to see current behavior
    console.log('\n5️⃣ Testing current QR scan behavior...');
    
    const currentQrData = {
      qrData: JSON.stringify({
        emp_id: 1,
        emp_uname: "demou",
        emp_pwd: "123456", 
        emp_email: "ashanisamarakoon36@gmail.com",
        emp_mobile_no: "0703101244"
      })
    };
    
    try {
      const currentQrResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, currentQrData);
      console.log('✅ Current QR Scan Success (user is logged out):');
      console.log(`   - Message: ${currentQrResponse.data.message}`);
    } catch (currentQrError) {
      const errorData = currentQrError.response?.data;
      console.log('❌ Current QR Scan Blocked:');
      console.log(`   - Already Registered: ${errorData?.alreadyRegistered}`);
      console.log(`   - Message: ${errorData?.message}`);
      console.log('   - This means user is still marked as active in database');
    }

  } catch (error) {
    console.log(`❌ Debug failed: ${error.message}`);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

debugUserLogoutStatus();