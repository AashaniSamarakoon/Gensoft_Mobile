const express = require('express');
const axios = require('axios');

// Test data that matches mobile app QR format
const mobileAppQRData = {
  emp_id: 1,
  emp_uname: "demou",
  emp_email: "demo@company.com",
  emp_name: "Demo User",
  emp_phone: "1234567890"
};

// Test function
async function testAuthFix() {
  console.log('🔍 Testing Authentication Fix for Mobile App QR Format');
  console.log('='.repeat(60));
  
  try {
    console.log('\n📱 Mobile App QR Data:');
    console.log(JSON.stringify(mobileAppQRData, null, 2));
    
    console.log('\n🔄 Sending QR scan request to backend...');
    
    const response = await axios.post('http://localhost:3001/api/v1/auth/scan-qr', {
      qrData: JSON.stringify(mobileAppQRData)
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Backend Response:');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.alreadyRegistered) {
      console.log('\n🎯 SUCCESS: Backend correctly detected existing user!');
      console.log('✅ Fixed: Mobile app should now show login screen instead of registration');
    } else if (response.data.success && !response.data.alreadyRegistered) {
      console.log('\n📝 User not found - proceeding with registration flow');
      console.log('This is expected for new users');
    }
    
  } catch (error) {
    console.error('\n❌ Error testing auth fix:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the backend server running on port 3001?');
      console.error('Please run: npm run start:dev');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await axios.get('http://localhost:3001/api/v1/auth/health');
    console.log('✅ Backend server is running');
    return true;
  } catch (error) {
    console.log('❌ Backend server is not running on port 3001');
    console.log('Please start the server with: npm run start:dev');
    return false;
  }
}

async function main() {
  console.log('🚀 Mobile ERP Authentication Fix Test');
  console.log('=====================================\n');
  
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testAuthFix();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Test completed!');
}

main().catch(console.error);