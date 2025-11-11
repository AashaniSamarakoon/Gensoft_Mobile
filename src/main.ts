import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { globalValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe
  app.useGlobalPipes(globalValidationPipe);
  
  // Enable CORS for mobile app
  app.enableCors();
  
  // Global prefix for API routes
  app.setGlobalPrefix('api/v1');
  
  await app.listen(process.env.PORT ?? 3000);
  console.log('Application is running on: http://localhost:3000');
  console.log('API endpoints available at: http://localhost:3000/api/v1');
}
void bootstrap();
