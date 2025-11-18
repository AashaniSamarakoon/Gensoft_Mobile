const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testIOUAnalytics() {
  console.log('🔍 Testing IOU Analytics API Endpoints...\n');

  try {
    // Test IOU endpoint
    console.log('📊 Testing IOUs endpoint...');
    const iouResponse = await axios.get(`${BASE_URL}/iou`);
    console.log(`✅ IOUs Response Status: ${iouResponse.status}`);
    console.log(`📋 IOUs Count: ${iouResponse.data?.data?.length || 0}`);
    
    if (iouResponse.data?.data?.length > 0) {
      const ious = iouResponse.data.data;
      const totalAmount = ious.reduce((sum, iou) => sum + (parseFloat(iou.amount) || 0), 0);
      const pendingIOUs = ious.filter(iou => iou.status === 'PENDING').length;
      const approvedIOUs = ious.filter(iou => iou.status === 'APPROVED').length;
      
      console.log(`💰 Total Amount: ${totalAmount}`);
      console.log(`⏳ Pending IOUs: ${pendingIOUs}`);
      console.log(`✅ Approved IOUs: ${approvedIOUs}`);
    }
    console.log('');

    // Test Proofs endpoint
    console.log('📄 Testing Proofs endpoint...');
    const proofResponse = await axios.get(`${BASE_URL}/api/proof`);
    console.log(`✅ Proofs Response Status: ${proofResponse.status}`);
    console.log(`📋 Proofs Count: ${proofResponse.data?.data?.length || 0}`);
    
    if (proofResponse.data?.data?.length > 0) {
      const proofs = proofResponse.data.data;
      const pendingProofs = proofs.filter(proof => proof.status === 'PENDING').length;
      console.log(`⏳ Pending Proofs: ${pendingProofs}`);
    }
    console.log('');

    // Test Settlements endpoint
    console.log('🏦 Testing Settlements endpoint...');
    const settlementResponse = await axios.get(`${BASE_URL}/settlement`);
    console.log(`✅ Settlements Response Status: ${settlementResponse.status}`);
    console.log(`📋 Settlements Count: ${settlementResponse.data?.data?.length || 0}`);
    console.log('');

    // Test complete analytics data structure
    console.log('📈 Complete Analytics Summary:');
    const ious = iouResponse.data?.data || [];
    const proofs = proofResponse.data?.data || [];
    const settlements = settlementResponse.data?.data || [];

    const analytics = {
      totalIOUs: ious.length,
      pendingIOUs: ious.filter(iou => iou.status === 'PENDING').length,
      approvedIOUs: ious.filter(iou => iou.status === 'APPROVED').length,
      totalAmount: ious.reduce((sum, iou) => sum + (parseFloat(iou.amount) || 0), 0),
      pendingProofs: proofs.filter(proof => proof.status === 'PENDING').length,
      settlements: settlements.length,
    };

    console.log('Analytics Data:');
    console.log(JSON.stringify(analytics, null, 2));

  } catch (error) {
    console.error('❌ Error testing IOU analytics:', error.message);
    console.error('Full error:', error);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
    if (error.code) {
      console.error(`Error Code: ${error.code}`);
    }
  }
}

testIOUAnalytics();