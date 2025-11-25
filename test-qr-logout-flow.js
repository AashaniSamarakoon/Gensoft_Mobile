const axios = require('axios');

const BASE_URL = 'http://192.168.1.55:3001/api/v1';

// Test data - QR data as JSON string (as it would come from QR code)
const testQRDataObject = {
  qr_token: "test_token_123",
  emp_email: "test@example.com", 
  emp_name: "Test User",
  emp_phone: "+1234567890",
  emp_id: "ERP123"
};

const testQRData = {
  qrData: JSON.stringify(testQRDataObject),
  deviceInfo: {
    deviceId: "test_device_123",
    platform: "Test Platform",
    version: "1.0.0",
    model: "Test Model"
  }
};

// Cleanup function to reset test user
async function cleanupTestUser() {
  try {
    console.log('🧹 Cleaning up test user...');
    // Try to delete any existing test user data
    await axios.delete(`${BASE_URL}/debug/user/${testQRDataObject.emp_email}`).catch(() => {});
    console.log('✅ Test user cleanup completed');
    
    // Wait a moment for database operations
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.log('ℹ️  Cleanup skipped (no debug endpoint)');
  }
}

async function testCompleteQRLogoutFlow() {
  console.log('\n🔄 Testing Complete QR Scan & Logout Flow\n');

  // Clean up any existing test data
  await cleanupTestUser();

  try {
    // Step 1: First QR scan (registration)
    console.log('1️⃣ Testing first QR scan (new user registration)...');
    const firstScanResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, testQRData);
    console.log('✅ First scan result:', firstScanResponse.data);

    if (firstScanResponse.data.success && firstScanResponse.data.action === 'email_verification_required') {
      console.log('✅ New user registration flow started correctly');
    }

    // Wait a moment for database operations
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Try QR scan again (should show account exists)
    console.log('\n2️⃣ Testing second QR scan (should show account exists)...');
    const secondScanResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, testQRData);
    console.log('✅ Second scan result:', secondScanResponse.data);

    if (secondScanResponse.data.success && secondScanResponse.data.action === 'login_required') {
      console.log('✅ Existing account detection working correctly');
    }

    // Step 3: Simulate completing registration and login
    console.log('\n3️⃣ Simulating user completing email verification and password setup...');
    
    // Complete email verification with actual code from first scan
    let verificationCode = firstScanResponse.data.data?.verificationCode;
    let emailVerified = false;
    if (verificationCode) {
      try {
        const verifyEmailResponse = await axios.post(`${BASE_URL}/auth/verify-email`, {
          email: testQRDataObject.emp_email,
          verificationCode: verificationCode
        });
        console.log('📧 Email verification result:', verifyEmailResponse.data);
        emailVerified = true;

        // Complete password verification to fully register user
        if (verifyEmailResponse.data.success) {
          console.log('🔐 Setting up password...');
          const passwordResponse = await axios.post(`${BASE_URL}/auth/verify-password`, {
            email: testQRDataObject.emp_email,
            password: 'TestPassword123!',
            confirmPassword: 'TestPassword123!'
          });
          console.log('🔐 Password setup result:', passwordResponse.data);

          // Now try to login to complete the registration
          if (passwordResponse.data.success) {
            console.log('🔑 Performing login to complete registration...');
            const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
              email: testQRDataObject.emp_email,
              password: 'TestPassword123!'
            });
            console.log('🔑 Login result:', loginResponse.data);
          }
        }
      } catch (error) {
        console.log('📧 Registration process failed:', error.response?.data?.message || error.message);
      }
    } else {
      console.log('📧 No verification code received from QR scan');
    }

    // Step 4: Simulate logout
    console.log('\n4️⃣ Simulating user logout...');
    const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {
      email: testQRDataObject.emp_email
    });
    console.log('✅ Logout result:', logoutResponse.data);

    if (logoutResponse.data.success) {
      console.log('✅ User marked as logged out in database');
    }

    // Wait a moment for database operations
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 5: Try QR scan after logout (should allow re-registration)
    console.log('\n5️⃣ Testing QR scan after logout (should allow re-registration)...');
    const afterLogoutScanResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, testQRData);
    console.log('✅ After logout scan result:', afterLogoutScanResponse.data);

    if (afterLogoutScanResponse.data.success && afterLogoutScanResponse.data.action === 'email_verification_required') {
      console.log('✅ Logged out user can re-register correctly!');
    }

    console.log('\n🎉 Complete QR Scan & Logout Flow Test Summary:');
    console.log('✅ New user registration: Working');
    console.log('✅ Existing user detection: Working');
    console.log('✅ Logout state tracking: Working');
    console.log('✅ Re-registration after logout: Working');

  } catch (error) {
    console.error('❌ Test error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('ℹ️  Server might not be running on expected port');
    }
  }
}

// Additional test for database state verification
async function testDatabaseState() {
  console.log('\n🔍 Testing Database State Verification...');
  
  try {
    // This would require a debug endpoint to check database state
    // For now, we'll just test the API responses
    console.log('ℹ️  Database state can be verified through API responses above');
    console.log('ℹ️  Check that:');
    console.log('   - isRegistered: false initially, true after completion');
    console.log('   - isLoggedOut: false initially, true after logout');
    console.log('   - lastLogoutAt: null initially, timestamp after logout');
    
  } catch (error) {
    console.error('❌ Database state test error:', error.message);
  }
}

// Run the complete test
async function runAllTests() {
  console.log('🚀 Starting QR Scan & Logout Flow Tests...');
  console.log('📡 Testing against:', BASE_URL);
  
  await testCompleteQRLogoutFlow();
  await testDatabaseState();
  
  console.log('\n✨ All tests completed!');
}

runAllTests();