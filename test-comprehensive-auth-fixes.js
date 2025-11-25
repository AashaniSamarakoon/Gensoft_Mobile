const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/v1';

// Test configuration
const testUserId = 'cmhyf73ur00007kl8k9cge5mp'; // The user ID that was failing
const testDeviceId = 'test-device-comprehensive';
const testEmail = 'test-comprehensive@example.com';

async function testComprehensiveAuthFixes() {
    console.log('🧪 Starting Comprehensive Authentication Fixes Test');
    console.log('=' .repeat(60));
    
    try {
        // Test 1: Test the new recover-session endpoint
        console.log('\n1️⃣ Testing Recover Session Endpoint');
        console.log('-'.repeat(40));
        
        try {
            const recoverResponse = await axios.post(`${API_BASE_URL}/auth/recover-session`, {
                userId: testUserId,
                deviceId: testDeviceId
            });
            
            console.log('✅ Recover session endpoint working');
            console.log('Response:', recoverResponse.data);
        } catch (error) {
            console.log('⚠️ Recover session response:', error.response?.data || error.message);
        }
        
        // Test 2: Test enhanced quick login with the failing user ID
        console.log('\n2️⃣ Testing Enhanced Quick Login');
        console.log('-'.repeat(40));
        
        try {
            const quickLoginResponse = await axios.post(`${API_BASE_URL}/auth/quick-login`, {
                userId: testUserId,
                deviceId: testDeviceId
            });
            
            console.log('✅ Quick login successful!');
            console.log('Response:', quickLoginResponse.data);
        } catch (error) {
            console.log('❌ Quick login failed:', error.response?.data || error.message);
            console.log('Status:', error.response?.status);
            
            // Test the mobile app's automatic recovery logic
            if (error.response?.status === 401) {
                console.log('\n🔄 Testing Automatic Recovery (Mobile App Logic)');
                try {
                    const recoveryResponse = await axios.post(`${API_BASE_URL}/auth/recover-session`, {
                        userId: testUserId,
                        deviceId: testDeviceId
                    });
                    
                    console.log('✅ Auto-recovery successful:', recoveryResponse.data);
                    
                    // Try quick login again after recovery
                    console.log('🔄 Retrying quick login after recovery...');
                    const retryResponse = await axios.post(`${API_BASE_URL}/auth/quick-login`, {
                        userId: testUserId,
                        deviceId: testDeviceId
                    });
                    
                    console.log('✅ Quick login retry successful:', retryResponse.data);
                } catch (recoveryError) {
                    console.log('❌ Auto-recovery failed:', recoveryError.response?.data || recoveryError.message);
                }
            }
        }
        
        // Test 3: Test QR scan functionality (should work after logout)
        console.log('\n3️⃣ Testing QR Scan After Logout');
        console.log('-'.repeat(40));
        
        try {
            // First logout to test the original issue
            const logoutResponse = await axios.post(`${API_BASE_URL}/auth/logout`, {
                userId: testUserId,
                deviceId: testDeviceId
            });
            
            console.log('✅ Logout successful');
            
            // Now test QR scan (should not show "already exists")
            const qrScanResponse = await axios.post(`${API_BASE_URL}/auth/scan-qr`, {
                qrData: JSON.stringify({
                    email: testEmail,
                    deviceId: testDeviceId,
                    timestamp: Date.now()
                })
            });
            
            console.log('✅ QR scan successful after logout!');
            console.log('Response:', qrScanResponse.data);
            
        } catch (error) {
            console.log('❌ QR scan test failed:', error.response?.data || error.message);
        }
        
        // Test 4: Test complete authentication flow
        console.log('\n4️⃣ Testing Complete Authentication Flow');
        console.log('-'.repeat(40));
        
        try {
            // Step 1: Scan QR
            const qrResponse = await axios.post(`${API_BASE_URL}/auth/scan-qr`, {
                qrData: JSON.stringify({
                    email: testEmail,
                    deviceId: `${testDeviceId}-flow`,
                    timestamp: Date.now()
                })
            });
            console.log('✅ QR Scan:', qrResponse.data.message);
            
            // Step 2: Verify email
            const emailResponse = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
                email: testEmail,
                deviceId: `${testDeviceId}-flow`
            });
            console.log('✅ Email verification:', emailResponse.data.message);
            
            // Step 3: Set password (if user exists)
            try {
                const passwordResponse = await axios.post(`${API_BASE_URL}/auth/set-mobile-password`, {
                    email: testEmail,
                    password: 'test123',
                    deviceId: `${testDeviceId}-flow`
                });
                console.log('✅ Password set:', passwordResponse.data.message);
                
                // Step 4: Login
                const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
                    email: testEmail,
                    password: 'test123',
                    deviceId: `${testDeviceId}-flow`
                });
                console.log('✅ Login successful:', loginResponse.data.message);
                
                // Step 5: Test quick login with new session
                setTimeout(async () => {
                    try {
                        const newQuickLogin = await axios.post(`${API_BASE_URL}/auth/quick-login`, {
                            userId: loginResponse.data.user?.id || testUserId,
                            deviceId: `${testDeviceId}-flow`
                        });
                        console.log('✅ Quick login with new session:', newQuickLogin.data.message);
                    } catch (err) {
                        console.log('⚠️ Quick login with new session:', err.response?.data || err.message);
                    }
                }, 1000);
                
            } catch (error) {
                console.log('⚠️ Password/Login step:', error.response?.data?.message || error.message);
            }
            
        } catch (error) {
            console.log('❌ Complete flow test failed:', error.response?.data || error.message);
        }
        
        // Test 5: Server health check
        console.log('\n5️⃣ Testing Server Health');
        console.log('-'.repeat(40));
        
        try {
            const healthResponse = await axios.get(`${API_BASE_URL}/auth/health`);
            console.log('✅ Server health:', healthResponse.data);
        } catch (error) {
            console.log('❌ Health check failed:', error.response?.data || error.message);
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Comprehensive Authentication Test Complete!');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testComprehensiveAuthFixes();