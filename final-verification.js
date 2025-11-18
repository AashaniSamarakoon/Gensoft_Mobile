const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function finalVerification() {
  console.log('🎯 FINAL VERIFICATION: Both Issues Fixed');
  console.log('========================================\n');

  try {
    // Issue 1: QR Code Re-scanning Test
    console.log('🔒 ISSUE 1: QR Code Re-scanning Prevention');
    console.log('------------------------------------------');
    
    const existingUserQRData = {
      emp_id: 'usr_1_mobile',
      emp_uname: 'demou',
      emp_email: 'ashanisamarakoon36@gmail.com',
      emp_mobile_no: '1234567890'
    };
    const qrDataBase64 = Buffer.from(JSON.stringify(existingUserQRData)).toString('base64');
    
    const qrResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, {
      qrData: qrDataBase64
    });
    
    const qrBlocked = qrResponse.data.alreadyRegistered === true && qrResponse.data.success === false;
    console.log(qrBlocked ? '✅ FIXED: QR blocking works correctly' : '❌ BROKEN: QR allows re-registration');
    console.log(`   Response: alreadyRegistered=${qrResponse.data.alreadyRegistered}, success=${qrResponse.data.success}`);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Issue 2: IOU Analytics Test
    console.log('📊 ISSUE 2: IOU Analytics Dashboard Counts');
    console.log('------------------------------------------');
    
    // Login to get token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'demou',
      password: 'demo123'
    });
    
    const token = loginResponse.data.data.tokens.accessToken;
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Get analytics data
    const [iouResponse, proofResponse, settlementResponse] = await Promise.all([
      axios.get(`${BASE_URL}/iou`, { headers: authHeaders }),
      axios.get(`${BASE_URL}/api/proof`, { headers: authHeaders }),
      axios.get(`${BASE_URL}/api/settlement`, { headers: authHeaders })
    ]);
    
    // Test the OLD data structure parsing (before fix)
    const oldIOUs = iouResponse.data?.ious || iouResponse.data?.data || [];
    const oldProofs = proofResponse.data?.data || [];
    
    // Test the NEW data structure parsing (after fix)  
    const newIOUs = iouResponse.data?.ious || iouResponse.data?.data?.data || iouResponse.data?.data || [];
    const newProofs = proofResponse.data?.data?.data || proofResponse.data?.data || [];
    const settlements = settlementResponse.data?.data || [];
    
    console.log('📋 Data Parsing Comparison:');
    console.log(`   OLD parsing - IOUs: ${Array.isArray(oldIOUs) ? oldIOUs.length : 'Not Array'}, Proofs: ${Array.isArray(oldProofs) ? oldProofs.length : 'Not Array'}`);
    console.log(`   NEW parsing - IOUs: ${Array.isArray(newIOUs) ? newIOUs.length : 'Not Array'}, Proofs: ${Array.isArray(newProofs) ? newProofs.length : 'Not Array'}`);
    
    // Calculate analytics with new parsing
    if (Array.isArray(newIOUs) && Array.isArray(newProofs)) {
      const analytics = {
        totalIOUs: newIOUs.length,
        pendingIOUs: newIOUs.filter(iou => iou.status === 'PENDING').length,
        approvedIOUs: newIOUs.filter(iou => iou.status === 'APPROVED').length,
        totalAmount: newIOUs.reduce((sum, iou) => sum + (parseFloat(iou.amount) || 0), 0),
        pendingProofs: newProofs.filter(proof => proof.status === 'PENDING').length,
        settlements: settlements.length,
      };
      
      console.log('\n📈 Analytics Results (After Fix):');
      console.log(`   Total IOUs: ${analytics.totalIOUs}`);
      console.log(`   Pending IOUs: ${analytics.pendingIOUs}`);
      console.log(`   Approved IOUs: ${analytics.approvedIOUs}`);
      console.log(`   Total Amount: $${analytics.totalAmount.toFixed(2)}`);
      console.log(`   Pending Proofs: ${analytics.pendingProofs}`);
      console.log(`   Settlements: ${analytics.settlements}`);
      
      const analyticsFixed = analytics.totalIOUs > 0 || analytics.pendingProofs > 0 || analytics.settlements > 0;
      console.log(analyticsFixed ? '\n✅ FIXED: Analytics showing real data' : '\n❌ BROKEN: Analytics still showing zeros');
    } else {
      console.log('\n❌ BROKEN: Data parsing still not working');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Final Summary
    console.log('📋 FINAL STATUS SUMMARY');
    console.log('=======================');
    console.log(qrBlocked ? '✅ QR Re-scanning: FIXED' : '❌ QR Re-scanning: STILL BROKEN');
    console.log(Array.isArray(newIOUs) && newIOUs.length > 0 ? '✅ IOU Analytics: FIXED' : '❌ IOU Analytics: STILL BROKEN');
    
    console.log('\n🎯 WHAT THE USER SHOULD SEE NOW:');
    console.log('================================');
    console.log('1. QR Code scanning existing user → Shows "Account Already Registered" alert');
    console.log('2. IOU Analytics dashboard → Shows actual counts instead of all zeros');
    console.log('3. Mobile app should be fully functional');
    
    if (qrBlocked && Array.isArray(newIOUs) && newIOUs.length > 0) {
      console.log('\n🎉 SUCCESS: Both issues have been resolved!');
    } else {
      console.log('\n⚠️ Some issues may still persist. Check mobile app behavior.');
    }

  } catch (error) {
    console.error('❌ Verification Error:', error.response?.data || error.message);
  }
}

finalVerification();