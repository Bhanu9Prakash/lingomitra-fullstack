import nodemailer from 'nodemailer';

// Setup the email transporter with existing SMTP config
const transporter = nodemailer.createTransport({
  host: 'smtpout.secureserver.net',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP configuration is not complete. Email sending is disabled.');
    return false;
  }

  try {
    const mailOptions = {
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export function generateVerificationEmail(email: string, token: string, appUrl: string): EmailOptions {
  // If appUrl is not provided, use the production URL
  const baseUrl = appUrl || (process.env.BASE_URL || 'https://lingomitra.com');
  // Link to the frontend, which will then call the API
  const verificationLink = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;
  
  return {
    to: email,
    from: `"LingoMitra" <${process.env.SMTP_USER}>`,
    subject: 'LingoMitra - Verify Your Email',
    text: `
      Welcome to LingoMitra!
      
      Please verify your email address by clicking the link below:
      
      ${verificationLink}
      
      This link will expire in 24 hours.
      
      If you didn't create an account on LingoMitra, you can safely ignore this email.
      
      Thank you,
      The LingoMitra Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #ff6600;">Welcome to LingoMitra!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #ff6600; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Verify Email</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="background-color: #f7f9fc; padding: 10px; border-radius: 4px; word-break: break-all;">${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account on LingoMitra, you can safely ignore this email.</p>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
          <p>Thank you,<br>The LingoMitra Team</p>
        </div>
      </div>
    `
  };
}

export function generatePasswordResetEmail(email: string, token: string, appUrl: string): EmailOptions {
  // If appUrl is not provided, use the production URL
  const baseUrl = appUrl || (process.env.BASE_URL || 'https://lingomitra.com');
  const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  
  return {
    to: email,
    from: `"LingoMitra" <${process.env.SMTP_USER}>`,
    subject: 'LingoMitra - Reset Your Password',
    text: `
      You requested to reset your password on LingoMitra.
      
      Please click the link below to set a new password:
      
      ${resetLink}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, you can safely ignore this email.
      
      Thank you,
      The LingoMitra Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #ff6600;">Reset Your Password</h2>
        <p>You requested to reset your password on LingoMitra.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #ff6600; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="background-color: #f7f9fc; padding: 10px; border-radius: 4px; word-break: break-all;">${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
          <p>Thank you,<br>The LingoMitra Team</p>
        </div>
      </div>
    `
  };
}