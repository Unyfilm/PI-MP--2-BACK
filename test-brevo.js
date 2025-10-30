/**
 * Test script for Brevo email service
 * Run with: node test-brevo.js
 */

require('dotenv').config();
const { sendPasswordResetEmail } = require('./dist/services/emailService');

async function testBrevoEmail() {
  console.log('🧪 Testing Brevo Email Service...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE}`);
  console.log(`BREVO_API_KEY: ${process.env.BREVO_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM}`);
  console.log(`CLIENT_URL: ${process.env.CLIENT_URL}\n`);
  
  if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY is required for testing');
    process.exit(1);
  }
  
  if (!process.env.EMAIL_FROM) {
    console.error('❌ EMAIL_FROM is required for testing');
    process.exit(1);
  }
  
  // Test email
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=test-token-123`;
  
  console.log(`📧 Sending test email to: ${testEmail}`);
  console.log(`🔗 Reset link: ${resetLink}\n`);
  
  try {
    const result = await sendPasswordResetEmail(testEmail, resetLink);
    
    if (result) {
      console.log('✅ Email sent successfully via Brevo!');
      console.log('📬 Check your email inbox (and spam folder)');
    } else {
      console.log('❌ Email sending failed');
    }
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    if (error.response) {
      console.error('🔧 Brevo API Error:', error.response.data);
    }
  }
}

testBrevoEmail();
