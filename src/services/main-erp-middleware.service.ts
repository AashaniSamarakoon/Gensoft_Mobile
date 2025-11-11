import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import axios, { AxiosResponse } from 'axios';

export interface MainERPUser {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  department?: string;
  role?: string;
  isActive: boolean;
}

export interface QRCodeData {
  qrToken: string;
  userId: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  expiresAt: string;
  timestamp: number;
}

export interface PasswordVerificationRequest {
  userId: string;
  username: string;
  password: string;
}

@Injectable()
export class MainERPMiddlewareService {
  private readonly logger = new Logger(MainERPMiddlewareService.name);
  private readonly mainERPBaseUrl: string;
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // These would come from environment variables
    this.mainERPBaseUrl = this.configService.get<string>('MAIN_ERP_BASE_URL') || 'http://localhost:8080/api';
    this.apiKey = this.configService.get<string>('MAIN_ERP_API_KEY') || 'your-api-key-here';
  }

  /**
   * Validate QR code token and get user data from main ERP system
   */
  async validateQRCodeToken(qrToken: string): Promise<MainERPUser> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Validating QR token: ${qrToken}`);
      
      // In a real implementation, this would call the main ERP API
      // For now, we'll simulate the response based on the QR token
      const response = await this.callMainERPAPI('POST', '/auth/validate-qr', {
        qrToken,
      });

      const responseTime = Date.now() - startTime;
      
      // Log the operation
      await this.logMiddlewareOperation({
        operation: 'qr_validation',
        mainErpUserId: response.data.id,
        requestData: { qrToken },
        responseData: response.data,
        status: 'SUCCESS',
        responseTime,
      });

      return response.data;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      await this.logMiddlewareOperation({
        operation: 'qr_validation',
        requestData: { qrToken },
        status: 'FAILED',
        errorMessage: error.message,
        responseTime,
      });

      throw new HttpException(
        'Invalid or expired QR code',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Verify user password with main ERP system
   */
  async verifyUserPassword(request: PasswordVerificationRequest): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Verifying password for user: ${request.username}`);
      
      const response = await this.callMainERPAPI('POST', '/auth/verify-password', {
        userId: request.userId,
        username: request.username,
        password: request.password,
      });

      const responseTime = Date.now() - startTime;
      
      await this.logMiddlewareOperation({
        operation: 'password_verification',
        mainErpUserId: request.userId,
        requestData: { 
          userId: request.userId, 
          username: request.username,
          // Don't log the actual password
        },
        responseData: { isValid: response.data.isValid },
        status: 'SUCCESS',
        responseTime,
      });

      return response.data.isValid;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      await this.logMiddlewareOperation({
        operation: 'password_verification',
        mainErpUserId: request.userId,
        requestData: { 
          userId: request.userId, 
          username: request.username,
        },
        status: 'FAILED',
        errorMessage: error.message,
        responseTime,
      });

      return false;
    }
  }

  /**
   * Get user details from main ERP system
   */
  async getUserDetails(userId: string): Promise<MainERPUser | null> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Getting user details for: ${userId}`);
      
      const response = await this.callMainERPAPI('GET', `/users/${userId}`);

      const responseTime = Date.now() - startTime;
      
      await this.logMiddlewareOperation({
        operation: 'get_user_details',
        mainErpUserId: userId,
        requestData: { userId },
        responseData: response.data,
        status: 'SUCCESS',
        responseTime,
      });

      return response.data;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      await this.logMiddlewareOperation({
        operation: 'get_user_details',
        mainErpUserId: userId,
        requestData: { userId },
        status: 'FAILED',
        errorMessage: error.message,
        responseTime,
      });

      return null;
    }
  }

  /**
   * Check if user is still active in main ERP system
   */
  async checkUserStatus(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserDetails(userId);
      return user?.isActive ?? false;
    } catch (error) {
      this.logger.error(`Error checking user status: ${error.message}`);
      return false;
    }
  }

  /**
   * Simulate QR code data parsing (in real implementation, this would decode the QR)
   */
  parseQRCodeData(qrCodeString: string): QRCodeData {
    try {
      // In real implementation, this would parse actual QR code data
      // For demo purposes, we'll create mock data
      const mockData: QRCodeData = {
        qrToken: 'qr_' + Math.random().toString(36).substr(2, 9),
        userId: 'usr_' + Math.random().toString(36).substr(2, 9),
        username: 'demou',
        email: 'ashanisamarakoon36@gmail.com',
        name: 'demou',
        phone: '+1234567890',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        timestamp: Date.now(),
      };

      return mockData;
    } catch (error) {
      throw new HttpException(
        'Invalid QR code format',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Make HTTP calls to main ERP system
   */
  private async callMainERPAPI(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
  ): Promise<AxiosResponse> {
    try {
      const config = {
        method,
        url: `${this.mainERPBaseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        data,
        timeout: 10000, // 10 seconds timeout
      };

      // For demo purposes, we'll simulate API responses
      return this.simulateMainERPResponse(endpoint, data);
    } catch (error) {
      this.logger.error(`Main ERP API call failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Simulate main ERP API responses for demo
   */
  private async simulateMainERPResponse(endpoint: string, data?: any): Promise<AxiosResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    if (endpoint === '/auth/validate-qr') {
      return {
        data: {
          id: 'usr_demou_12345',
          username: 'demou',
          email: 'ashanisamarakoon36@gmail.com',
          name: 'demou',
          phone: '+1234567890',
          department: 'Logistics',
          role: 'Manager',
          isActive: true,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse;
    }

    if (endpoint === '/auth/verify-password') {
      // Simulate password verification (in real app, this would check against main ERP)
      return {
        data: {
          isValid: true, // For demo, always return true
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse;
    }

    if (endpoint.startsWith('/users/')) {
      return {
        data: {
          id: data?.userId || 'usr_demou_12345',
          username: 'demou',
          email: 'ashanisamarakoon36@gmail.com',
          name: 'demou',
          phone: '+1234567890',
          department: 'Logistics',
          role: 'Manager',
          isActive: true,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse;
    }

    throw new Error('API endpoint not found');
  }

  /**
   * Log middleware operations for monitoring and debugging
   */
  private async logMiddlewareOperation(logData: {
    operation: string;
    mainErpUserId?: string;
    requestData?: any;
    responseData?: any;
    status: string;
    errorMessage?: string;
    responseTime?: number;
  }) {
    try {
      await this.prisma.middlewareLog.create({
        data: {
          operation: logData.operation,
          mainErpUserId: logData.mainErpUserId,
          requestData: logData.requestData,
          responseData: logData.responseData,
          status: logData.status,
          errorMessage: logData.errorMessage,
          responseTime: logData.responseTime,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log middleware operation: ${error.message}`);
    }
  }
}