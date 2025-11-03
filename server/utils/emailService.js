/**
 * Email Service - Centralized email sending utility
 * 
 * Supports multiple email providers:
 * - Resend (recommended for modern apps)
 * - SendGrid
 * - Mailgun
 * - Nodemailer (SMTP)
 * 
 * Configure via environment variables:
 * - EMAIL_PROVIDER: 'resend' | 'sendgrid' | 'mailgun' | 'smtp'
 * - Email provider specific keys (see below)
 */

// Placeholder email service
// In production, integrate with actual email provider

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'smtp';
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@quickread.com';
    this.fromName = process.env.FROM_NAME || 'QuickRead';
  }

  /**
   * Send email
   * @param {Object} emailData - { to, subject, html, text }
   * @returns {Promise<Object>} - { success, messageId }
   */
  async sendEmail(emailData) {
    const { to, subject, html, text } = emailData;

    try {
      // TODO: Integrate with actual email provider
      // For now, just log (replace with actual implementation)
      
      console.log('📧 Email would be sent:', {
        to,
        subject,
        from: `${this.fromName} <${this.fromEmail}>`,
      });

      // In production, implement actual sending:
      /*
      if (this.provider === 'resend') {
        return await this.sendViaResend(emailData);
      } else if (this.provider === 'sendgrid') {
        return await this.sendViaSendGrid(emailData);
      } else if (this.provider === 'mailgun') {
        return await this.sendViaMailgun(emailData);
      } else {
        return await this.sendViaSMTP(emailData);
      }
      */

      // Temporary mock response
      return {
        success: true,
        messageId: `mock_${Date.now()}`,
      };
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }

  /**
   * Send welcome email for lead magnet
   */
  async sendLeadMagnetWelcome(contact) {
    const subject = '🎁 Tài liệu miễn phí đã sẵn sàng!';
    const html = this.getLeadMagnetWelcomeTemplate(contact);

    return this.sendEmail({
      to: contact.email,
      subject,
      html,
    });
  }

  /**
   * Send thank you email for contact form
   */
  async sendContactThankYou(contact) {
    const subject = 'Cảm ơn bạn đã quan tâm đến khóa học!';
    const html = this.getContactThankYouTemplate(contact);

    return this.sendEmail({
      to: contact.email,
      subject,
      html,
    });
  }

  /**
   * Send exit intent offer email
   */
  async sendExitIntentOffer(contact) {
    const subject = '🎁 Ưu đãi 120.000 VNĐ dành riêng cho bạn!';
    const html = this.getExitIntentOfferTemplate(contact);

    return this.sendEmail({
      to: contact.email,
      subject,
      html,
    });
  }

  /**
   * Send user welcome email
   */
  async sendUserWelcome(user) {
    const subject = 'Chào mừng bạn đến với QuickRead! 🚀';
    const html = this.getUserWelcomeTemplate(user);

    return this.sendEmail({
      to: user.email,
      subject,
      html,
    });
  }

  // Template methods (simplified - in production use proper templating engine)
  getLeadMagnetWelcomeTemplate(contact) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1A66CC 0%, #1555B0 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎁 Cảm ơn bạn đã đăng ký!</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px;">
          <p>Xin chào <strong>${contact.name}</strong>,</p>
          <p>Tài liệu <strong>"10 Kỹ Thuật Đọc Nhanh Hiệu Quả"</strong> đã sẵn sàng cho bạn!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://yourdomain.com'}/download/10-ky-thuat-doc-nhanh" 
               style="background: #1A66CC; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              📥 Tải tài liệu ngay
            </a>
          </div>
          <p>Trong tài liệu này, bạn sẽ học được:</p>
          <ul>
            <li>Kỹ thuật Skimming & Scanning</li>
            <li>Cách loại bỏ thói quen đọc thành tiếng</li>
            <li>Phương pháp đọc theo nhóm từ</li>
            <li>Và nhiều kỹ thuật khác...</li>
          </ul>
          <p>Chúc bạn học tốt!<br><strong>Đội ngũ QuickRead</strong></p>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
          <p>Nếu bạn không muốn nhận email nữa, <a href="${process.env.FRONTEND_URL || 'https://yourdomain.com'}/unsubscribe?email=${contact.email}">click here</a></p>
        </div>
      </body>
      </html>
    `;
  }

  getContactThankYouTemplate(contact) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1A66CC 0%, #1555B0 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Cảm ơn bạn đã liên hệ!</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px;">
          <p>Xin chào <strong>${contact.name}</strong>,</p>
          <p>Chúng tôi đã nhận được thông tin của bạn và sẽ phản hồi trong vòng <strong>24 giờ</strong>.</p>
          ${contact.message ? `<p><strong>Câu hỏi của bạn:</strong><br>${contact.message}</p>` : ''}
          <div style="background: #f0f9ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1A66CC;">Về khóa học của chúng tôi:</h3>
            <ul style="margin: 0;">
              <li>✅ Tăng tốc độ đọc lên 3-5 lần</li>
              <li>✅ 98% học viên thành công</li>
              <li>✅ Hỗ trợ 24/7</li>
              <li>✅ Đảm bảo hoàn tiền</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://yourdomain.com'}" 
               style="background: #1A66CC; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Xem chi tiết khóa học
            </a>
          </div>
          <p>Trân trọng,<br><strong>Đội ngũ QuickRead</strong></p>
        </div>
      </body>
      </html>
    `;
  }

  getExitIntentOfferTemplate(contact) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎁 Ưu đãi đặc biệt dành cho bạn!</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px;">
          <p>Xin chào <strong>${contact.name}</strong>,</p>
          <p>Chúng tôi nhận thấy bạn quan tâm đến khóa học đọc nhanh. Đây là ưu đãi đặc biệt dành riêng cho bạn:</p>
          <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h2 style="margin: 0; color: #92400E; font-size: 32px;">Giảm 120.000 VNĐ</h2>
            <p style="margin: 10px 0; color: #78350F;">Áp dụng cho khóa học Kỹ Thuật Đọc Nhanh</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://yourdomain.com'}?discount=EXIT120" 
               style="background: #F59E0B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Áp dụng ưu đãi ngay
            </a>
          </div>
          <p><strong>Ưu đãi có hạn!</strong> Áp dụng trong 72 giờ tới.</p>
          <p>Trân trọng,<br><strong>Đội ngũ QuickRead</strong></p>
        </div>
      </body>
      </html>
    `;
  }

  getUserWelcomeTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1A66CC 0%, #1555B0 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🚀 Chào mừng đến với QuickRead!</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px;">
          <p>Xin chào <strong>${user.name}</strong>,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản QuickRead! Bạn đã sẵn sàng bắt đầu hành trình đọc nhanh của mình.</p>
          <div style="background: #f0f9ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1A66CC;">Bắt đầu với SmartRead:</h3>
            <ol style="margin: 0;">
              <li>Đăng nhập vào tài khoản</li>
              <li>Vào mục <strong>SmartRead</strong></li>
              <li>Dán hoặc nhập văn bản muốn đọc</li>
              <li>Chọn chế độ đọc và bắt đầu!</li>
            </ol>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://yourdomain.com'}/smartread" 
               style="background: #1A66CC; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Bắt đầu đọc ngay
            </a>
          </div>
          <p>Nếu bạn có câu hỏi, đừng ngần ngại liên hệ với chúng tôi!</p>
          <p>Trân trọng,<br><strong>Đội ngũ QuickRead</strong></p>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();

