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
  // Mobile app QR format compatibility
  emp_id?: number | string;
  emp_uname?: string;
  emp_email?: string;
  emp_name?: string;
  emp_phone?: string;
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
  async validateQRCodeToken(qrToken: string, qrData?: QRCodeData): Promise<MainERPUser> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Validating QR token: ${qrToken}`);
      
      // Check if this is a mobile app generated token (starts with 'qr_')
      if (qrToken.startsWith('qr_') && qrData) {
        this.logger.log('Handling mobile app QR code format');
        
        // Extract employee ID from token or QR data
        const empId = qrData.emp_id || qrData.userId;
        const mainErpUserId = `usr_${empId}_mobile`;
        
        // Create a simulated main ERP user response for mobile app
        const mainERPUser: MainERPUser = {
          id: mainErpUserId,
          username: qrData.emp_uname || qrData.username,
          email: qrData.emp_email || qrData.email,
          name: qrData.emp_name || qrData.name || qrData.emp_uname || qrData.username,
          phone: qrData.emp_phone || qrData.phone,
          isActive: true,
        };
        
        this.logger.log(`Generated main ERP user for mobile app: ${JSON.stringify(mainERPUser)}`);
        
        // Log the operation
        await this.logMiddlewareOperation({
          operation: 'qr_validation',
          mainErpUserId: mainERPUser.id,
          requestData: { qrToken, mobileApp: true },
          responseData: mainERPUser,
          status: 'SUCCESS',
          responseTime: Date.now() - startTime,
        });
        
        return mainERPUser;
      }
      
      // Handle standard ERP QR tokens
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
   * Parse QR code data (decode base64 JSON from the QR code or handle plain JSON)
   */
  parseQRCodeData(qrCodeString: string): QRCodeData {
    try {
      let qrData: any;
      
      // Try to parse as JSON first (mobile app format)
      try {
        qrData = JSON.parse(qrCodeString);
        this.logger.log(`Parsed QR data as JSON: ${JSON.stringify(qrData)}`);
      } catch (jsonError) {
        // If JSON parsing fails, try base64 decoding (main ERP format)
        try {
          const decodedData = Buffer.from(qrCodeString, 'base64').toString('utf-8');
          qrData = JSON.parse(decodedData);
          this.logger.log(`Parsed QR data as base64: ${JSON.stringify(qrData)}`);
        } catch (base64Error) {
          throw new Error('Could not parse QR code as JSON or base64-encoded JSON');
        }
      }
      
      // Transform the QR data to our expected format
      const parsedData: QRCodeData = {
        qrToken: qrData.qrToken || ('qr_' + qrData.emp_id + '_' + Date.now()), // Generate unique token if not present
        userId: qrData.userId || qrData.emp_id?.toString() || 'unknown',
        username: qrData.username || qrData.emp_uname || 'unknown',
        email: qrData.email || qrData.emp_email || '',
        name: qrData.name || qrData.emp_name || qrData.emp_uname || 'Unknown User',
        phone: qrData.phone || qrData.emp_phone || qrData.emp_mobile_no || '',
        expiresAt: qrData.expiresAt || new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        timestamp: qrData.timestamp || Date.now(),
        // Add mobile app specific fields for backward compatibility
        emp_id: qrData.emp_id,
        emp_uname: qrData.emp_uname,
        emp_email: qrData.emp_email,
        emp_name: qrData.emp_name,
        emp_phone: qrData.emp_phone,
      };

      return parsedData;
    } catch (error) {
      this.logger.error(`Error parsing QR code: ${error.message}`);
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
      // Extract user ID from the QR token to create consistent user data
      let empId = '1';
      let userData = {
        id: 'usr_demou_12345',
        username: 'demou',
        email: 'ashanisamarakoon36@gmail.com',
        name: 'demou',
        phone: '0703101244',
        department: 'Logistics',
        role: 'Manager',
        isActive: true,
      };

      // If we have QR data, extract the employee ID for consistent responses
      if (data?.qrToken) {
        try {
          this.logger.log(`Processing QR token: ${data.qrToken}`);
          // QR token format is: qr_${emp_id}_${timestamp}
          // We need to extract emp_id which could contain underscores
          const match = data.qrToken.match(/^qr_(.+)_\d+$/);
          if (match) {
            empId = match[1]; // This gets the full emp_id including underscores
            userData.id = empId; // Use the emp_id directly as the user ID
            this.logger.log(`Extracted emp_id: ${empId}`);
          }
        } catch (error) {
          this.logger.warn(`Could not parse QR token details: ${error.message}`);
        }
      }

      return {
        data: userData,
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