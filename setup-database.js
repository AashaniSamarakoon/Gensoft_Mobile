const mysql = require('mysql2/promise');

async function createMobileERPDatabase() {
  let connection;
  
  try {
    console.log('🔗 Connecting to MySQL server...');
    
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      port: 3306
    });
    
    console.log('✅ Connected to MySQL server successfully!');
    
    // Create database if it doesn't exist
    console.log('📦 Creating mobile_erp_db database...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS mobile_erp_db');
    console.log('✅ Database mobile_erp_db created/verified successfully!');
    
    // Show all databases to confirm
    console.log('📋 Current databases:');
    const [databases] = await connection.execute('SHOW DATABASES');
    databases.forEach(db => {
      if (db.Database === 'mobile_erp_db') {
        console.log(`  ✅ ${db.Database} (Mobile ERP - READY)`);
      } else if (!['information_schema', 'performance_schema', 'mysql', 'sys'].includes(db.Database)) {
        console.log(`  📁 ${db.Database} (Other app - SAFE)`);
      }
    });
    
    console.log('\n🎉 SUCCESS! mobile_erp_db is ready for your Mobile ERP app!');
    console.log('🔒 Your other databases are completely safe and untouched.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solution: Check your MySQL credentials');
      console.log('   - Username: root');
      console.log('   - Password: 123456');
      console.log('   - Make sure MySQL server is running');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Start your MySQL server');
      console.log('   - Windows: Start MySQL service');
      console.log('   - Or run: net start mysql');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 MySQL connection closed.');
    }
  }
}

// Run the database setup
createMobileERPDatabase();