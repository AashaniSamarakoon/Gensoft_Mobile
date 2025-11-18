const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test user for IOU testing...');
    
    // Create a second user
    const testUser = await prisma.mobileAppUser.create({
      data: {
        mainErpUserId: 'usr_2_mobile',
        email: 'colleague@company.com',
        name: 'Test Colleague',
        username: 'testuser',
        phone: '0704567890',
        emailVerified: true,
        passwordVerified: true,
        isActive: true,
        isRegistered: true,
        qrCodeData: null,
        emailVerificationCode: null,
        emailVerificationExpiry: null,
        lastLoginAt: new Date(),
        lastPasswordCheck: new Date(),
      },
    });
    
    console.log('✅ Test user created successfully:');
    console.log('Username:', testUser.username);
    console.log('Email:', testUser.email);
    console.log('Name:', testUser.name);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('✅ Test user already exists');
    } else {
      console.error('❌ Failed to create test user:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();