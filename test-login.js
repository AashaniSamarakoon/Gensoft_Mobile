const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('Testing login functionality...');
    
    // Step 1: Find user
    console.log('Step 1: Finding user...');
    const user = await prisma.mobileAppUser.findUnique({
      where: { 
        username: 'demou',
        isActive: true,
        isRegistered: true,
      },
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.username);
    
    // Step 2: Test password verification (simulate)
    console.log('Step 2: Password verification would happen here...');
    console.log('✅ Password verification simulated as successful');
    
    // Step 3: Update user login time
    console.log('Step 3: Updating user login time...');
    const updatedUser = await prisma.mobileAppUser.update({
      where: { id: user.id },
      data: { 
        lastLoginAt: new Date(),
        lastPasswordCheck: new Date(),
      },
    });
    console.log('✅ User login time updated');
    
    // Step 4: Test token generation (simulate)
    console.log('Step 4: Simulating token generation...');
    const sessionId = 'test-session-' + Date.now();
    const now = new Date();
    const accessTokenExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const quickLoginExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Create session
    console.log('Creating session...');
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionId,
        accessToken: 'test-access-token',
        deviceId: 'test-device',
        deviceInfo: { platform: 'test' },
        isActive: true,
        lastActivityAt: now,
        expiresAt: accessTokenExpiry,
        quickLoginEnabled: true,
        quickLoginExpiresAt: quickLoginExpiry,
      },
    });
    console.log('✅ Session created:', session.sessionId);
    
    // Create refresh token
    console.log('Creating refresh token...');
    const refreshTokenExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const refreshToken = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: 'test-refresh-token',
        sessionId,
        expiresAt: refreshTokenExpiry,
      },
    });
    console.log('✅ Refresh token created');
    
    console.log('\n🎉 Login test completed successfully!');
    
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();