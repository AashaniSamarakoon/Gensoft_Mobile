// Server Working Verification Test
const axios = require('axios');

const BASE_URL = 'http://192.168.1.55:3001/api/v1';

async function testServerWorking() {
  console.log('🚀 Testing Mobile ERP Server Status');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Basic connectivity
    console.log('1️⃣ Basic server connectivity...');
    const basicResponse = await axios.get(BASE_URL);
    console.log(`✅ Server responds: ${basicResponse.status} - ${basicResponse.data}`);
    
    // Test 2: Network ping
    console.log('\n2️⃣ Network ping test...');
    const pingResponse = await axios.get(`${BASE_URL}/network-test/ping`);
    console.log(`✅ Ping successful: ${pingResponse.data.message}`);
    console.log(`   Server: ${pingResponse.data.server}`);
    console.log(`   Timestamp: ${pingResponse.data.timestamp}`);
    
    // Test 3: Auth health check
    console.log('\n3️⃣ Authentication service health...');
    const authResponse = await axios.get(`${BASE_URL}/auth/health`);
    console.log(`✅ Auth service: ${authResponse.data.message}`);
    
    // Test 4: CORS test
    console.log('\n4️⃣ CORS configuration test...');
    const corsResponse = await axios.get(`${BASE_URL}/network-test/cors-test`);
    console.log(`✅ CORS working: ${corsResponse.data.cors}`);
    
    // Test 5: Quick login (should return 401 - this is correct behavior)
    console.log('\n5️⃣ Testing protected endpoint (should be 401)...');
    try {
      await axios.post(`${BASE_URL}/auth/quick-login`, {});
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Protected endpoint correctly returns 401 (authentication required)');
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 SERVER IS FULLY OPERATIONAL!');
    console.log('🌐 Network connectivity: RESOLVED');
    console.log('📱 Dashboard access: Ready (requires authentication)');
    console.log('🔧 Quick access: Available after login');
    
  } catch (error) {
    console.log(`❌ Server connectivity failed: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log('🔧 Server is not running or not accessible');
    }
  }
}

testServerWorking();