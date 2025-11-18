const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function createTestData() {
  console.log('🔧 Creating Test Data for IOU Analytics');
  console.log('======================================\n');

  try {
    // Login first
    console.log('🔐 Logging in to get auth token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'demou',
      password: 'demo123'
    });

    const token = loginResponse.data.data.tokens.accessToken;
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('✅ Login successful!\n');

    // Create test IOUs
    console.log('📝 Creating test IOUs...');
    
    const testIOUs = [
      {
        title: 'Office Supplies',
        amount: '250.00',
        description: 'Pens, papers, and stationery',
        category: 'OFFICE_SUPPLIES',
        debtorEmail: 'ashanisamarakoon36@gmail.com'
      },
      {
        title: 'Client Lunch',
        amount: '75.50',
        description: 'Business lunch with client',
        category: 'MEALS',
        debtorEmail: 'ashanisamarakoon36@gmail.com'
      },
      {
        title: 'Transportation',
        amount: '30.00',
        description: 'Taxi to client meeting',
        category: 'TRANSPORT',
        debtorEmail: 'ashanisamarakoon36@gmail.com'
      },
      {
        title: 'Software License',
        amount: '199.99',
        description: 'Annual software subscription',
        category: 'SOFTWARE',
        debtorEmail: 'ashanisamarakoon36@gmail.com'
      }
    ];

    for (let i = 0; i < testIOUs.length; i++) {
      try {
        const iouResponse = await axios.post(`${BASE_URL}/iou`, testIOUs[i], { headers: authHeaders });
        console.log(`✅ Created IOU ${i+1}: ${testIOUs[i].title} - $${testIOUs[i].amount}`);
      } catch (error) {
        console.log(`❌ Failed to create IOU ${i+1}:`, error.response?.data?.message || error.message);
      }
    }

    // Create test proofs
    console.log('\n📸 Creating test proofs...');
    
    const testProofs = [
      {
        title: 'Receipt for Office Supplies',
        description: 'Photo of purchase receipt',
        category: 'RECEIPT',
        date: new Date().toISOString()
      },
      {
        title: 'Travel Receipt',
        description: 'Taxi receipt',
        category: 'TRANSPORT',
        date: new Date().toISOString()
      }
    ];

    for (let i = 0; i < testProofs.length; i++) {
      try {
        const proofResponse = await axios.post(`${BASE_URL}/api/proof`, testProofs[i], { headers: authHeaders });
        console.log(`✅ Created Proof ${i+1}: ${testProofs[i].title}`);
      } catch (error) {
        console.log(`❌ Failed to create Proof ${i+1}:`, error.response?.data?.message || error.message);
      }
    }

    // Create test settlements
    console.log('\n🏦 Creating test settlements...');
    
    const testSettlements = [
      {
        title: 'Monthly Expense Settlement',
        description: 'Settlement for approved expenses',
        payee: 'John Doe',
        refNo: 'SET-001',
        iouAmount: 275.49,
        utilized: 275.49
      }
    ];

    for (let i = 0; i < testSettlements.length; i++) {
      try {
        const settlementResponse = await axios.post(`${BASE_URL}/api/settlement`, testSettlements[i], { headers: authHeaders });
        console.log(`✅ Created Settlement ${i+1}: ${testSettlements[i].title} - $${testSettlements[i].amount}`);
      } catch (error) {
        console.log(`❌ Failed to create Settlement ${i+1}:`, error.response?.data?.message || error.message);
      }
    }

    // Now test the analytics again
    console.log('\n📊 Testing analytics with new data...');
    
    const iouResponse = await axios.get(`${BASE_URL}/iou`, { headers: authHeaders });
    const proofResponse = await axios.get(`${BASE_URL}/api/proof`, { headers: authHeaders });  
    const settlementResponse = await axios.get(`${BASE_URL}/api/settlement`, { headers: authHeaders });

    console.log('IOU Response:', JSON.stringify(iouResponse.data, null, 2));
    console.log('Proof Response:', JSON.stringify(proofResponse.data, null, 2));
    console.log('Settlement Response:', JSON.stringify(settlementResponse.data, null, 2));

    const ious = Array.isArray(iouResponse.data.data) ? iouResponse.data.data : 
                 Array.isArray(iouResponse.data.ious) ? iouResponse.data.ious : [];
    const proofs = Array.isArray(proofResponse.data.data) ? proofResponse.data.data : [];
    const settlements = Array.isArray(settlementResponse.data.data) ? settlementResponse.data.data : [];

    const analytics = {
      totalIOUs: ious.length,
      pendingIOUs: ious.filter(iou => iou.status === 'PENDING').length,
      approvedIOUs: ious.filter(iou => iou.status === 'APPROVED').length,
      totalAmount: ious.reduce((sum, iou) => sum + (parseFloat(iou.amount) || 0), 0),
      pendingProofs: proofs.filter(proof => proof.status === 'PENDING').length,
      settlements: settlements.length,
    };

    console.log('\n📈 Analytics Results:');
    console.log('====================');
    console.log(`Total IOUs: ${analytics.totalIOUs}`);
    console.log(`Pending IOUs: ${analytics.pendingIOUs}`);
    console.log(`Approved IOUs: ${analytics.approvedIOUs}`);
    console.log(`Total Amount: $${analytics.totalAmount.toFixed(2)}`);
    console.log(`Pending Proofs: ${analytics.pendingProofs}`);
    console.log(`Settlements: ${analytics.settlements}`);

    if (analytics.totalIOUs > 0) {
      console.log('\n✅ SUCCESS: Test data created! Analytics should now show data in the mobile app.');
    } else {
      console.log('\n❌ Data creation may have failed');
    }

  } catch (error) {
    console.error('❌ Error creating test data:', error.response?.data || error.message);
  }
}

createTestData();