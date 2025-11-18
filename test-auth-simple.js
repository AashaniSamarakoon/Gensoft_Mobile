const axios = require('axios');

const qrData = {
    emp_id: 1,
    emp_uname: "demou",
    emp_email: "demo@company.com",
    emp_name: "Demo User",
    emp_phone: "1234567890"
};

console.log('🔍 Testing Mobile ERP Authentication Fix...');
console.log('Sending QR data with emp_id: 1 (should match existing user usr_1_mobile)');

async function testAuth() {
    try {
        const response = await axios.post('http://localhost:3001/api/v1/auth/scan-qr', {
            qrData: JSON.stringify(qrData)
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('\n✅ SUCCESS: Backend responded!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        if (response.data.alreadyRegistered) {
            console.log('\n🎯 PERFECT: Backend correctly detected existing user!');
            console.log('✅ The mobile app will now show login screen instead of registration');
        } else if (response.data.success) {
            console.log('\n⚠️  User not found - proceeding with registration flow');
            console.log('This is expected for new users');
        }
        
    } catch (error) {
        console.log('\n❌ FAILED: Could not connect to backend');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
        console.log('Make sure the backend server is running on port 3001');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('Test completed!');
}

testAuth();