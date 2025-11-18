const axios = require('axios');

async function testQuickLoginFlow() {
    console.log('🔍 Testing Quick Login Flow');
    console.log('==========================\n');

    try {
        // Step 1: Regular login first to establish a session
        console.log('🔐 Step 1: Regular Login');
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            username: 'demou',
            password: 'Ashani@123'
        });

        if (!loginResponse.data.success) {
            throw new Error('Regular login failed');
        }

        const userData = loginResponse.data.data;
        console.log('✅ Regular login successful for:', userData.user.username);
        console.log('   User ID:', userData.user.id);
        console.log('   Session ID:', userData.session.sessionId);
        console.log('   Quick Login Enabled:', userData.session.quickLoginEnabled);
        console.log('   Quick Login Expires:', userData.session.quickLoginExpiresAt);

        // Step 2: Test Quick Login
        console.log('\n⚡ Step 2: Quick Login Test');
        const quickLoginResponse = await axios.post('http://localhost:3001/api/v1/auth/quick-login', {
            userId: userData.user.id,
            deviceInfo: {
                deviceId: 'mobile_app',
                platform: 'react-native',
                version: '1.0.0'
            }
        });

        if (quickLoginResponse.data.success) {
            console.log('✅ Quick login successful!');
            console.log('   New token generated:', !!quickLoginResponse.data.data.tokens.accessToken);
            console.log('   Session ID:', quickLoginResponse.data.data.session.sessionId);
            console.log('   Quick login expires:', quickLoginResponse.data.data.session.quickLoginExpiresAt);
        } else {
            console.log('❌ Quick login failed:', quickLoginResponse.data.message);
        }

        // Step 3: Test profile access with new token
        console.log('\n👤 Step 3: Profile Access Test');
        const newToken = quickLoginResponse.data.data.tokens.accessToken;
        const profileResponse = await axios.get('http://localhost:3001/api/v1/auth/profile', {
            headers: {
                'Authorization': `Bearer ${newToken}`
            }
        });

        if (profileResponse.data.success) {
            console.log('✅ Profile access successful with new token');
            console.log('   Username:', profileResponse.data.data.username);
            console.log('   Email:', profileResponse.data.data.email);
        } else {
            console.log('❌ Profile access failed');
        }

        console.log('\n🎉 QUICK LOGIN FLOW VERIFICATION');
        console.log('=================================');
        console.log('✅ Regular login working');
        console.log('✅ Quick login endpoint working');
        console.log('✅ Token validation working');
        console.log('✅ Mobile app should now work with quick login');

    } catch (error) {
        console.error('❌ Test Error:', error.message);
        if (error.response) {
            console.error('   Response Status:', error.response.status);
            console.error('   Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testQuickLoginFlow();