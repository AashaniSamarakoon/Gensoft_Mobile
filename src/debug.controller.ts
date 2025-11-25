import { Controller, Post, Body, Inject } from '@nestjs/common';
import { AuthService } from './modules/auth/auth.service';

@Controller('debug')
export class DebugController {
  constructor(private readonly authService: AuthService) {}
  @Post('test-qr')
  testQR(@Body() body: any) {
    console.log('🔍 Debug - Received body:', JSON.stringify(body, null, 2));
    
    if (!body.qrData) {
      return { error: 'No qrData provided', received: body };
    }

    try {
      // Test decoding
      const decoded = Buffer.from(body.qrData, 'base64').toString('utf-8');
      console.log('🔍 Debug - Decoded QR data:', decoded);
      
      const parsed = JSON.parse(decoded);
      console.log('🔍 Debug - Parsed QR data:', parsed);
      
      return {
        success: true,
        original: body.qrData,
        decoded: decoded,
        parsed: parsed,
        message: 'QR data processing successful'
      };
    } catch (error) {
      console.error('🔍 Debug - Error:', error.message);
      return {
        success: false,
        error: error.message,
        received: body
      };
    }
  }

  @Post('test-scan-qr')
  async testScanQR(@Body() body: any) {
    console.log('🔍 Debug Auth - Starting scan QR test...');
    console.log('🔍 Debug Auth - Received body:', JSON.stringify(body, null, 2));
    
    try {
      // Just simulate the successful response that auth should return
      return {
        success: true,
        message: 'QR code scanned successfully. Verification code sent to email.',
        data: {
          email: 'ashanisamarakoon36@gmail.com',
          name: 'demou',
          username: 'demou',
          nextStep: 'email_verification',
        },
      };
    } catch (error) {
      console.error('🔍 Debug Auth - Error:', error.message);
      return {
        success: false,
        error: error.message,
        received: body
      };
    }
  }

  @Post('logout-user')
  async debugLogoutUser(@Body() body: { email: string }) {
    console.log('🔍 Debug - Logout user by email:', body.email);
    
    try {
      // Find user by email first
      const user = await this.authService.findUserByEmail(body.email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Force logout the user
      const result = await this.authService.logout(user.id);
      
      return {
        success: true,
        message: 'User logged out successfully',
        data: result
      };
    } catch (error) {
      console.error('Debug logout error:', error);
      return {
        success: false,
        message: 'Logout failed',
        error: error.message
      };
    }
  }
}