/**
 * Email service for sending notifications with Brevo API, SendGrid API and Nodemailer fallback
 */

import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import axios from 'axios';
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
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const emailService = process.env.EMAIL_SERVICE || config.email.service;
  
  if (emailService === 'SendGrid' && sendgridApiKey) {
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: sendgridApiKey,
      },
    });
  }

  const transportConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
      user: config.email.user,
      pass: config.email.pass, 
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    connectionTimeout: 60000, 
    greetingTimeout: 30000,    
    socketTimeout: 60000,      
  };

  return nodemailer.createTransport(transportConfig);
};

/**
 * Send email using SendGrid API (preferred) or Nodemailer fallback
 * @param {EmailOptions} options - Email options
 * @returns {Promise<boolean>} Success status
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    const brevoApiKey = process.env.BREVO_API_KEY;
    const emailService = process.env.EMAIL_SERVICE || config.email.service;
    const hasGmailConfig = config.email.user && config.email.pass;
    const hasSendGridConfig = emailService === 'SendGrid' && sendgridApiKey;
    const hasBrevoConfig = emailService === 'brevo_api' && brevoApiKey;
    
    if (!hasGmailConfig && !hasSendGridConfig && !hasBrevoConfig) {
      console.log(`📧 [EMAIL SIMULATION] Would send email to: ${options.to}`);
      console.log(`📧 Subject: ${options.subject}`);
      console.log(`📧 Content: ${options.text || options.html}`);
      return true;
    }

    if (hasBrevoConfig) {
      return await sendEmailWithBrevo(options, brevoApiKey!);
    }

    if (hasSendGridConfig) {
      return await sendEmailWithSendGrid(options, sendgridApiKey!);
    }

    if (hasGmailConfig) {
      return await sendEmailWithNodemailer(options);
    }

    return false;

  } catch (error: any) {
    console.error('❌ Email service failed:', error.message);
    return false;
  }
};

/**
 * Send email using SendGrid API (HTTP - production ready)
 */
const sendEmailWithSendGrid = async (options: EmailOptions, apiKey: string): Promise<boolean> => {
  try {
    sgMail.setApiKey(apiKey);
    
    const senderEmail = process.env.EMAIL_FROM || config.email.user;
    
    const msg = {
      to: options.to,
      from: senderEmail,
      subject: options.subject,
      text: options.text || '',
      html: options.html || options.text || '',
    };

    console.log(`📤 Sending email via SendGrid API to: ${options.to}`);
    const result = await sgMail.send(msg);
    
    console.log(`✅ Email sent successfully via SendGrid to ${options.to}`);
    console.log(`📧 SendGrid Response Status: ${result[0].statusCode}`);
    return true;

  } catch (error: any) {
    console.error('❌ SendGrid API failed:', error.message);
    if (error.response) {
      console.error('🔧 SendGrid Error Details:', error.response.body);
    }
    throw error;
  }
};

/**
 * Send email using Brevo API (HTTP - production ready)
 */
const sendEmailWithBrevo = async (options: EmailOptions, apiKey: string): Promise<boolean> => {
  try {
    const senderEmail = process.env.EMAIL_FROM || config.email.user;
    
    const emailData = {
      sender: {
        email: senderEmail,
        name: 'UnyFilm'
      },
      to: [
        {
          email: options.to
        }
      ],
      subject: options.subject,
      htmlContent: options.html || options.text || '',
      textContent: options.text || ''
    };

    console.log(`📤 Sending email via Brevo API to: ${options.to}`);
    
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000 
    });
    
    console.log(`✅ Email sent successfully via Brevo to ${options.to}`);
    console.log(`📧 Brevo Response Status: ${response.status}`);
    console.log(`📧 Brevo Message ID: ${response.data.messageId || 'N/A'}`);
    return true;

  } catch (error: any) {
    console.error('❌ Brevo API failed:', error.message);
    if (error.response) {
      console.error('🔧 Brevo Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    throw error;
  }
};

/**
 * Send email using Nodemailer (Gmail SMTP fallback)
 */
const sendEmailWithNodemailer = async (options: EmailOptions): Promise<boolean> => {
  try {
    console.log(`📤 Sending email via Gmail SMTP to: ${options.to}`);
    const transporter = createTransporter();
    
    await transporter.verify();
    console.log('📡 Gmail SMTP transporter verified successfully');
    
    const senderEmail = process.env.EMAIL_FROM || config.email.user;
    const mailOptions = {
      from: `"UnyFilm" <${senderEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully via Gmail SMTP to ${options.to}. MessageId: ${result.messageId}`);
    return true;

  } catch (error: any) {
    console.error('❌ Gmail SMTP failed:', error.message);
    console.error('🔧 SMTP Error Details:', {
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw error;
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
          <h1>🎬 UnyFilm</h1>
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
          <p>&copy; 2025 UnyFilm. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hola,

Recibimos una solicitud para restablecer la contraseña de tu cuenta en UnyFilm.

Para restablecer tu contraseña, visita este enlace:
${resetLink}

⚠️ Este enlace expira en 1 hora por seguridad.

Si no solicitaste este cambio, puedes ignorar este email.

Saludos,
Equipo de UnyFilm
  `;

  return await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
};