import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('network-test')
export class NetworkTestController {
  @Get('ping')
  ping() {
    return {
      message: 'Pong! Backend is reachable from React Native',
      timestamp: new Date().toISOString(),
      server: 'NestJS Mobile ERP Backend',
      network: '192.168.1.55:3000',
      status: 'connected'
    };
  }

  @Post('echo')
  echo(@Body() data: any) {
    return {
      message: 'Echo successful - data received from React Native',
      receivedData: data,
      timestamp: new Date().toISOString(),
      server: 'NestJS Mobile ERP Backend'
    };
  }

  @Get('cors-test')
  corsTest() {
    return {
      message: 'CORS is working correctly',
      allowedOrigins: [
        'exp://192.168.1.55:8082',
        'http://192.168.1.55:8082',
        'http://localhost:19006'
      ],
      timestamp: new Date().toISOString()
    };
  }
}