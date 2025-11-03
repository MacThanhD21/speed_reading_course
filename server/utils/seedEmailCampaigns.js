/**
 * Seed Email Campaigns
 * 
 * Tạo các email campaigns mặc định trong database
 * 
 * Usage: node utils/seedEmailCampaigns.js
 */

import connectDB from '../config/database.js';
import EmailCampaign from '../models/EmailCampaign.js';

const campaigns = [
  // Welcome Email for Lead Magnet
  {
    name: 'Lead Magnet Welcome Email',
    type: 'welcome',
    source: 'lead_magnet',
    subject: '🎁 Tài liệu miễn phí đã sẵn sàng!',
    htmlContent: `
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
          <p>Xin chào <strong>{{name}}</strong>,</p>
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
          <p>Nếu bạn không muốn nhận email nữa, <a href="{{unsubscribe_link}}">click here</a></p>
        </div>
      </body>
      </html>
    `,
    textContent: 'Cảm ơn bạn đã đăng ký! Tài liệu "10 Kỹ Thuật Đọc Nhanh Hiệu Quả" đã sẵn sàng. Vui lòng truy cập link để tải về.',
    delayDays: 0,
    isActive: true,
  },

  // Welcome Email for Homepage Contact Form
  {
    name: 'Homepage Contact Thank You',
    type: 'welcome',
    source: 'homepage',
    subject: 'Cảm ơn bạn đã quan tâm đến khóa học!',
    htmlContent: `
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
          <p>Xin chào <strong>{{name}}</strong>,</p>
          <p>Chúng tôi đã nhận được thông tin của bạn và sẽ phản hồi trong vòng <strong>24 giờ</strong>.</p>
          {{#if message}}
          <p><strong>Câu hỏi của bạn:</strong><br>{{message}}</p>
          {{/if}}
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
    `,
    textContent: 'Cảm ơn bạn đã liên hệ! Chúng tôi đã nhận được thông tin và sẽ phản hồi trong vòng 24 giờ.',
    delayDays: 0,
    isActive: true,
  },

  // Exit Intent Popup Offer
  {
    name: 'Exit Intent Special Offer',
    type: 'promotional',
    source: 'exit_intent_popup',
    subject: '🎁 Ưu đãi 120.000 VNĐ dành riêng cho bạn!',
    htmlContent: `
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
          <p>Xin chào <strong>{{name}}</strong>,</p>
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
    `,
    textContent: 'Ưu đãi đặc biệt: Giảm 120.000 VNĐ cho khóa học Kỹ Thuật Đọc Nhanh. Áp dụng ngay trong 72 giờ!',
    delayDays: 0,
    isActive: true,
  },

  // User Registration Welcome
  {
    name: 'User Registration Welcome',
    type: 'welcome',
    source: 'user_registration',
    subject: 'Chào mừng bạn đến với QuickRead! 🚀',
    htmlContent: `
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
          <p>Xin chào <strong>{{name}}</strong>,</p>
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
    `,
    textContent: 'Chào mừng đến với QuickRead! Bạn đã sẵn sàng bắt đầu hành trình đọc nhanh. Đăng nhập và khám phá SmartRead ngay!',
    delayDays: 0,
    isActive: true,
  },
];

const seedEmailCampaigns = async () => {
  try {
    await connectDB();

    console.log('🌱 Seeding email campaigns...\n');

    let created = 0;
    let skipped = 0;

    for (const campaignData of campaigns) {
      // Check if campaign already exists
      const existing = await EmailCampaign.findOne({
        type: campaignData.type,
        source: campaignData.source,
        delayDays: campaignData.delayDays,
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${campaignData.name} (already exists)`);
        skipped++;
      } else {
        await EmailCampaign.create(campaignData);
        console.log(`✅ Created: ${campaignData.name}`);
        created++;
      }
    }

    console.log(`\n✨ Seeding completed!`);
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${campaigns.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding email campaigns:', error);
    process.exit(1);
  }
};

seedEmailCampaigns();

