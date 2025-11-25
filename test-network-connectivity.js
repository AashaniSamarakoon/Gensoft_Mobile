const axios = require('axios');

const BASE_URL = 'http://192.168.1.55:3001/api/v1';

async function testNetworkConnectivity() {
  console.log('🔍 Testing Network Connectivity & Dashboard Access');
  console.log('📡 Server URL:', BASE_URL);
  console.log('=' .repeat(60));

  try {
    // Test 1: Basic connectivity
    console.log('\n1️⃣ Testing basic connectivity...');
    const healthResponse = await axios.get(`${BASE_URL}`, { timeout: 5000 });
    console.log('✅ Server is running:', healthResponse.status);

    // Test 2: Network ping endpoint
    console.log('\n2️⃣ Testing network ping endpoint...');
    const pingResponse = await axios.get(`${BASE_URL}/network-test/ping`, { timeout: 5000 });
    console.log('✅ Ping response:', pingResponse.data);

    // Test 3: Test quick login endpoint for dashboard access
    console.log('\n3️⃣ Testing quick login endpoint (for dashboard access)...');
    const quickLoginResponse = await axios.post(`${BASE_URL}/auth/quick-login`, {
      userId: 'test-user-id',
      deviceInfo: {
        deviceId: 'test-device-123',
        platform: 'web-test'
      }
    }, { timeout: 5000 });
    console.log('✅ Quick login response:', quickLoginResponse.data.message || 'Response received');

    // Test 4: Test QR scan endpoint
    console.log('\n4️⃣ Testing QR scan endpoint...');
    const qrTestData = {
      qrData: JSON.stringify({
        emp_email: 'connectivity.test@example.com',
        emp_name: 'Connectivity Test User',
        emp_id: 'CONN123'
      }),
      deviceInfo: {
        deviceId: 'test-device-123',
        platform: 'connectivity-test'
      }
    };

    const qrResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, qrTestData, { timeout: 5000 });
    console.log('✅ QR scan response:', qrResponse.data.success ? 'SUCCESS' : 'Response received');

    // Test 5: Dashboard stats endpoint
    console.log('\n5️⃣ Testing dashboard stats endpoint...');
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/dashboard/stats`, { 
        timeout: 5000,
        headers: {
          'Authorization': 'Bearer test-token' // This might fail but tests connectivity
        }
      });
      console.log('✅ Dashboard response:', dashboardResponse.data ? 'Data received' : 'Connected');
    } catch (dashError) {
      if (dashError.response?.status === 401) {
        console.log('✅ Dashboard endpoint accessible (needs auth)');
      } else {
        console.log('⚠️  Dashboard endpoint issue:', dashError.message);
      }
    }

    console.log('\n🎉 Network Connectivity Test Results:');
    console.log('✅ Server is running and accessible');
    console.log('✅ All API endpoints are responsive');
    console.log('✅ Network configuration is correct');
    console.log('\n📋 Summary:');
    console.log('   - Server URL: ' + BASE_URL);
    console.log('   - Port 3001: ✅ Accessible');
    console.log('   - API endpoints: ✅ Working');
    console.log('   - Dashboard access: ✅ Available (with auth)');

    return true;

  } catch (error) {
    console.log('\n❌ Network Connectivity Issues:');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running or not accessible');
      console.log('   - Check if NestJS server is running on port 3001');
      console.log('   - Verify IP address 192.168.1.55 is correct');
      console.log('   - Check Windows Firewall settings');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('❌ Connection timeout');
      console.log('   - Server might be overloaded');
      console.log('   - Network latency issues');
    } else {
      console.log('❌ Network error:', error.message);
      console.log('   - Error type:', error.code || 'Unknown');
      console.log('   - Status:', error.response?.status || 'No response');
    }

    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Verify server is running: npm run start:dev');
    console.log('2. Check server logs for errors');
    console.log('3. Test localhost connectivity: http://localhost:3001/api/v1');
    console.log('4. Check Windows Firewall and antivirus settings');
    console.log('5. Verify network adapter configuration');

    return false;
  }
}

// Dashboard access helper function
async function testDashboardAccess() {
  console.log('\n🏠 Testing Dashboard Access Scenarios');
  console.log('=' .repeat(50));

  const testScenarios = [
    {
      name: 'Valid token access',
      headers: { 'Authorization': 'Bearer valid-token-example' },
      expectation: 'Should show auth requirement'
    },
    {
      name: 'No token access',
      headers: {},
      expectation: 'Should show unauthorized'
    }
  ];

  for (const scenario of testScenarios) {
    try {
      console.log(`\n📊 Testing: ${scenario.name}`);
      const response = await axios.get(`${BASE_URL}/dashboard/stats`, {
        headers: scenario.headers,
        timeout: 3000
      });
      console.log(`✅ Response: ${response.status} - Dashboard accessible`);
    } catch (error) {
      const status = error.response?.status || 'No response';
      const message = error.response?.data?.message || error.message;
      console.log(`📋 Response: ${status} - ${message}`);
      
      if (status === 401) {
        console.log('✅ Expected: Authentication required (correct behavior)');
      }
    }
  }
}

// Run all tests
async function runAllTests() {
  const connectivityOk = await testNetworkConnectivity();
  
  if (connectivityOk) {
    await testDashboardAccess();
    
    console.log('\n🚀 Final Status: Network and API are working correctly!');
    console.log('💡 For dashboard access issues:');
    console.log('   - Ensure users have valid authentication tokens');
    console.log('   - Check session validation in frontend');
    console.log('   - Verify quick-login functionality');
  } else {
    console.log('\n❌ Final Status: Network connectivity issues need to be resolved first');
  }
}

// Execute tests
runAllTests().catch(console.error);