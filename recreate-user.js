const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function recreateUser() {
  try {
    console.log('Recreating user "demou"...');
    
    // Create the user
    const user = await prisma.mobileAppUser.create({
      data: {
        mainErpUserId: 'usr_1_mobile',
        email: 'ashanisamarakoon36@gmail.com',
        name: 'demou',
        username: 'demou',
        phone: '0703101244',
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
    
    console.log('✅ User created successfully:');
    console.log('ID:', user.id);
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Is Registered:', user.isRegistered);
    console.log('Is Active:', user.isActive);
    
  } catch (error) {
    console.error('❌ Failed to create user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

recreateUser();