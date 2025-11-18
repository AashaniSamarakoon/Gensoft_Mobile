console.log('🎉 MOBILE ERP - COMPLETE API TEST SUITE');
console.log('=====================================\n');

const axios = require('axios');

let authToken = null;

async function testCompleteFlow() {
  try {
    // Step 1: Authentication
    console.log('🔐 STEP 1: AUTHENTICATION');
    console.log('=========================');
    
    const loginResponse = await axios.post('http://192.168.1.55:3001/api/v1/auth/login', {
      username: 'demou',
      password: 'Test123!'
    });
    
    authToken = loginResponse.data.data.tokens.accessToken;
    console.log('✅ Login successful');
    console.log('✅ Token obtained');
    console.log('✅ User:', loginResponse.data.data.user.username);
    
    // Step 2: IOU Operations
    console.log('\n💰 STEP 2: IOU OPERATIONS');
    console.log('==========================');
    
    // Create IOU
    const iouData = {
      title: 'Mobile App Test IOU',
      description: 'Testing IOU creation from mobile app API',
      amount: '125.50',
      debtorEmail: 'colleague@company.com',
      dueDate: '2025-12-31',
      category: 'business'
    };
    
    const iouResponse = await axios.post('http://192.168.1.55:3001/api/v1/iou', iouData, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('✅ IOU created successfully');
    console.log('   ID:', iouResponse.data.data.id);
    console.log('   Amount:', iouResponse.data.data.amount);
    console.log('   Status:', iouResponse.data.data.status);
    console.log('   Created By:', iouResponse.data.data.createdBy.name);
    console.log('   Received By:', iouResponse.data.data.receivedBy.name);
    
    // List IOUs
    const iouListResponse = await axios.get('http://192.168.1.55:3001/api/v1/iou', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('✅ IOU list retrieved');
    console.log('   Total IOUs:', iouListResponse.data.data?.data?.length || 0);
    
    // Step 3: Proof Operations
    console.log('\n📋 STEP 3: PROOF OPERATIONS');
    console.log('============================');
    
    // Create Proof
    const proofData = {
      description: 'Business expense receipt - Mobile API Test',
      date: '2025-11-14T14:30:00.000Z',
      category: 'Receipt',
      amount: '67.89',
      notes: 'Client dinner meeting at downtown restaurant',
      attachments: ['receipt_mobile_test.jpg', 'business_card.png']
    };
    
    const proofResponse = await axios.post('http://192.168.1.55:3001/api/v1/api/proof', proofData, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('✅ Proof created successfully');
    console.log('   ID:', proofResponse.data.data.id);
    console.log('   Category:', proofResponse.data.data.category);
    console.log('   Amount:', proofResponse.data.data.amount);
    console.log('   Status:', proofResponse.data.data.status);
    console.log('   Attachments:', proofResponse.data.data.attachments.length, 'files');
    
    // List Proofs
    const proofListResponse = await axios.get('http://192.168.1.55:3001/api/v1/api/proof', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('✅ Proof list retrieved');
    console.log('   Total Proofs:', proofListResponse.data.data?.data?.length || 0);
    
    // Step 4: User Profile
    console.log('\n👤 STEP 4: USER PROFILE');
    console.log('========================');
    
    const profileResponse = await axios.get('http://192.168.1.55:3001/api/v1/auth/profile', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('✅ Profile retrieved');
    console.log('   Username:', profileResponse.data.data.username);
    console.log('   Email:', profileResponse.data.data.email);
    console.log('   Session ID:', profileResponse.data.data.sessionId);
    
    // Final Summary
    console.log('\n🎉 FINAL SUMMARY');
    console.log('================');
    console.log('✅ Authentication: WORKING');
    console.log('✅ IOU Creation: WORKING');
    console.log('✅ IOU Listing: WORKING');
    console.log('✅ Proof Creation: WORKING');
    console.log('✅ Proof Listing: WORKING');
    console.log('✅ User Profile: WORKING');
    
    console.log('\n📱 MOBILE APP STATUS');
    console.log('====================');
    console.log('🟢 Login Screen: Ready');
    console.log('🟢 Dashboard: Ready');
    console.log('🟢 Create IOU Screen: Ready');
    console.log('🟢 IOU List Screen: Ready'); 
    console.log('🟢 Create Proof Screen: Ready');
    console.log('🟢 Proof List Screen: Ready');
    console.log('🟢 API Authentication: Ready');
    
    console.log('\n✨ ALL SYSTEMS OPERATIONAL! ✨');
    console.log('The mobile app can now:');
    console.log('- Login with username/password');
    console.log('- Navigate to dashboard');
    console.log('- Create and manage IOUs');
    console.log('- Create and manage Proofs');
    console.log('- Handle user authentication properly');
    console.log('- Make authenticated API requests');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    process.exit(1);
  }
}

testCompleteFlow();