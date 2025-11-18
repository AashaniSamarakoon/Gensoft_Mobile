const axios = require('axios');

async function testProofResponseFormat() {
  try {
    console.log('🧪 Testing Proof response format...');
    
    // Get fresh token
    const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
      username: 'demou',
      password: 'Test123!'
    });
    
    const token = loginResponse.data.data.tokens.accessToken;
    console.log('✅ Fresh token obtained');
    
    // Test proof creation and examine response
    const proofData = {
      description: 'Response format test proof',
      date: '2025-11-14T12:00:00.000Z',
      category: 'Receipt',
      amount: '33.25',
      notes: 'Testing response format',
      attachments: ['test_file.jpg']
    };
    
    console.log('\n📡 Making request to /api/v1/api/proof...');
    
    const response = await axios.post('http://localhost:3001/api/v1/api/proof', proofData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response received!');
    console.log('Status:', response.status);
    console.log('Response structure:');
    console.log('- response.data type:', typeof response.data);
    console.log('- response.data keys:', Object.keys(response.data));
    console.log('- response.data.success:', response.data.success);
    console.log('\nFull response.data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check if it has a success property
    if (response.data.hasOwnProperty('success')) {
      console.log('\n✅ Response has "success" property:', response.data.success);
    } else {
      console.log('\n❌ Response does NOT have "success" property');
      console.log('Available properties:', Object.keys(response.data));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testProofResponseFormat();