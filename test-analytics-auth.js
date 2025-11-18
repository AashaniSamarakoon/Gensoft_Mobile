const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testAnalyticsWithAuth() {
  console.log('🔍 Testing IOU Analytics with Authentication');
  console.log('============================================\n');

  try {
    // First, let's login to get a valid token
    console.log('🔐 Step 1: Attempting login to get auth token...');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'demou',
      password: 'demo123' // Common test password
    }).catch(async (error) => {
      // If regular login fails, try with email
      console.log('📧 Trying login with email...');
      return await axios.post(`${BASE_URL}/auth/login`, {
        username: 'ashanisamarakoon36@gmail.com',
        password: 'demo123'
      });
    }).catch((error) => {
      console.log('❌ Login failed, trying different credentials...');
      throw error;
    });

    console.log('✅ Login successful!');
    const token = loginResponse.data.data.tokens.accessToken;
    console.log('🔑 Got auth token');

    // Now test IOU endpoints with authentication
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\n📊 Step 2: Testing IOU Analytics endpoints...');

    // Test IOUs endpoint
    try {
      const iouResponse = await axios.get(`${BASE_URL}/iou`, { headers: authHeaders });
      console.log('✅ IOUs endpoint accessible');
      console.log('IOUs count:', iouResponse.data.data?.length || iouResponse.data.ious?.length || 0);
      console.log('IOUs data structure:', Object.keys(iouResponse.data));
    } catch (error) {
      console.log('❌ IOUs endpoint error:', error.response?.status, error.response?.data?.message);
    }

    // Test Proofs endpoint  
    try {
      const proofResponse = await axios.get(`${BASE_URL}/api/proof`, { headers: authHeaders });
      console.log('✅ Proofs endpoint accessible');
      console.log('Proofs count:', proofResponse.data.data?.length || 0);
      console.log('Proofs data structure:', Object.keys(proofResponse.data));
    } catch (error) {
      console.log('❌ Proofs endpoint error:', error.response?.status, error.response?.data?.message);
    }

    // Test Settlements endpoint
    try {
      const settlementResponse = await axios.get(`${BASE_URL}/api/settlement`, { headers: authHeaders });
      console.log('✅ Settlements endpoint accessible');
      console.log('Settlements count:', settlementResponse.data.data?.length || 0);
      console.log('Settlements data structure:', Object.keys(settlementResponse.data));
    } catch (error) {
      console.log('❌ Settlements endpoint error:', error.response?.status, error.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ Authentication/API test failed:', error.response?.data || error.message);
    
    // Let's try to create some test data if we can't authenticate
    console.log('\n🔧 Attempting to create test data...');
    
    try {
      // Create a test IOU without authentication to see if endpoints work
      const testIOU = {
        title: 'Test IOU',
        amount: 100,
        description: 'Test IOU for analytics',
        category: 'EXPENSE',
        status: 'PENDING'
      };
      
      const createResponse = await axios.post(`${BASE_URL}/iou`, testIOU);
      console.log('✅ Test IOU created successfully');
    } catch (createError) {
      console.log('❌ Cannot create test data:', createError.response?.status, createError.response?.data?.message);
    }
  }
}

testAnalyticsWithAuth();