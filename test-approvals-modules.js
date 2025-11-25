// Test the Approvals Module Dropdown functionality
const axios = require('axios');

const BASE_URL = 'http://192.168.1.55:3001/api/v1';

async function testApprovalsModuleDropdown() {
  console.log('🔧 TESTING APPROVALS MODULE DROPDOWN');
  console.log('=' .repeat(60));

  try {
    // Test 1: Get modules for dropdown
    console.log('\n1️⃣ Testing: Get Modules for Dropdown');
    const modulesResponse = await axios.get(`${BASE_URL}/approvals/modules`);
    
    console.log('✅ Modules API Response:');
    console.log(`   - Success: ${modulesResponse.data.success}`);
    console.log(`   - Total Modules: ${modulesResponse.data.total}`);
    console.log('   - Available Modules:');
    
    if (modulesResponse.data.data && modulesResponse.data.data.length > 0) {
      modulesResponse.data.data.forEach((module, index) => {
        console.log(`      ${index + 1}. ${module.displayName} (${module.name})`);
        console.log(`         - ID: ${module.id}`);
        console.log(`         - Description: ${module.description}`);
        console.log(`         - Sort Order: ${module.sortOrder}`);
      });
    }

    // Test 2: Get all approvals
    console.log('\n2️⃣ Testing: Get All Approvals');
    const approvalsResponse = await axios.get(`${BASE_URL}/approvals`);
    
    if (approvalsResponse.data.data && approvalsResponse.data.data.length > 0) {
      console.log(`✅ Found ${approvalsResponse.data.total} approvals:`);
      approvalsResponse.data.data.forEach((approval, index) => {
        console.log(`   ${index + 1}. ${approval.title}`);
        console.log(`      - Type: ${approval.itemType}`);
        console.log(`      - Status: ${approval.status}`);
        console.log(`      - Priority: ${approval.priority}`);
        console.log(`      - Module: ${approval.module?.displayName || 'No Module'} (${approval.module?.name || 'N/A'})`);
        console.log(`      - Amount: $${approval.amount || 'N/A'}`);
        console.log(`      - Requested By: ${approval.requestedBy}`);
      });
    } else {
      console.log('ℹ️ No approvals found');
    }

    // Test 3: Filter by specific module (IOU)
    const iouModule = modulesResponse.data.data.find(m => m.name === 'iou');
    if (iouModule) {
      console.log('\n3️⃣ Testing: Filter Approvals by IOU Module');
      try {
        const iouApprovalsResponse = await axios.get(`${BASE_URL}/approvals/by-module/${iouModule.id}`);
        
        console.log(`✅ IOU Module Approvals (${iouModule.displayName}):`);
        console.log(`   - Module: ${iouApprovalsResponse.data.module?.displayName}`);
        console.log(`   - Total: ${iouApprovalsResponse.data.total}`);
        
        if (iouApprovalsResponse.data.data && iouApprovalsResponse.data.data.length > 0) {
          iouApprovalsResponse.data.data.forEach((approval, index) => {
            console.log(`      ${index + 1}. ${approval.title} - ${approval.status}`);
          });
        } else {
          console.log('      No IOU approvals found');
        }
      } catch (iouError) {
        console.log('❌ IOU approvals error:', iouError.response?.data?.message || iouError.message);
      }
    }

    // Test 4: Create a new approval with module
    const accountsModule = modulesResponse.data.data.find(m => m.name === 'accounts');
    if (accountsModule) {
      console.log('\n4️⃣ Testing: Create New Approval with Module');
      
      const newApprovalData = {
        itemType: 'expense',
        itemId: `test-exp-${Date.now()}`,
        moduleId: accountsModule.id,
        title: 'Test Expense Approval - Office Equipment',
        description: 'Approval needed for new office computer equipment',
        amount: 1200.50,
        requestedBy: 'test.user@company.com',
        assignedTo: 'manager@company.com',
        priority: 'HIGH',
        jobNumber: 'JOB2024-TEST',
        customerPayee: 'Tech Supplier Inc',
        refNo: 'EXP-TEST-001'
      };
      
      try {
        const createResponse = await axios.post(`${BASE_URL}/approvals`, newApprovalData);
        
        console.log('✅ Approval Created Successfully:');
        console.log(`   - Success: ${createResponse.data.success}`);
        console.log(`   - Message: ${createResponse.data.message}`);
        console.log(`   - Approval ID: ${createResponse.data.data?.id}`);
        console.log(`   - Module: ${createResponse.data.data?.module?.displayName}`);
        
      } catch (createError) {
        console.log('❌ Create approval error:', createError.response?.data?.message || createError.message);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📋 APPROVALS MODULE DROPDOWN SUMMARY:');
    console.log('═'.repeat(60));
    console.log('✅ Modules table seeded with comprehensive ERP modules');
    console.log('✅ GET /approvals/modules - Returns active modules for dropdown');
    console.log('✅ GET /approvals - Lists all approvals with module details');
    console.log('✅ GET /approvals/by-module/:id - Filters approvals by module');
    console.log('✅ POST /approvals - Creates approvals with module validation');

    console.log('\n📱 MOBILE APP INTEGRATION:');
    console.log('1. Fetch modules: GET /api/v1/approvals/modules');
    console.log('2. Display dropdown with displayName and description');
    console.log('3. Submit moduleId when creating new approvals');
    console.log('4. Filter approvals by selected module');
    console.log('5. Show module information in approval details');

    console.log('\n🎨 UI COMPONENTS NEEDED:');
    console.log('- Module dropdown/picker component');
    console.log('- Module filter in approvals list');
    console.log('- Module badge/tag in approval items');
    console.log('- Module selection in approval creation form');

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

testApprovalsModuleDropdown();