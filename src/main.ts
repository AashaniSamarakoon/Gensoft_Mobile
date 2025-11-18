import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { globalValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
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
  const host = process.env.HOST ?? '0.0.0.0';
  
  await app.listen(port, host);
  console.log(`🚀 NestJS Backend Server running on: http://${host}:${port}`);
  console.log(`📱 API for React Native Metro (${port === 3000 ? '192.168.1.55:8082' : 'your-metro-ip'}): http://192.168.1.55:${port}/api/v1`);
  console.log(`🌐 API endpoints available at: http://192.168.1.55:${port}/api/v1`);
  console.log('📋 Available endpoints:');
  console.log('  - POST /api/v1/auth/scan-qr');
  console.log('  - POST /api/v1/auth/verify-email');
  console.log('  - POST /api/v1/auth/verify-password');
  console.log('  - POST /api/v1/auth/login');
  console.log('  - GET  /api/v1/auth/quick-login');
  console.log('  - GET  /api/v1/iou');
  console.log('  - POST /api/v1/iou');
}
void bootstrap();
