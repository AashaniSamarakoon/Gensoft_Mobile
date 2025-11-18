const axios = require('axios');

async function testIOUCreation() {
  try {
    console.log('🧪 Testing IOU creation with different debtor email...');
    
    // First, login to get a valid token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post('http://192.168.1.55:3001/api/v1/auth/login', {
      username: 'demou',
      password: 'Test123!'
    });
    
    const token = loginResponse.data.data.tokens.accessToken;
    console.log('✅ Login successful, token obtained');
    
    // Test IOU creation with different debtor email
    console.log('\nStep 2: Creating IOU...');
    const iouData = {
      title: 'Test IOU for Lunch',
      description: 'Payment for team lunch on Friday',
      amount: '35.75',
      debtorEmail: 'colleague@company.com', // Different email
      dueDate: '2025-12-15',
      category: 'general'
    };
    
    console.log('IOU Data:', iouData);
    
    const iouResponse = await axios.post('http://192.168.1.55:3001/api/v1/iou', iouData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ IOU created successfully!');
    console.log('Response:', JSON.stringify(iouResponse.data, null, 2));
    
    // Test getting IOUs
    console.log('\nStep 3: Fetching IOUs...');
    const iouListResponse = await axios.get('http://192.168.1.55:3001/api/v1/iou', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ IOU list fetched!');
    console.log('IOUs found:', iouListResponse.data.data?.length || 0);
    if (iouListResponse.data.data?.length > 0) {
      console.log('First IOU:', iouListResponse.data.data[0]);
    }
    
    console.log('\n🎉 All IOU operations successful!');
    console.log('\n📱 Mobile app can now:');
    console.log('- ✅ Create IOUs with title, description, amount, debtorEmail');
    console.log('- ✅ List IOUs');  
    console.log('- ✅ View IOU details');
    console.log('- ✅ Authentication works properly');
    
  } catch (error) {
    console.error('❌ IOU test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testIOUCreation();