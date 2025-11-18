import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  // Mock Prisma service for development without database
  
  async onModuleInit() {
    console.log('🟡 Mock Prisma Service initialized (Database disabled for development)');
    console.log('💡 To enable database: Set up MySQL and configure .env file');
  }

  async onModuleDestroy() {
    console.log('Mock Prisma Service disconnected');
  }

  // Mock database methods for development
  get mobileAppUser() {
    return {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 1, email: 'mock@example.com' }),
      update: () => Promise.resolve({ id: 1, email: 'mock@example.com' }),
      delete: () => Promise.resolve({ id: 1 }),
    };
  }

  get userSession() {
    return {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 1, userId: 1 }),
      update: () => Promise.resolve({ id: 1, userId: 1 }),
      delete: () => Promise.resolve({ id: 1 }),
    };
  }

  get refreshToken() {
    return {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 1, userId: 1 }),
      update: () => Promise.resolve({ id: 1, userId: 1 }),
      delete: () => Promise.resolve({ id: 1 }),
    };
  }

  get qrCodeSession() {
    return {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 1, sessionId: 'mock-session' }),
      update: () => Promise.resolve({ id: 1, sessionId: 'mock-session' }),
      delete: () => Promise.resolve({ id: 1 }),
    };
  }

  get emailVerification() {
    return {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 1, email: 'mock@example.com' }),
      update: () => Promise.resolve({ id: 1, email: 'mock@example.com' }),
      delete: () => Promise.resolve({ id: 1 }),
    };
  }

  get middlewareLog() {
    return {
      findMany: () => Promise.resolve([]),
      create: () => Promise.resolve({ id: 1, action: 'mock-action' }),
    };
  }

  get iou() {
    return {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 1, amount: 100 }),
      update: () => Promise.resolve({ id: 1, amount: 100 }),
      delete: () => Promise.resolve({ id: 1 }),
    };
  }

  get user() {
    return {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({ id: 1, name: 'Mock User' }),
      update: () => Promise.resolve({ id: 1, name: 'Mock User' }),
      delete: () => Promise.resolve({ id: 1 }),
    };
  }
}