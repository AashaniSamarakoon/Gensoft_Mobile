const fetch = require('node-fetch');

async function testFrontendLogoutFlow() {
  try {
    console.log('🧪 Testing complete frontend logout flow...');
    
    // This simulates exactly what the frontend should do
    const MOBILE_BACKEND_URL = 'http://localhost:4000'; // Fixed URL without /api
    
    const currentUser = {
      id: 'nzhgjx280p7tjruftpb2b5b9',
      email: 'ashanisamarakoon36@gmail.com',
      employeeId: '3',
      username: 'mike_jones'
    };
    
    console.log('📤 Making logout API call...');
    console.log('   URL:', `${MOBILE_BACKEND_URL}/api/auth/logout`);
    console.log('   User:', currentUser.username, '(' + currentUser.email + ')');
    
    const response = await fetch(`${MOBILE_BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: currentUser.id,
        email: currentUser.email,
        employeeId: currentUser.employeeId
      })
    });

    const result = await response.json();
    
    console.log('📥 Backend response:');
    console.log('   Status:', response.status);
    console.log('   Success:', result.success);
    console.log('   Message:', result.message);
    
    if (response.ok && result.success) {
      console.log('✅ Frontend logout flow would work correctly!');
      console.log('🔄 User should now be able to re-register with QR code');
      
      // Verify database state
      console.log('\n🔍 Checking database state after logout...');
      const { exec } = require('child_process');
      exec('node check-all-users.js', { cwd: '../mobile-backend' }, (error, stdout) => {
        if (error) {
          console.error('Error checking users:', error);
          return;
        }
        console.log('Database check result:');
        console.log(stdout);
      });
      
    } else {
      console.log('❌ Frontend logout flow would fail');
      console.log('   Error:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Frontend logout test failed:', error.message);
  }
}

testFrontendLogoutFlow();