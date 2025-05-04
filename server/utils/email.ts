import nodemailer from 'nodemailer';
import { ContactFormData } from '../routes/contact';

// Create email transport
// Using configured SMTP server if credentials are available
// Otherwise, fall back to Ethereal for testing
let transporter: nodemailer.Transporter;

// Initialize the email transporter
async function createTransporter() {
  // Check if SMTP credentials are available
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Use the provided SMTP server settings
    transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    console.log('Using configured SMTP server with credentials');
  } else {
    // Fall back to Ethereal test account if no credentials
    const testAccount = await nodemailer.createTestAccount();
    
    // Create a testing transporter
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    console.log('Using Ethereal test email account:', testAccount.user);
    console.log('Emails will be viewable at: https://ethereal.email');
  }
}

// Initialize transporter when this module is loaded
createTransporter().catch(console.error);

/**
 * Send email notification when contact form is submitted
 */
export async function sendContactFormEmail(formData: ContactFormData): Promise<{ success: boolean; previewUrl?: string }> {
  try {
    if (!transporter) {
      await createTransporter();
    }
    
    // Compose email content
    const mailOptions = {
      from: `"LingoMitra Contact" <contact@lingomitra.com>`,
      to: 'product@lingomitra.com', // The address that will receive contact form submissions
      replyTo: formData.email, // Make it easy to reply to the person
      subject: `[LingoMitra Contact] ${formData.category}: ${formData.name}`,
      text: `
Name: ${formData.name}
Email: ${formData.email}
Category: ${formData.category}

Message:
${formData.message}
      `,
      html: `
<h2>Contact Form Submission</h2>
<p><strong>Name:</strong> ${formData.name}</p>
<p><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
<p><strong>Category:</strong> ${formData.category}</p>
<h3>Message:</h3>
<p>${formData.message.replace(/\n/g, '<br>')}</p>
      `,
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    // For development/testing with Ethereal, provide the URL where the message can be viewed
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Preview URL: %s', previewUrl);
      return { success: true, previewUrl };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false };
  }
}

// Send auto-response to the user who submitted the form
export async function sendAutoResponseEmail(formData: ContactFormData): Promise<{ success: boolean }> {
  try {
    if (!transporter) {
      await createTransporter();
    }
    
    // Compose email content
    const mailOptions = {
      from: `"LingoMitra Support" <support@lingomitra.com>`,
      to: formData.email,
      subject: `Thank you for contacting LingoMitra`,
      text: `
Dear ${formData.name},

Thank you for reaching out to LingoMitra! We've received your message and will get back to you as soon as possible. Our team typically responds within two business days.

For your reference, here's a copy of your message:

Category: ${formData.category}

Message:
${formData.message}

If you have any additional information to share, please reply to this email.

Best regards,
The LingoMitra Team
      `,
      html: `
<h2>Thank you for contacting LingoMitra!</h2>
<p>Dear ${formData.name},</p>
<p>We've received your message and will get back to you as soon as possible. Our team typically responds within two business days.</p>
<p>For your reference, here's a copy of your message:</p>
<p><strong>Category:</strong> ${formData.category}</p>
<h3>Message:</h3>
<p>${formData.message.replace(/\n/g, '<br>')}</p>
<p>If you have any additional information to share, please reply to this email.</p>
<p>Best regards,<br>The LingoMitra Team</p>
      `,
    };
    
    // Send the email
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending auto-response email:', error);
    return { success: false };
  }
}