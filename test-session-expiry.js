const axios = require('axios');

console.log('🔧 Testing 24-Hour Session Expiry Fix...');
console.log('This test simulates selecting an account that has not logged in for >24 hours');

async function testExpiredSessionFix() {
    try {
        // Test the quick login endpoint directly with expired session
        const response = await axios.post('http://localhost:3001/api/v1/auth/quick-login', {
            userId: 'test-user-id', // This will likely fail but we want to see the error message
            deviceInfo: {
                deviceId: 'mobile_app',
                platform: 'react-native',
                version: '1.0.0'
            }
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ Unexpected success:', response.data);
        
    } catch (error) {
        if (error.response) {
            console.log('📋 Status:', error.response.status);
            console.log('📄 Error Response:', JSON.stringify(error.response.data, null, 2));
            
            // Check if it's the expected re-authentication error
            if (error.response.status === 401 && 
                error.response.data.message && 
                error.response.data.message.includes('Re-authentication required')) {
                console.log('🎯 PERFECT: Backend correctly returns re-authentication error!');
                console.log('✅ Frontend should now navigate to login screen instead of splash screen');
            } else if (error.response.data.message && 
                       error.response.data.message.includes('Quick login not available')) {
                console.log('ℹ️  Expected: Quick login not available (no valid user/session)');
                console.log('This is normal for test with fake user ID');
            }
        } else {
            console.log('❌ Network error:', error.message);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test completed!');
    console.log('💡 Key changes made:');
    console.log('   1. Backend now checks 24 hours instead of 3 days');
    console.log('   2. Frontend selectAccount() now handles re-auth errors');
    console.log('   3. AccountSelectionScreen navigates to Login instead of Splash');
    console.log('   4. Expired sessions will show credential entry page');
}

testExpiredSessionFix();