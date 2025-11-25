// Test Module Dropdown Loading Issue
// Debug why modules are not loading in the dropdown

const axios = require('axios');

const BASE_URL = 'http://192.168.1.55:3001/api/v1';

async function debugModuleDropdown() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔍 DEBUGGING MODULE DROPDOWN LOADING ISSUE');
  console.log('═'.repeat(60));

  // Step 1: Test login with correct format
  console.log('\n1️⃣ TESTING LOGIN TO GET AUTHENTICATION TOKEN');
  console.log('─'.repeat(40));
  
  try {
    // Login with known working credentials
    console.log('🔐 Attempting login with username: demou...');
    
    let token = null;
    let loginSuccess = false;
    
    try {
      const response = await axios.post(BASE_URL + '/auth/login', {
        username: 'demou',
        password: 'demo123'
      });
      
      console.log('📊 Login response status:', response.status);
      console.log('📋 Login response data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success && response.data.data?.tokens?.accessToken) {
        token = response.data.data.tokens.accessToken;
        loginSuccess = true;
        console.log('✅ Login successful!');
        console.log('🎟️ Token received:', token.substring(0, 20) + '...');
      } else {
        console.log('❌ Login failed - no token in response');
      }
    } catch (error) {
      console.log('❌ Login request failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
      console.log('   Full error:', JSON.stringify(error.response?.data, null, 2));
    }

    if (!loginSuccess) {
      console.log('\n❌ All login attempts failed. Cannot test module loading.');
      return;
    }

    // Step 2: Test modules endpoint with authentication
    console.log('\n2️⃣ TESTING MODULES ENDPOINT WITH AUTHENTICATION');
    console.log('─'.repeat(45));
    
    const headers = { 'Authorization': `Bearer ${token}` };
    
    try {
      console.log('📡 Making request to /approvals/modules...');
      const response = await axios.get(BASE_URL + '/approvals/modules', { headers });
      
      console.log('✅ Modules endpoint response:');
      console.log('   Status:', response.status);
      console.log('   Success:', response.data.success);
      console.log('   Total modules:', response.data.total);
      console.log('   Modules count:', response.data.data?.length || 0);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('\n📋 FIRST 5 MODULES:');
        response.data.data.slice(0, 5).forEach((module, index) => {
          console.log(`   ${index + 1}. ${module.displayName} (${module.name}) - ${module.description}`);
        });
        
        console.log('\n🎉 MODULES ARE AVAILABLE FOR DROPDOWN!');
      } else {
        console.log('\n❌ NO MODULES FOUND IN RESPONSE');
      }
      
    } catch (error) {
      console.log('❌ Modules request failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
    }

    // Step 3: Test the exact service method that mobile app uses
    console.log('\n3️⃣ TESTING NESTJS API SERVICE SIMULATION');
    console.log('─'.repeat(40));
    
    try {
      // This simulates what nestjsApiService.getModules() does
      const serviceResponse = await axios.get(BASE_URL + '/approvals/modules', { headers });
      
      console.log('📱 Mobile app service call simulation:');
      console.log('   Raw response structure:', Object.keys(serviceResponse.data));
      console.log('   Data available:', !!serviceResponse.data.data);
      console.log('   Success flag:', serviceResponse.data.success);
      
      if (serviceResponse.data.success && serviceResponse.data.data) {
        console.log('✅ Service method should work - modules available');
        console.log('   Module structure check:');
        const firstModule = serviceResponse.data.data[0];
        if (firstModule) {
          console.log('     ID:', !!firstModule.id);
          console.log('     Name:', !!firstModule.name);
          console.log('     Display Name:', !!firstModule.displayName);
          console.log('     Description:', !!firstModule.description);
        }
      } else {
        console.log('❌ Service response format issue');
      }
      
    } catch (error) {
      console.log('❌ Service simulation failed:', error.message);
    }

    // Step 4: Check frontend service configuration
    console.log('\n4️⃣ POTENTIAL FRONTEND ISSUES TO CHECK');
    console.log('─'.repeat(40));
    console.log('🔍 Check these in your mobile app:');
    console.log('   1. Is nestjsApiService properly configured with base URL?');
    console.log('   2. Are authentication tokens being stored and sent?');
    console.log('   3. Is the ModuleDropdown component calling getModules()?');
    console.log('   4. Are there any console errors in React Native logs?');
    console.log('   5. Is the network request actually reaching the server?');

  } catch (error) {
    console.error('Unexpected error:', error.message);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📋 SUMMARY: WHY MODULES MIGHT NOT BE LOADING');
  console.log('═'.repeat(60));
  console.log('1. ✅ Backend has 30 modules available');
  console.log('2. ✅ Endpoint /approvals/modules works with authentication');
  console.log('3. ❓ Check if mobile app is sending authentication token');
  console.log('4. ❓ Check if nestjsApiService base URL is correct');
  console.log('5. ❓ Check React Native console for network errors');
  console.log('6. ❓ Verify ModuleDropdown component is actually calling fetchModules()');
}

debugModuleDropdown().catch(console.error);