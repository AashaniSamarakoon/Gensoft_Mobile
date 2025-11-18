import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: this.configService.get<number>('SMTP_PORT') || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER') || 'your-email@gmail.com',
        pass: this.configService.get<string>('SMTP_PASS') || 'your-app-password',
      },
    });
  }

  /**
   * Send email verification code
   */
  async sendVerificationCode(email: string, code: string, userName: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM') || '"Gensoft ERP" <noreply@gensoft.com>',
        to: email,
        subject: 'Mobile App Email Verification - Gensoft ERP',
        html: this.getVerificationEmailTemplate(userName, code),
      };

      // Send actual email
      this.logger.log(`Sending email verification code to ${email}: ${code}`);
      console.log('='.repeat(50));
      console.log('📧 SENDING EMAIL VERIFICATION CODE');
      console.log('='.repeat(50));
      console.log(`To: ${email}`);
      console.log(`Name: ${userName}`);
      console.log(`Code: ${code}`);
      console.log(`Expires: 15 minutes`);
      console.log('='.repeat(50));

      try {
        const info = await this.transporter.sendMail(mailOptions);
        this.logger.log(`✅ Email sent successfully: ${info.messageId}`);
        console.log(`✅ Email sent successfully to ${email}`);
        return true;
      } catch (emailError) {
        this.logger.error(`❌ Failed to send email: ${emailError.message}`);
        console.log(`❌ Email send failed: ${emailError.message}`);
        console.log('📝 Verification code (fallback):', code);
        return false;
      }
    } catch (error) {
      this.logger.error(`Failed to send verification email: ${error.message}`);
      return false;
    }
  }

  /**
   * Send password reset email (for future use)
   */
  async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM') || '"Gensoft ERP" <noreply@gensoft.com>',
        to: email,
        subject: 'Password Reset - Gensoft ERP Mobile',
        html: this.getPasswordResetEmailTemplate(userName, resetToken),
      };

      this.logger.log(`Password reset email for ${email}`);
      // const info = await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error.message}`);
      return false;
    }
  }

  /**
   * Email template for verification code
   */
  private getVerificationEmailTemplate(userName: string, code: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; }
          .title { color: #333; font-size: 24px; margin: 0; }
          .subtitle { color: #666; font-size: 16px; margin: 10px 0 0 0; }
          .code-container { background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0; }
          .verification-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 10px 0; }
          .expires { color: #ff6b6b; font-size: 14px; font-weight: bold; }
          .instructions { color: #666; line-height: 1.6; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">G</div>
            <h1 class="title">Gensoft ERP</h1>
            <p class="subtitle">Smart Logistics Management System</p>
          </div>
          
          <h2 style="color: #333;">Hello ${userName}!</h2>
          
          <p class="instructions">
            You're almost ready to start using the Gensoft ERP mobile app. 
            Please enter the verification code below to verify your email address:
          </p>
          
          <div class="code-container">
            <div class="verification-code">${code}</div>
            <div class="expires">⏰ Expires in 15 minutes</div>
          </div>
          
          <p class="instructions">
            If you didn't request this verification code, please ignore this email. 
            This code will expire in 15 minutes for security reasons.
          </p>
          
          <div class="footer">
            <p>© 2025 Gensoft ERP - Smart Logistics Management System</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Email template for password reset
   */
  private getPasswordResetEmailTemplate(userName: string, resetToken: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; }
          .title { color: #333; font-size: 24px; margin: 0; }
          .subtitle { color: #666; font-size: 16px; margin: 10px 0 0 0; }
          .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .instructions { color: #666; line-height: 1.6; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">G</div>
            <h1 class="title">Gensoft ERP</h1>
            <p class="subtitle">Smart Logistics Management System</p>
          </div>
          
          <h2 style="color: #333;">Password Reset Request</h2>
          
          <p class="instructions">
            Hello ${userName}, we received a request to reset your password for the Gensoft ERP mobile app.
          </p>
          
          <div style="text-align: center;">
            <a href="#" class="button">Reset Password</a>
          </div>
          
          <p class="instructions">
            If you didn't request this password reset, please ignore this email. 
            This link will expire in 1 hour for security reasons.
          </p>
          
          <div class="footer">
            <p>© 2025 Gensoft ERP - Smart Logistics Management System</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}