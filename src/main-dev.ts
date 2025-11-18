import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { globalValidationPipe } from './common/pipes/validation.pipe';

async function bootstrapWithoutDB() {
  console.log('🚀 Starting NestJS Backend for React Native Development...');
  console.log('📱 React Native Metro Server: exp://192.168.1.55:8082');
  
  // Create a mock app module without database dependencies for development
  const app = await NestFactory.create(AppModule, { 
    logger: ['log', 'error', 'warn', 'debug', 'verbose'] 
  });
  
  // Global validation pipe
  app.useGlobalPipes(globalValidationPipe);
  
  // Enable CORS for React Native Metro development server
  app.enableCors({
    origin: [
      'http://192.168.1.55:8082',
      'exp://192.168.1.55:8082',
      'http://localhost:8082',
      'http://localhost:19006', // Expo web
      'http://localhost:19000', // Expo DevTools
      'exp://localhost:19000',
      'exp://127.0.0.1:19000',
      'http://192.168.1.55:19000', // Expo on network
      'exp://192.168.1.55:19000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
  
  // Global prefix for API routes
  app.setGlobalPrefix('api/v1');
  
  const port = process.env.PORT ?? 3000;
  const host = '0.0.0.0'; // Bind to all network interfaces
  
  try {
    await app.listen(port, host);
    console.log(`\n🎉 SUCCESS! NestJS Backend Server is running!`);
    console.log(`🔗 Backend URL: http://192.168.1.55:${port}/api/v1`);
    console.log(`📱 React Native can connect to: http://192.168.1.55:${port}/api/v1`);
    console.log(`\n📋 Available API Endpoints:`);
    console.log(`  Authentication:`);
    console.log(`    POST http://192.168.1.55:${port}/api/v1/auth/scan-qr`);
    console.log(`    POST http://192.168.1.55:${port}/api/v1/auth/verify-email`);
    console.log(`    POST http://192.168.1.55:${port}/api/v1/auth/verify-password`);
    console.log(`    POST http://192.168.1.55:${port}/api/v1/auth/login`);
    console.log(`    POST http://192.168.1.55:${port}/api/v1/auth/quick-login`);
    console.log(`\n  IOU Management:`);
    console.log(`    GET  http://192.168.1.55:${port}/api/v1/iou`);
    console.log(`    POST http://192.168.1.55:${port}/api/v1/iou`);
    console.log(`\n⚠️  Database Note: Configure MySQL and run 'npx prisma migrate dev' to enable full functionality`);
    console.log(`\n🔄 Watching for changes... Your React Native app can now connect!`);
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    if (error.message.includes('database')) {
      console.log('\n💡 Database Setup Required:');
      console.log('   1. Install MySQL server');
      console.log('   2. Create database: mobile_erp_db');
      console.log('   3. Update .env with correct credentials');
      console.log('   4. Run: npx prisma migrate dev --name init');
    }
  }
}

bootstrapWithoutDB().catch(console.error);