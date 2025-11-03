/**
 * Email Service - Example với Resend
 * 
 * Đây là file mẫu. Copy nội dung này vào emailService.js sau khi cài đặt Resend
 * 
 * 1. npm install resend
 * 2. Copy code này vào emailService.js
 * 3. Thêm RESEND_API_KEY vào .env
 */

import { Resend } from 'resend';

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'resend';
    this.fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    this.fromName = process.env.FROM_NAME || 'QuickRead';
    
    if (this.provider === 'resend') {
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️  RESEND_API_KEY not found. Email sending will be mocked.');
      } else {
        this.resend = new Resend(process.env.RESEND_API_KEY);
      }
    }
  }

  async sendEmail(emailData) {
    const { to, subject, html, text } = emailData;

    try {
      // Resend Provider
      if (this.provider === 'resend' && this.resend) {
        const { data, error } = await this.resend.emails.send({
          from: `${this.fromName} <${this.fromEmail}>`,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text || this.stripHtml(emailData.html),
        });

        if (error) {
          console.error('❌ Resend error:', error);
          throw error;
        }

        console.log(`✅ Email sent via Resend: ${data.id} to ${to}`);
        return {
          success: true,
          messageId: data.id,
        };
      }

      // Fallback: Mock (for development/testing)
      console.log('📧 Email would be sent (mock):', {
        to,
        subject,
        from: `${this.fromName} <${this.fromEmail}>`,
      });

      return {
        success: true,
        messageId: `mock_${Date.now()}`,
      };
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }

  // Helper: Strip HTML to create plain text
  stripHtml(html) {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ... other methods remain the same (sendLeadMagnetWelcome, etc.)
}

export default new EmailService();

