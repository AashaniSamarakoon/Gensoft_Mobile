const axios = require('axios');

async function debugQRBlocking() {
    console.log('🔍 Debugging QR Code Blocking Issue');
    console.log('==================================\n');

    try {
        // First, let's check what users exist in the database
        console.log('📊 Step 1: Checking database for existing users');
        
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        const users = await prisma.mobileAppUser.findMany({
            select: {
                id: true,
                username: true,
                mainErpUserId: true,
                email: true,
                isRegistered: true
            }
        });
        
        console.log('Existing users:');
        users.forEach(user => {
            console.log(`  - ${user.username}: mainErpUserId=${user.mainErpUserId}, registered=${user.isRegistered}`);
        });
        
        // Test with each existing user's mainErpUserId
        for (const user of users.filter(u => u.isRegistered)) {
            console.log(`\n📱 Testing QR scan for ${user.username} (mainErpUserId: ${user.mainErpUserId})`);
            
            const qrData = {
                emp_id: user.mainErpUserId,
                emp_uname: user.username,
                emp_email: user.email,
                emp_mobile_no: '1234567890'
            };
            const qrDataBase64 = Buffer.from(JSON.stringify(qrData)).toString('base64');
            
            try {
                const response = await axios.post('http://localhost:3001/api/v1/auth/scan-qr', {
                    qrData: qrDataBase64
                });
                
                console.log(`  Result: success=${response.data.success}, alreadyRegistered=${response.data.alreadyRegistered}`);
                console.log(`  Message: ${response.data.message}`);
                
                if (response.data.alreadyRegistered) {
                    console.log('  ✅ BLOCKED correctly');
                } else if (response.data.success) {
                    console.log('  ❌ NOT BLOCKED - allowing re-registration!');
                } else {
                    console.log('  ❓ Other error:', response.data);
                }
                
            } catch (error) {
                console.log(`  Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
                
                // Check if it's a ConflictException (409 status)
                if (error.response?.status === 409) {
                    console.log('  ✅ BLOCKED with ConflictException');
                }
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        await prisma.$disconnect();
        
    } catch (error) {
        console.error('❌ Debug Error:', error.message);
    }
}

debugQRBlocking();