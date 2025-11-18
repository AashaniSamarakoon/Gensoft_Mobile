const axios = require('axios');

async function testQRCodeBlocking() {
    console.log('🔍 Testing QR Code Re-scan Blocking');
    console.log('==================================\n');

    try {
        // Create QR data for an existing user (demou)
        const existingUserQRData = {
            emp_id: 'usr_1_mobile', // This is demou's mainErpUserId
            emp_uname: 'demou',
            emp_email: 'ashanisamarakoon36@gmail.com',
            emp_mobile_no: '1234567890'
        };
        const qrDataBase64 = Buffer.from(JSON.stringify(existingUserQRData)).toString('base64');
        
        console.log('📱 Step 1: Scanning QR for already registered user');
        console.log('User ID:', existingUserQRData.emp_id);
        console.log('Username:', existingUserQRData.emp_uname);
        console.log('Email:', existingUserQRData.emp_email);
        
        const qrScanResponse = await axios.post('http://localhost:3001/api/v1/auth/scan-qr', {
            qrData: qrDataBase64
        });

        console.log('\n📊 QR Scan Response Analysis:');
        console.log('Success:', qrScanResponse.data.success);
        console.log('Already Registered:', qrScanResponse.data.alreadyRegistered);
        console.log('Message:', qrScanResponse.data.message);
        
        if (qrScanResponse.data.alreadyRegistered) {
            console.log('\n✅ SUCCESS: QR code properly blocked!');
            console.log('   Returned user data:', qrScanResponse.data.data);
            console.log('   Mobile app should show: "Account already registered" message');
            console.log('   User should be redirected to login screen');
        } else if (qrScanResponse.data.success) {
            console.log('\n❌ FAILURE: QR code was NOT blocked!');
            console.log('   System allowed re-registration of existing user');
            console.log('   This is a security issue that needs fixing');
        } else {
            console.log('\n⚠️  UNEXPECTED: Different error occurred');
            console.log('   Response:', JSON.stringify(qrScanResponse.data, null, 2));
        }

        // Test with new user QR code to ensure normal flow still works
        console.log('\n📱 Step 2: Testing QR for new user (should work)');
        const newUserQRData = {
            emp_id: 'NEW_USER_123',
            emp_uname: 'newuser',
            emp_email: 'newuser@example.com',
            emp_mobile_no: '9876543210'
        };
        const newUserQRBase64 = Buffer.from(JSON.stringify(newUserQRData)).toString('base64');
        
        const newUserScanResponse = await axios.post('http://localhost:3001/api/v1/auth/scan-qr', {
            qrData: newUserQRBase64
        });

        console.log('\n📊 New User QR Response:');
        console.log('Success:', newUserScanResponse.data.success);
        console.log('Skip Verification:', newUserScanResponse.data.skipVerification);
        
        if (newUserScanResponse.data.success) {
            console.log('✅ New user QR scan working correctly');
        } else {
            console.log('❌ New user QR scan failed:', newUserScanResponse.data.message);
        }

        console.log('\n🎉 QR CODE BLOCKING TEST SUMMARY');
        console.log('================================');
        console.log(qrScanResponse.data.alreadyRegistered ? '✅' : '❌', 'Existing user QR blocked:', qrScanResponse.data.alreadyRegistered);
        console.log(newUserScanResponse.data.success ? '✅' : '❌', 'New user QR allowed:', newUserScanResponse.data.success);

    } catch (error) {
        console.error('❌ Test Error:', error.message);
        if (error.response) {
            console.error('   Response Status:', error.response.status);
            console.error('   Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testQRCodeBlocking();