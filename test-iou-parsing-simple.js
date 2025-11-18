// Simulate the exact same response structure and parsing that IOUHubScreen receives

// Mock response that matches the log output
const mockIOUResponse = {
  "data": {
    "data": [
      { id: "1", amount: "35.75", status: "PENDING" },
      { id: "2", amount: "50.00", status: "APPROVED" },
      { id: "3", amount: "25.50", status: "PENDING" }
    ],
    "pagination": { "limit": 10, "page": 1, "total": 3, "totalPages": 1 }
  },
  "success": true
};

console.log('🧪 Testing IOUHubScreen Parsing Logic...');
console.log('📋 Mock IOUs Response:', JSON.stringify(mockIOUResponse));

// Test the current parsing logic from IOUHubScreen
const ious = mockIOUResponse.data?.data || mockIOUResponse.data || [];

console.log('✅ Parsed IOUs:', ious.length);
console.log('📊 IOUs array:', ious);

// Test array operations
if (Array.isArray(ious)) {
  const totalAmount = ious.reduce((sum, iou) => sum + (parseFloat(iou.amount) || 0), 0);
  const pendingIOUs = ious.filter(iou => iou.status === 'PENDING').length;
  
  console.log('💰 Total Amount:', totalAmount);
  console.log('⏳ Pending IOUs:', pendingIOUs);
  console.log('✅ Array operations successful - no "map is not a function" errors');
} else {
  console.log('❌ IOUs is not an array:', typeof ious, ious);
}

console.log('\n' + '='.repeat(60));
console.log('🎯 PARSING LOGIC TEST RESULT:');
console.log('='.repeat(60));

if (Array.isArray(ious) && ious.length > 0) {
  console.log('✅ Parsing logic is CORRECT');
  console.log('✅ IOUHubScreen should work properly');
} else {
  console.log('❌ Parsing logic needs further fixing');
}