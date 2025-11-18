import { ValidationPipe } from '@nestjs/common';

export const globalValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: false, // Temporarily disable to test
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
});