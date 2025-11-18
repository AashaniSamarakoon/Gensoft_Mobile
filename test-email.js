const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('🔧 Testing Email Configuration...');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_FROM:', process.env.SMTP_FROM);
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Test connection
  try {
    console.log('\n🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    // Send test email
    console.log('\n📤 Sending test verification email...');
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Gensoft ERP" <noreply@gensoft.com>',
      to: 'ashanisamarakoon36@gmail.com',
      subject: 'Test Email - Mobile ERP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #333;">Test Email - Gensoft ERP</h2>
            <p>This is a test email to verify the email configuration is working.</p>
            <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0;">
              <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 5px;">TEST123</div>
              <div style="color: #ff6b6b; font-size: 14px; font-weight: bold;">⏰ Test verification code</div>
            </div>
            <p>If you received this email, the email configuration is working correctly!</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('📬 Check your email inbox for the test message');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('   - Gmail App Password is correct');
      console.log('   - 2-Factor Authentication is enabled');
      console.log('   - App Password was generated correctly');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Connection failed. Please check:');
      console.log('   - Internet connection');
      console.log('   - SMTP server settings');
      console.log('   - Firewall settings');
    }
  }
}

testEmail().catch(console.error);