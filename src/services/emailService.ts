/**
 * Email service for sending notifications
 */

import nodemailer from 'nodemailer';
import { config } from '../config/environment';

/**
 * Email configuration interface
 */
interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Create email transporter with support for multiple services
 */
const createTransporter = () => {
  // Check for SendGrid configuration
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const emailService = process.env.EMAIL_SERVICE || config.email.service;
  
  if (emailService === 'SendGrid' && sendgridApiKey) {
    // SendGrid configuration
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: sendgridApiKey,
      },
    });
  }

  // Gmail configuration (fallback)
  const transportConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.pass, // App password, not regular password
    },
    // Production-specific settings for Render
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    connectionTimeout: 60000, // 60s
    greetingTimeout: 30000,    // 30s
    socketTimeout: 60000,      // 60s
  };

  return nodemailer.createTransport(transportConfig);
};

/**
 * Send email function
 * @param {EmailOptions} options - Email options
 * @returns {Promise<boolean>} Success status
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // Check if email service is configured
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    const emailService = process.env.EMAIL_SERVICE || config.email.service;
    const hasGmailConfig = config.email.user && config.email.pass;
    const hasSendGridConfig = emailService === 'SendGrid' && sendgridApiKey;
    
    if (!hasGmailConfig && !hasSendGridConfig) {
      console.log(`📧 [EMAIL SIMULATION] Would send email to: ${options.to}`);
      console.log(`📧 Subject: ${options.subject}`);
      console.log(`📧 Content: ${options.text || options.html}`);
      return true;
    }

    console.log(`📤 Attempting to send email to: ${options.to} using ${emailService}`);
    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('📡 Email transporter verified successfully');
    
    // Determine sender email
    const senderEmail = process.env.EMAIL_FROM || config.email.user;
    const mailOptions = {
      from: `"Movie Platform" <${senderEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${options.to}. MessageId: ${result.messageId}`);
    return true;

  } catch (error: any) {
    console.error('❌ Email sending failed:', error.message);
    console.error('🔧 Error details:', {
      code: error.code,
      command: error.command,
      response: error.response
    });
    
    // Graceful fallback - don't break the password reset flow
    console.log('🔄 Email service unavailable, but password reset token is still valid');
    return false;
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetLink - Password reset link
 * @returns {Promise<boolean>} Success status
 */
export const sendPasswordResetEmail = async (email: string, resetLink: string): Promise<boolean> => {
  const subject = 'Restablece tu contraseña';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Restablecer contraseña</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .button { 
          display: inline-block; 
          background: #007bff; 
          color: white; 
          padding: 12px 30px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎬 Movie Platform</h1>
        </div>
        
        <div class="content">
          <h2>Restablece tu contraseña</h2>
          <p>Hola,</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si no fuiste tú, puedes ignorar este email.</p>
          
          <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" class="button">Restablecer contraseña</a>
          </p>
          
          <div class="warning">
            ⚠️ <strong>Este enlace expira en 1 hora</strong> por seguridad.
          </div>
          
          <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px;">
            ${resetLink}
          </p>
        </div>
        
        <div class="footer">
          <p>Si no solicitaste este cambio, tu cuenta sigue siendo segura.</p>
          <p>&copy; 2025 Movie Platform. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hola,

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Movie Platform.

Para restablecer tu contraseña, visita este enlace:
${resetLink}

⚠️ Este enlace expira en 1 hora por seguridad.

Si no solicitaste este cambio, puedes ignorar este email.

Saludos,
Equipo de Movie Platform
  `;

  return await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
};