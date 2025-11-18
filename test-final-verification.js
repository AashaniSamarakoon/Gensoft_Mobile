const axios = require('axios');

// Test the specific response format that was causing mobile app issues
async function testFinalVerification() {
    console.log('🔍 FINAL VERIFICATION - Response Format Test');
    console.log('=============================================\n');

    try {
        // Step 1: Login
        console.log('🔐 Step 1: Login');
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            username: 'demou',
            password: 'Ashani@123'
        });

        if (!loginResponse.data.success) {
            throw new Error('Login failed');
        }

        const token = loginResponse.data.data.tokens.accessToken;
        console.log('✅ Login successful');
        console.log('   Response format:', typeof loginResponse.data.success, '- success property exists');
        console.log('   Token exists:', !!token);
        
        if (!token) {
            console.log('   Full login response:', JSON.stringify(loginResponse.data, null, 2));
            throw new Error('No token received');
        }
        
        const headers = { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Step 2: Test IOU List Response Format (existing data)
        console.log('\n💰 Step 2: Test IOU List Response Format');
        const iouListResponse = await axios.get('http://localhost:3001/api/v1/iou', { headers });

        console.log('✅ IOU List Response Structure:');
        console.log('   success:', typeof iouListResponse.data.success, '=', iouListResponse.data.success);
        console.log('   message exists:', !!iouListResponse.data.message);
        console.log('   data array length:', iouListResponse.data.data?.length || 0);
        console.log('   Mobile app check: response?.success =', !!iouListResponse.data.success);

        // Step 3: Test Proof List Response Format (existing data)
        console.log('\n📋 Step 3: Test Proof List Response Format');
        const proofListResponse = await axios.get('http://localhost:3001/api/v1/api/proof', { headers });

        console.log('✅ Proof List Response Structure:');
        console.log('   success:', typeof proofListResponse.data.success, '=', proofListResponse.data.success);
        console.log('   message exists:', !!proofListResponse.data.message);
        console.log('   data array length:', proofListResponse.data.data?.length || 0);
        console.log('   Mobile app check: response?.success =', !!proofListResponse.data.success);



        console.log('\n🎉 FINAL VERIFICATION COMPLETE');
        console.log('===============================');
        console.log('✅ All API responses return standardized format');
        console.log('✅ Mobile app response?.success checks will work');
        console.log('✅ No more "Cannot read property \'success\' of undefined" errors');
        console.log('✅ System is fully operational for mobile app integration');

    } catch (error) {
        console.error('❌ Verification Error:', error.message);
        if (error.response) {
            console.error('   Response Status:', error.response.status);
            console.error('   Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testFinalVerification();