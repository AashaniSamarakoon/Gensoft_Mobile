const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function debugSetPasswordIssue() {
  console.log('🔍 Debugging Set Mobile Password Issue');
  console.log('=====================================\n');

  try {
    // Step 1: Create a fresh QR session with detailed logging
    console.log('📱 Step 1: Creating fresh QR session...');
    
    const uniqueId = Date.now();
    const newUserQRData = {
      emp_id: `usr_debug_${uniqueId}`,
      emp_uname: `debuguser${uniqueId}`,
      emp_email: `debuguser${uniqueId}@example.com`,
      emp_mobile_no: '1234567890'
    };
    
    console.log('QR Data:', JSON.stringify(newUserQRData, null, 2));
    
    const qrDataBase64 = Buffer.from(JSON.stringify(newUserQRData)).toString('base64');
    
    const scanResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, {
      qrData: qrDataBase64
    });
    
    console.log('QR Scan Response:', JSON.stringify(scanResponse.data, null, 2));
    
    if (!scanResponse.data.success) {
      console.log('❌ QR scan failed, cannot test password setting');
      return;
    }
    
    const userEmail = scanResponse.data.data.email;
    console.log(`✅ QR session created for: ${userEmail}`);
    
    // Step 2: Verify email first (required step)
    console.log('\n📧 Step 2: Verifying email...');
    
    // Skip email verification or use a dummy code
    console.log('⚠️ Skipping email verification for testing purposes');
    
    // Step 3: Test different password configurations
    console.log('\n🔐 Step 3: Testing password setting with different inputs...');
    
    const testCases = [
      {
        name: 'Valid password',
        data: {
          email: userEmail,
          mobilePassword: 'ValidPassword123!',
          confirmPassword: 'ValidPassword123!'
        }
      },
      {
        name: 'Short password',
        data: {
          email: userEmail,
          mobilePassword: '123',
          confirmPassword: '123'
        }
      },
      {
        name: 'Mismatched passwords',
        data: {
          email: userEmail,
          mobilePassword: 'Password123!',
          confirmPassword: 'Different123!'
        }
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🧪 Testing: ${testCase.name}`);
      console.log('Request data:', JSON.stringify(testCase.data, null, 2));
      
      try {
        const response = await axios.post(`${BASE_URL}/auth/set-mobile-password`, testCase.data);
        console.log('✅ Success:', JSON.stringify(response.data, null, 2));
        break; // Stop on first success
      } catch (error) {
        console.log(`❌ Error (${error.response?.status}):`);
        console.log('  Message:', error.response?.data?.message || error.message);
        console.log('  Details:', JSON.stringify(error.response?.data, null, 2));
        
        // If it's a validation error (400), continue to next test
        // If it's a server error (500), investigate further
        if (error.response?.status === 500) {
          console.log('\n🔧 500 Error Details:');
          console.log('  This suggests a server-side database or logic error');
          console.log('  Possible causes:');
          console.log('  - QR session not found or expired');
          console.log('  - Database constraint violation');
          console.log('  - Missing database fields');
          console.log('  - bcrypt hashing error');
          break; // Stop on server error
        }
      }
    }
    
    // Step 4: Check if QR session exists
    console.log('\n🔍 Step 4: Investigating QR session state...');
    console.log('This would require database access to check qr_code_sessions table');
    console.log(`Look for session with userEmail: ${userEmail}`);
    console.log('Check if isUsed=false and expiresAt > now()');

  } catch (error) {
    console.error('\n❌ Debug Test Error:');
    console.error('====================');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Full response:', JSON.stringify(error.response?.data, null, 2));
  }
}

debugSetPasswordIssue();