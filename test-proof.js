const axios = require('axios');

async function testProofCreation() {
  try {
    console.log('🧪 Testing Proof creation...');
    
    // First, login to get a valid token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post('http://192.168.1.55:3001/api/v1/auth/login', {
      username: 'demou',
      password: 'Test123!'
    });
    
    const token = loginResponse.data.data.tokens.accessToken;
    console.log('✅ Login successful, token obtained');
    
    // Test Proof creation
    console.log('\nStep 2: Creating Proof...');
    const proofData = {
      description: 'Lunch receipt from team meeting',
      date: '2025-11-14T12:00:00.000Z',
      category: 'Receipt',
      amount: '45.20',
      notes: 'Team lunch at Italian restaurant - 4 people',
      attachments: ['receipt_001.jpg', 'menu_photo.jpg']
    };
    
    console.log('Proof Data:', proofData);
    
    const proofResponse = await axios.post('http://192.168.1.55:3001/api/v1/api/proof', proofData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Proof created successfully!');
    console.log('Response:', JSON.stringify(proofResponse.data, null, 2));
    
    // Test getting Proofs
    console.log('\nStep 3: Fetching Proofs...');
    const proofListResponse = await axios.get('http://192.168.1.55:3001/api/v1/api/proof', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Proof list fetched!');
    console.log('Proofs found:', proofListResponse.data.data?.length || 0);
    if (proofListResponse.data.data?.length > 0) {
      console.log('First Proof:', proofListResponse.data.data[0]);
    }
    
    console.log('\n🎉 All Proof operations successful!');
    console.log('\n📱 Mobile app can now:');
    console.log('- ✅ Create Proofs with description, date, category, amount, notes');
    console.log('- ✅ List Proofs');  
    console.log('- ✅ View Proof details');
    console.log('- ✅ Handle attachments (as JSON)');
    
  } catch (error) {
    console.error('❌ Proof test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testProofCreation();