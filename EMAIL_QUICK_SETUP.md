# 🚀 Hướng Dẫn Setup Email Marketing (Quick Start)

## ⚠️ Vấn đề hiện tại

Hiện tại email service chỉ là **MOCK** (không gửi email thật). Có 3 bước cần làm để email hoạt động:

1. ✅ **Tạo Email Campaigns** trong database
2. ⚠️ **Setup Email Provider** (Resend/SendGrid/Mailgun)
3. ⚠️ **Setup Cron Job** để tự động xử lý email queue

---

## 📝 Bước 1: Tạo Email Campaigns

Chạy script để tạo các email campaigns mặc định:

```bash
cd server
node utils/seedEmailCampaigns.js
```

Script sẽ tạo 4 campaigns:
- ✅ Welcome Email (Lead Magnet)
- ✅ Thank You Email (Contact Form)
- ✅ Special Offer (Exit Intent)
- ✅ User Welcome (Registration)

---

## 📧 Bước 2: Setup Email Provider

### Option A: Resend (Khuyến nghị - Dễ nhất)

**1. Cài đặt package:**
```bash
cd server
npm install resend
```

**2. Đăng ký Resend:**
- Vào https://resend.com
- Sign up (miễn phí, 100 emails/ngày)
- Lấy API key từ dashboard

**3. Verify domain (hoặc dùng test domain):**
- Resend cung cấp domain test: `onboarding@resend.dev`
- Hoặc verify domain của bạn để dùng email riêng

**4. Cập nhật `.env`:**
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
# Hoặc dùng test domain:
# FROM_EMAIL=onboarding@resend.dev
FROM_NAME=QuickRead
FRONTEND_URL=http://localhost:3000
```

**5. Cập nhật `server/utils/emailService.js`:**

Thay thế method `sendEmail` bằng:

```javascript
import { Resend } from 'resend';

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'resend';
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@quickread.com';
    this.fromName = process.env.FROM_NAME || 'QuickRead';
    
    if (this.provider === 'resend') {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  async sendEmail(emailData) {
    const { to, subject, html, text } = emailData;

    try {
      if (this.provider === 'resend') {
        const { data, error } = await this.resend.emails.send({
          from: `${this.fromName} <${this.fromEmail}>`,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text || '',
        });

        if (error) {
          console.error('Resend error:', error);
          throw error;
        }

        return {
          success: true,
          messageId: data.id,
        };
      }

      // Fallback: log if provider not configured
      console.log('📧 Email would be sent:', {
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
}
```

---

### Option B: SendGrid

**1. Cài đặt:**
```bash
npm install @sendgrid/mail
```

**2. Setup:**
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=QuickRead
```

**3. Cập nhật emailService.js:**
```javascript
import sgMail from '@sendgrid/mail';

// In constructor:
if (this.provider === 'sendgrid') {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// In sendEmail:
if (this.provider === 'sendgrid') {
  await sgMail.send({
    from: `${this.fromName} <${this.fromEmail}>`,
    to: emailData.to,
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text || '',
  });
  return { success: true, messageId: 'sent' };
}
```

---

## ⚙️ Bước 3: Setup Cron Job (Tự động xử lý email queue)

Email queue chỉ gửi khi có script process queue chạy. Có 3 cách:

### Option A: Tích hợp vào server.js (Đơn giản nhất)

**1. Cài đặt node-cron:**
```bash
npm install node-cron
```

**2. Thêm vào `server/server.js`:**
```javascript
import cron from 'node-cron';
import { processEmailQueue } from './utils/emailQueueManager.js';

// ... existing code ...

// Process email queue every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('📧 Processing email queue...');
  try {
    await processEmailQueue();
  } catch (error) {
    console.error('Error processing email queue:', error);
  }
});
```

### Option B: Chạy thủ công

```bash
# Chạy mỗi khi muốn gửi email
node server/utils/cronEmailProcessor.js
```

### Option C: PM2 Cron (Production)

```bash
pm2 start server/utils/cronEmailProcessor.js --name email-processor --cron "*/5 * * * *"
```

---

## 🧪 Bước 4: Test Email

**1. Submit contact form trên website**

**2. Check logs:**
```bash
# Xem console để thấy email được queue
✅ Queued email: welcome to user@example.com
```

**3. Chạy email processor:**
```bash
node server/utils/cronEmailProcessor.js
```

**4. Check email inbox**

---

## 🔍 Troubleshooting

### Email không được gửi?

**1. Kiểm tra campaigns đã được tạo:**
```bash
node server/utils/seedEmailCampaigns.js
```

**2. Kiểm tra email queue:**
```bash
# Trong MongoDB Compass hoặc mongo shell
db.emailqueues.find({ status: 'pending' })
```

**3. Kiểm tra logs:**
- Backend console sẽ hiển thị: `✅ Queued email: ...`
- Khi process: `📧 Processing email queue...`

**4. Test email service trực tiếp:**
```javascript
// Test trong Node.js
import emailService from './utils/emailService.js';

await emailService.sendEmail({
  to: 'your-email@example.com',
  subject: 'Test Email',
  html: '<h1>Test</h1>',
});
```

### Email được queue nhưng không gửi?

- ✅ Đã setup email provider chưa?
- ✅ API key đúng chưa?
- ✅ FROM_EMAIL đã verify chưa? (Resend cần verify domain)
- ✅ Cron job có chạy không?

### Campaign không tìm thấy?

- ✅ Đã chạy `seedEmailCampaigns.js` chưa?
- ✅ Campaign `isActive: true` chưa?
- ✅ `source` và `type` có match không?

---

## 📊 Xem Email Queue trong Admin Panel

Sau khi setup xong, có thể xem email queue qua API:

```
GET /api/admin/emails/queue
GET /api/admin/emails/queue-stats
```

---

## ✅ Checklist

- [ ] Đã chạy `seedEmailCampaigns.js`
- [ ] Đã cài đặt email provider package (resend/sendgrid)
- [ ] Đã thêm API key vào `.env`
- [ ] Đã cập nhật `emailService.js` với provider thật
- [ ] Đã setup cron job hoặc test manual
- [ ] Đã test gửi email thành công

---

## 🎯 Next Steps

Sau khi email hoạt động:

1. **Customize templates** - Sửa HTML trong EmailCampaign
2. **Add more campaigns** - Tạo follow-up emails
3. **Track metrics** - Xem open rate, click rate
4. **A/B testing** - Test subject lines

---

## 📚 Resources

- [Resend Docs](https://resend.com/docs)
- [SendGrid Docs](https://docs.sendgrid.com/)
- [Node-Cron Docs](https://www.npmjs.com/package/node-cron)

