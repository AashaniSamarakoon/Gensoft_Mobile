const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/v1';

// Test configuration
const testUserId = 'cmhyf73ur00007kl8k9cge5mp';
const testDeviceId = 'test-device-fix';
const testEmail = 'test-fix@example.com';

async function testQuickLoginFix() {
    console.log('🔧 Testing Quick Login Fix - Step by Step');
    console.log('=' .repeat(50));
    
    try {
        // Step 1: Create a fresh user through complete registration flow
        console.log('\n1️⃣ Creating Fresh Test User');
        console.log('-'.repeat(30));
        
        // Scan QR
        const qrResponse = await axios.post(`${API_BASE_URL}/auth/scan-qr`, {
            qrData: JSON.stringify({
                email: testEmail,
                deviceId: testDeviceId,
                timestamp: Date.now()
            })
        });
        console.log('✅ QR Scanned:', qrResponse.data.message);
        
        // Verify email (simulate user entering verification code)
        // For testing, let's use a mock verification code
        try {
            const emailResponse = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
                email: testEmail,
                verificationCode: '123456', // Mock code
                deviceId: testDeviceId
            });
            console.log('✅ Email verified:', emailResponse.data.message);
        } catch (emailError) {
            console.log('⚠️ Email verification (expected):', emailError.response?.data?.message || 'Need real code');
        }
        
        // Set password
        try {
            const passwordResponse = await axios.post(`${API_BASE_URL}/auth/set-mobile-password`, {
                email: testEmail,
                password: 'test123',
                deviceId: testDeviceId
            });
            console.log('✅ Password set:', passwordResponse.data.message);
        } catch (passwordError) {
            console.log('⚠️ Password setting:', passwordError.response?.data?.message);
        }
        
        // Login
        try {
            const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
                email: testEmail,
                password: 'test123',
                deviceId: testDeviceId
            });
            console.log('✅ Login successful:', loginResponse.data.message);
            
            const newUserId = loginResponse.data.user?.id;
            if (newUserId) {
                console.log('📝 New User ID:', newUserId);
                
                // Test quick login with fresh active user
                console.log('\n2️⃣ Testing Quick Login with Active User');
                console.log('-'.repeat(30));
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const quickLoginResponse = await axios.post(`${API_BASE_URL}/auth/quick-login`, {
                    userId: newUserId,
                    deviceId: testDeviceId
                });
                
                console.log('✅ Quick login successful:', quickLoginResponse.data.message);
                console.log('📋 User details:', quickLoginResponse.data.user);
                
                // Test logout and QR scan
                console.log('\n3️⃣ Testing Logout and QR Re-registration');
                console.log('-'.repeat(30));
                
                await axios.post(`${API_BASE_URL}/auth/logout`, {
                    userId: newUserId,
                    deviceId: testDeviceId
                });
                console.log('✅ Logout successful');
                
                // Test QR scan after logout
                const qrAfterLogout = await axios.post(`${API_BASE_URL}/auth/scan-qr`, {
                    qrData: JSON.stringify({
                        email: `new-${testEmail}`,
                        deviceId: `new-${testDeviceId}`,
                        timestamp: Date.now()
                    })
                });
                console.log('✅ QR scan after logout successful:', qrAfterLogout.data.message);
                
                // Test recovery with inactive user
                console.log('\n4️⃣ Testing Recovery with Inactive User ID');
                console.log('-'.repeat(30));
                
                const recoveryResponse = await axios.post(`${API_BASE_URL}/auth/recover-session`, {
                    userId: testUserId, // The original failing user ID
                    deviceId: 'recovery-device'
                });
                console.log('📋 Recovery response:', recoveryResponse.data);
                
            }
            
        } catch (loginError) {
            console.log('❌ Login failed:', loginError.response?.data?.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 Quick Login Fix Test Complete');
}

testQuickLoginFix();