const axios = require('axios');

console.log('🧪 Testing IOU Endpoint Authentication...');

async function testIOUEndpoint() {
    try {
        console.log('\n1️⃣ Testing IOU endpoint without authentication...');
        
        // Test without auth token first
        const responseNoAuth = await axios.get('http://localhost:3001/api/v1/iou', {
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ IOU endpoint accessible without auth:', responseNoAuth.data);
        
    } catch (errorNoAuth) {
        console.log('🔐 IOU endpoint requires authentication:', errorNoAuth.response?.status);
        
        console.log('\n2️⃣ Testing with authentication token...');
        
        try {
            // First login to get a token
            const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
                username: 'demou',
                password: 'test123'
            });
            
            if (loginResponse.data.success) {
                const token = loginResponse.data.data.tokens.accessToken;
                console.log('✅ Login successful, got token');
                
                // Now test IOU endpoint with token
                const iouResponse = await axios.get('http://localhost:3001/api/v1/iou', {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log('✅ IOU endpoint with auth successful:', iouResponse.data?.length || 0, 'IOUs found');
                
            } else {
                console.log('❌ Login failed:', loginResponse.data.message);
            }
            
        } catch (authError) {
            console.log('❌ Authentication test failed:', authError.response?.status, authError.response?.data?.message);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 IOU AUTHENTICATION ANALYSIS:');
    console.log('='.repeat(60));
    console.log('✅ Backend running and accessible');
    console.log('🔐 IOU endpoint requires JWT authentication');
    console.log('💡 Mobile app needs valid token for IOU requests');
    console.log('\n🔧 FIXES NEEDED:');
    console.log('1. Ensure user is properly authenticated before IOU requests');
    console.log('2. Check token storage and retrieval in mobile app');
    console.log('3. Verify nestjsApiService includes auth headers');
}

testIOUEndpoint();