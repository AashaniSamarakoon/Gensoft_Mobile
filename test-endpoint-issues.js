// Test the exact authentication and endpoint issues
const axios = require('axios');

const BASE_URL = 'http://192.168.1.55:3001/api/v1';

async function testEndpointIssues() {
  console.log('🔧 TESTING ENDPOINT AND AUTHENTICATION ISSUES');
  console.log('=' .repeat(60));

  try {
    // Test 1: Check what endpoints are actually available
    console.log('\n1️⃣ Testing Available Endpoints:');
    
    const endpoints = [
      '/modules',                    // ❌ This doesn't exist 
      '/approvals/modules',         // ✅ This should exist
      '/approvals',                 // ✅ This should exist (with auth)
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`🔐 ${endpoint} - Status: 401 (Unauthorized - requires auth)`);
        } else if (error.response?.status === 404) {
          console.log(`❌ ${endpoint} - Status: 404 (Not Found)`);
        } else {
          console.log(`❌ ${endpoint} - Error: ${error.message}`);
        }
      }
    }

    // Test 2: Test with authentication
    console.log('\n2️⃣ Testing With Authentication:');
    
    // Get auth token first
    const savedAccounts = await axios.get(`${BASE_URL}/auth/saved-accounts`);
    if (savedAccounts.data.length === 0) {
      console.log('❌ No saved accounts - cannot test authenticated endpoints');
      return;
    }
    
    const userAccount = savedAccounts.data[0];
    console.log(`🔐 Using account: ${userAccount.username}`);
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/quick-login`, {
      userId: userAccount.id,
      deviceInfo: {
        deviceId: 'test-device',
        deviceName: 'Test Device'
      }
    });
    
    const authToken = loginResponse.data.data.tokens.accessToken;
    console.log('✅ Got auth token');

    // Test authenticated endpoints
    const authEndpoints = [
      '/approvals/modules',
      '/approvals',
    ];
    
    for (const endpoint of authEndpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log(`✅ ${endpoint} - Authenticated Status: ${response.status}`);
        
        if (endpoint === '/approvals/modules') {
          const data = response.data;
          console.log(`   📁 Modules Count: ${data.total || data.data?.length || 0}`);
        }
        
        if (endpoint === '/approvals') {
          const data = response.data;
          console.log(`   📋 Approvals Count: ${data.total || data.data?.length || 0}`);
        }
        
      } catch (error) {
        console.log(`❌ ${endpoint} - Authenticated Error: ${error.response?.status} ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('🔧 ISSUE DIAGNOSIS AND SOLUTIONS:');
    console.log('═'.repeat(60));
    
    console.log('\n📍 ISSUE 1: Wrong Module Endpoint');
    console.log('❌ Frontend calls: /api/v1/modules (doesn\'t exist)');
    console.log('✅ Should call: /api/v1/approvals/modules');
    console.log('🔧 Solution: Fixed in nestjsApiService.js getModules() method');
    
    console.log('\n🔐 ISSUE 2: Missing Authentication');
    console.log('❌ Approvals endpoints require JWT auth but not receiving tokens');
    console.log('✅ Should include: Authorization: Bearer <token> header');
    console.log('🔧 Solution: Ensure token is stored in SecureStore and interceptor works');
    
    console.log('\n📱 MOBILE APP FIXES NEEDED:');
    console.log('1. Update endpoint calls to use correct URLs');
    console.log('2. Ensure user is logged in before calling approvals APIs');
    console.log('3. Verify token is properly stored in SecureStore');
    console.log('4. Add error handling for 401 Unauthorized responses');
    
    console.log('\n🚀 TESTING AFTER FIXES:');
    console.log('- Modules endpoint should return 30+ ERP modules');
    console.log('- Approvals endpoint should return user\'s approvals');
    console.log('- No more "Cannot GET /api/v1/modules" errors');
    console.log('- No more "Unauthorized" errors (when logged in)');

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

testEndpointIssues();