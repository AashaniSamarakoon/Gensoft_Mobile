const axios = require('axios');

async function testProofSubmission() {
    console.log('🔍 Testing Proof Submission Response Format');
    console.log('==========================================\n');

    try {
        // Step 1: Login
        console.log('🔐 Step 1: Login');
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            username: 'demou',
            password: 'Ashani@123'
        });

        const token = loginResponse.data.data.tokens.accessToken;
        console.log('✅ Login successful');
        
        const headers = { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Step 2: Test Proof Creation and Response
        console.log('\n📋 Step 2: Create Proof and Check Response');
        const proofResponse = await axios.post('http://localhost:3001/api/v1/api/proof', {
            description: 'Test Proof for Response Check',
            category: 'Receipt',
            date: new Date().toISOString(),
            amount: 55.55,
            notes: 'Testing response format',
            attachments: ['test-attachment.jpg']
        }, { headers });

        console.log('✅ Proof Creation Full Response:');
        console.log('   Full Response:', JSON.stringify(proofResponse.data, null, 2));
        console.log('\n📊 Response Analysis:');
        console.log('   response?.success:', !!proofResponse.data.success);
        console.log('   response.success:', proofResponse.data.success);
        console.log('   response?.data exists:', !!proofResponse.data.data);
        console.log('   typeof response:', typeof proofResponse.data);
        console.log('   Response keys:', Object.keys(proofResponse.data));

        if (proofResponse.data.success) {
            console.log('\n✅ SUCCESS PATH SHOULD TRIGGER');
            console.log('   - triggerDashboardRefresh() should be called');
            console.log('   - setSuccessMessage should set message');
            console.log('   - setShowSuccessModal(true) should show modal');
        } else {
            console.log('\n❌ SUCCESS PATH WILL NOT TRIGGER');
            console.log('   - Need to check why response.success is falsy');
        }

    } catch (error) {
        console.error('❌ Test Error:', error.message);
        if (error.response) {
            console.error('   Response Status:', error.response.status);
            console.error('   Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testProofSubmission();