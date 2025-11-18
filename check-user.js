const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('Checking for user "demou"...');
    
    const user = await prisma.mobileAppUser.findUnique({
      where: { username: 'demou' },
    });
    
    if (user) {
      console.log('User found:');
      console.log('ID:', user.id);
      console.log('Username:', user.username);
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('Is Registered:', user.isRegistered);
      console.log('Is Active:', user.isActive);
      console.log('Main ERP User ID:', user.mainErpUserId);
      console.log('Created At:', user.createdAt);
      console.log('Last Login:', user.lastLoginAt);
    } else {
      console.log('User "demou" not found in database');
      
      // Check all users
      const allUsers = await prisma.mobileAppUser.findMany();
      console.log('\nAll users in database:');
      allUsers.forEach(u => {
        console.log(`- ${u.username} (${u.email}) - Registered: ${u.isRegistered}, Active: ${u.isActive}`);
      });
    }
    
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();