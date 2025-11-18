const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkUsers() {
  console.log('🔍 CHECKING EXISTING USERS IN DATABASE');
  console.log('=====================================\n');

  try {
    // Test connection first
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    const users = await prisma.mobileAppUser.findMany({
      select: {
        id: true,
        mainErpUserId: true,
        username: true,
        email: true,
        isRegistered: true,
        isActive: true
      }
    });

    console.log(`📊 Found ${users.length} users in database:`);
    console.log('');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. User: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   mainErpUserId: "${user.mainErpUserId}" (${typeof user.mainErpUserId})`);
      console.log(`   isRegistered: ${user.isRegistered}`);
      console.log(`   isActive: ${user.isActive}`);
      console.log('');
    });

    console.log('🧪 QR TEST DATA ANALYSIS');
    console.log('------------------------');
    console.log('Mobile app QR has emp_id: 1 (number)');
    console.log('Need to check if any user has mainErpUserId: "1" or 1');
    
    const userWithId1 = users.find(u => u.mainErpUserId === '1' || u.mainErpUserId === 1);
    if (userWithId1) {
      console.log(`✅ Found user with emp_id 1: ${userWithId1.username}`);
      console.log(`   This user should be detected as alreadyRegistered: ${userWithId1.isRegistered}`);
    } else {
      console.log('❌ No user found with mainErpUserId = 1');
      console.log('   This explains why backend allows registration to proceed');
    }

  } catch (error) {
    console.error('❌ Database query failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();