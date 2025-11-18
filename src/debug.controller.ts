import { Controller, Post, Body } from '@nestjs/common';

@Controller('debug')
export class DebugController {
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
}