// Test script to check frontend logout API call
const MOBILE_BACKEND_URL = process.env.REACT_APP_MOBILE_BACKEND_URL || 'http://localhost:4000';

console.log('🔗 Testing frontend logout URL construction...');
console.log('MOBILE_BACKEND_URL:', MOBILE_BACKEND_URL);

const logoutUrl = `${MOBILE_BACKEND_URL}/api/auth/logout`;
console.log('Constructed logout URL:', logoutUrl);

// Test the URL
const fetch = require('node-fetch');

async function testLogoutUrl() {
  try {
    const response = await fetch(logoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'uex2satto0fuqirb5bg1gv8e',
        email: 'ashanisamarakoon36@gmail.com',
        employeeId: '3'
      })
    });

    const result = await response.json();
    console.log('✅ Logout URL test result:', response.status, result.success ? 'SUCCESS' : 'FAILED');
  } catch (error) {
    console.log('❌ Logout URL test failed:', error.message);
  }
}

testLogoutUrl();