// Test script to simulate the QR scan and show verification code clearly
const axios = require('axios');

async function testQRScan() {
  try {
    console.log('🔍 Testing QR Scan...');
    
    const response = await axios.post('http://192.168.1.55:3001/api/v1/auth/scan-qr', {
      qrData: 'eyJlbXBfaWQiOjEsImVtcF91bmFtZSI6ImRlbW91IiwiZW1wX3B3ZCI6IjEyMzQ1NiIsImVtcF9lbWFpbCI6ImFzaGFuaXNhbWFyYWtvb24zNkBnbWFpbC5jb20iLCJlbXBfbW9iaWxlX25vIjoiMDcwMzEwMTI0NCJ9'
    });
    
    console.log('\n✅ QR Scan Result:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data.verificationCode) {
      console.log('\n🔢 VERIFICATION CODE:', response.data.data.verificationCode);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testQRScan();