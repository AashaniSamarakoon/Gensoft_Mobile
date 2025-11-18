const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testSpecificQR() {
  console.log('🧪 TESTING SPECIFIC QR DATA FROM MOBILE APP');
  console.log('===========================================\n');

  try {
    // This is the exact QR data from the mobile app logs
    const qrDataFromMobileApp = 'eyJlbXBfaWQiOjEsImVtcF91bmFtZSI6ImRlbW91IiwiZW1wX3B3ZCI6IjEyMzQ1NiIsImVtcF9lbWFpbCI6ImFzaGFuaXNhbWFyYWtvb24zNkBnbWFpbC5jb20iLCJlbXBfbW9iaWxlX25vIjoiMDcwMzEwMTI0NCJ9';
    
    console.log('📱 QR Data from mobile app:', qrDataFromMobileApp);
    
    // Decode it to see what it contains
    const decodedData = JSON.parse(Buffer.from(qrDataFromMobileApp, 'base64').toString());
    console.log('📋 Decoded QR data:', JSON.stringify(decodedData, null, 2));
    
    console.log('\n🔍 Testing QR scan with this exact data...');
    const scanResponse = await axios.post(`${BASE_URL}/auth/scan-qr`, {
      qrData: qrDataFromMobileApp
    });
    
    console.log('QR Scan Result:');
    console.log('  Success:', scanResponse.data.success);
    console.log('  Already Registered:', scanResponse.data.alreadyRegistered);
    console.log('  Message:', scanResponse.data.message);
    console.log('  Full Response:', JSON.stringify(scanResponse.data, null, 2));
    
    if (scanResponse.data.alreadyRegistered) {
      console.log('✅ CORRECT: QR scan should detect existing user');
    } else if (scanResponse.data.success) {
      console.log('❌ PROBLEM: QR scan should have detected existing user but allowed registration instead');
      console.log('This explains why the mobile app proceeds to email verification!');
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error('Message:', error.message);
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
  }
}

testSpecificQR();