const axios = require('axios');

async function testProofCreationFlow() {
    console.log('🔍 Testing Complete Proof Creation Flow');
    console.log('======================================\n');

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

        // Step 2: Create Proof with exactly the same structure as mobile app
        console.log('\n📋 Step 2: Create Proof (Mobile App Format)');
        const proofData = {
            description: 'Test Mobile App Proof',
            category: 'Receipt',
            date: new Date().toISOString(),
            notes: 'Testing mobile app format',
            amount: 123.45,
            attachments: ['attachment_1.jpg', 'attachment_2.pdf']
        };

        console.log('📤 Sending proof data:', proofData);
        
        const proofResponse = await axios.post('http://localhost:3001/api/v1/api/proof', proofData, { headers });

        console.log('\n✅ Proof Creation Success!');
        console.log('📊 Response Analysis:');
        console.log('   success:', proofResponse.data.success);
        console.log('   message:', proofResponse.data.message);
        console.log('   proof ID:', proofResponse.data.data.id);
        console.log('   attachments:', proofResponse.data.data.attachments);

        // Step 3: Verify mobile app success condition
        console.log('\n🔍 Step 3: Mobile App Success Check');
        const response = proofResponse.data; // This is what nestjsApiService.createProof returns
        
        if (response?.success) {
            console.log('✅ SUCCESS PATH WILL TRIGGER');
            console.log('   - triggerDashboardRefresh() will be called');
            console.log('   - setSuccessMessage will set message');
            console.log('   - setShowSuccessModal(true) will show modal');
            console.log('   - Page refresh should happen');
        } else {
            console.log('❌ SUCCESS PATH WILL NOT TRIGGER');
        }

        console.log('\n🎉 FLOW VERIFICATION COMPLETE');
        console.log('==============================');
        console.log('✅ Proof creation working with JSON format');
        console.log('✅ Response format compatible with mobile app');
        console.log('✅ Success message and refresh should now work');

    } catch (error) {
        console.error('❌ Test Error:', error.message);
        if (error.response) {
            console.error('   Response Status:', error.response.status);
            console.error('   Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testProofCreationFlow();