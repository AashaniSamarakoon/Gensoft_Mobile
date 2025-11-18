const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testJWTAndSession() {
  try {
    console.log('Testing JWT and session creation...');
    
    // Test JWT creation
    const payload = {
      sub: 'test-user-id',
      username: 'demou',
      email: 'ashanisamarakoon36@gmail.com',
      sessionId: 'test-session-123',
    };
    
    const secret = 'your-super-secret-jwt-key-here-change-in-production';
    const accessToken = jwt.sign(payload, secret, { expiresIn: '24h' });
    const refreshToken = jwt.sign(
      { sub: 'test-user-id', sessionId: 'test-session-123', type: 'refresh' },
      secret,
      { expiresIn: '7d' }
    );
    
    console.log('✅ JWT tokens created successfully');
    console.log('Access token length:', accessToken.length);
    console.log('Refresh token length:', refreshToken.length);
    
    // Test database session creation without deviceInfo
    const now = new Date();
    const accessTokenExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const quickLoginExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Find the user
    const user = await prisma.mobileAppUser.findUnique({
      where: { username: 'demou' }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.username);
    
    // Create session without deviceInfo to isolate the issue
    const sessionId = 'test-login-' + Date.now();
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionId,
        accessToken,
        deviceId: 'test-device',
        deviceInfo: null, // Explicitly null to avoid the object issue
        isActive: true,
        lastActivityAt: now,
        expiresAt: accessTokenExpiry,
        quickLoginEnabled: true,
        quickLoginExpiresAt: quickLoginExpiry,
      },
    });
    
    console.log('✅ Session created:', session.sessionId);
    
    // Create refresh token
    const refreshTokenExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const refreshTokenRecord = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        sessionId,
        expiresAt: refreshTokenExpiry,
      },
    });
    
    console.log('✅ Refresh token created:', refreshTokenRecord.id);
    
    console.log('\n🎉 All JWT and session operations successful!');
    console.log('\nLogin response structure:');
    console.log({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 24 * 60 * 60, // 24 hours in seconds
        },
        session: {
          sessionId: session.sessionId,
          expiresAt: session.expiresAt,
          quickLoginEnabled: session.quickLoginEnabled,
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testJWTAndSession();