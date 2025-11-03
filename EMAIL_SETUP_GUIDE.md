# 📧 Hướng Dẫn Setup Email Marketing System

## 🎯 Tổng quan

Hệ thống email marketing đã được tích hợp sẵn với:
- ✅ Email Campaign Management
- ✅ Email Queue System (lên lịch gửi)
- ✅ Automatic Email Sequences (theo source)
- ✅ Template System
- ✅ Tracking & Analytics

---

## 📋 Bước 1: Chọn Email Provider

### Option 1: Resend (Khuyến nghị - Modern & Developer-friendly)
```bash
npm install resend
```

**Setup:**
1. Đăng ký tại https://resend.com
2. Lấy API key
3. Thêm vào `.env`:
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=QuickRead
```

### Option 2: SendGrid (Popular & Reliable)
```bash
npm install @sendgrid/mail
```

**Setup:**
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=QuickRead
```

### Option 3: Mailgun
```bash
npm install mailgun.js
```

**Setup:**
```env
EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=key-xxxxxxxxxxxxx
MAILGUN_DOMAIN=mg.yourdomain.com
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=QuickRead
```

### Option 4: SMTP (Nodemailer)
```bash
npm install nodemailer
```

**Setup:**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=QuickRead
```

---

## 🔧 Bước 2: Cập nhật EmailService

Cập nhật file `server/utils/emailService.js` với implementation thực tế:

```javascript
// Example với Resend
import { Resend } from 'resend';

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'resend';
    
    if (this.provider === 'resend') {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
    // ... other providers
  }

  async sendEmail(emailData) {
    if (this.provider === 'resend') {
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });

      if (error) throw error;
      return { success: true, messageId: data.id };
    }
    // ... other providers
  }
}
```

---

## ⚙️ Bước 3: Setup Cron Job

### Option A: Railway Cron Jobs
Railway hỗ trợ cron jobs tự động:

1. Thêm vào `railway.json`:
```json
{
  "cron": {
    "email-processor": {
      "schedule": "*/5 * * * *",
      "command": "node utils/cronEmailProcessor.js"
    }
  }
}
```

### Option B: Node-Cron trong Server
Thêm vào `server.js`:

```javascript
import cron from 'node-cron';
import { processEmailQueue } from './utils/emailQueueManager.js';

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Processing email queue...');
  await processEmailQueue();
});
```

### Option C: PM2 Cron
```bash
pm2 start server/utils/cronEmailProcessor.js --name email-processor --cron "*/5 * * * *"
```

---

## 📝 Bước 4: Tạo Email Campaigns

Tạo các email campaigns mặc định trong database:

### Campaign 1: Welcome Email (Lead Magnet)
- Type: `welcome`
- Source: `lead_magnet`
- Delay: `0` days
- Subject: "🎁 Tài liệu miễn phí đã sẵn sàng!"
- Content: (xem template trong emailService.js)

### Campaign 2: Thank You Email (Contact Form)
- Type: `welcome`
- Source: `homepage`
- Delay: `0` days
- Subject: "Cảm ơn bạn đã quan tâm đến khóa học!"

### Campaign 3: Exit Intent Offer
- Type: `promotional`
- Source: `exit_intent_popup`
- Delay: `0` days
- Subject: "🎁 Ưu đãi 120.000 VNĐ dành riêng cho bạn!"

### Campaign 4: User Welcome
- Type: `welcome`
- Source: `user_registration`
- Delay: `0` days
- Subject: "Chào mừng bạn đến với QuickRead! 🚀"

**Có thể tạo qua Admin Panel hoặc seed script**

---

## 🎯 Bước 5: Test Email System

### Test Manual:
```bash
# Trong server directory
node -e "
  import('./utils/emailService.js').then(async (emailService) => {
    await emailService.default.sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<h1>Test</h1>'
    });
  });
"
```

### Test với Contact mới:
1. Submit contact form trên website
2. Check logs xem email có được queue không
3. Run email processor: `node server/utils/cronEmailProcessor.js`
4. Check email inbox

---

## 📊 Bước 6: Monitor & Analytics

### Xem Email Queue:
- API: `GET /api/admin/emails/queue`
- Stats: `GET /api/admin/emails/queue-stats`

### Metrics:
- Số email pending
- Số email đã gửi
- Số email failed
- Số email scheduled hôm nay

---

## 🔐 Bước 7: Unsubscribe System

### Frontend:
Tạo route `/unsubscribe`:
```jsx
// Unsubscribe.jsx
const Unsubscribe = () => {
  // Call API to mark email as unsubscribed
  // Update EmailQueue tracking.unsubscribed = true
}
```

### Backend:
Tạo endpoint để xử lý unsubscribe:
```javascript
// POST /api/emails/unsubscribe
// Update all EmailQueue entries with this email
```

---

## 🚀 Quick Start Checklist

- [ ] Chọn email provider
- [ ] Install package (resend/sendgrid/mailgun/nodemailer)
- [ ] Setup environment variables
- [ ] Update emailService.js với provider thực tế
- [ ] Test gửi email thủ công
- [ ] Setup cron job để process queue
- [ ] Tạo email campaigns mặc định
- [ ] Test với contact form thực tế
- [ ] Monitor email queue trong admin panel
- [ ] Setup unsubscribe system

---

## 📈 Next Steps

1. **Email Templates Management**: Admin panel để tạo/sửa templates
2. **A/B Testing**: Test subject lines, content
3. **Segmentation**: Phân loại leads theo behavior
4. **Advanced Analytics**: Open rate, click rate, conversion rate
5. **Personalization**: Dynamic content dựa trên user data

---

## ⚠️ Lưu ý quan trọng

1. **Rate Limits**: Mỗi provider có giới hạn số email/ngày
2. **Spam Prevention**: Không gửi quá nhiều, follow best practices
3. **GDPR**: Cần consent checkbox khi thu thập email
4. **Testing**: Luôn test trên nhiều email clients
5. **Backup**: Có backup plan nếu provider fail

---

## 📚 Resources

- [Resend Docs](https://resend.com/docs)
- [SendGrid Docs](https://docs.sendgrid.com/)
- [Mailgun Docs](https://documentation.mailgun.com/)
- [Email Best Practices](https://www.campaignmonitor.com/dev-resources/guides/email-marketing-best-practices/)

