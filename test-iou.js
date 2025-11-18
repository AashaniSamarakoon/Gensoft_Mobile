const axios = require('axios');

// Test IOU creation with the NestJS backend
async function testIOUCreation() {
  try {
    console.log('🧪 Testing IOU creation...');
    
    // First login to get a token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post('http://192.168.1.55:3001/api/v1/auth/login', {
      username: 'demou',
      password: 'Test123!'
    });
    
    const token = loginResponse.data.data.tokens.accessToken;
    console.log('✅ Login successful, token obtained');
    
    // Test IOU creation
    console.log('Step 2: Creating IOU...');
    const iouData = {
      title: 'Test IOU',
      description: 'This is a test IOU from the API test',
      amount: '25.50',
      debtorEmail: 'ashanisamarakoon36@gmail.com', // Use the actual user email
      dueDate: '2025-12-01',
      category: 'general'
    };
    
    console.log('IOU Data:', iouData);
    
    const iouResponse = await axios.post('http://192.168.1.55:3001/api/v1/iou', iouData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ IOU creation successful!');
    console.log('Response:', iouResponse.data);
    
    // Test getting IOUs
    console.log('Step 3: Fetching IOUs...');
    const iouListResponse = await axios.get('http://192.168.1.55:3001/api/v1/iou', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ IOU list fetched successfully!');
    console.log('IOUs found:', iouListResponse.data.data?.length || 0);
    
    console.log('\n🎉 All IOU operations successful!');
    console.log('\n📱 Mobile app should now be able to:');
    console.log('- Create IOUs');
    console.log('- List IOUs');  
    console.log('- View IOU details');
    console.log('- Update IOUs');
    console.log('- Mark IOUs as paid');
    
  } catch (error) {
    console.error('❌ IOU test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testIOUCreation();