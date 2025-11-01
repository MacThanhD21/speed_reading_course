import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config();

const checkAdmin = async () => {
  try {
    console.log('🔍 Đang kiểm tra kết nối database...');
    await connectDB();

    console.log('\n📋 Kiểm tra thông tin trong .env:');
    console.log('  ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'KHÔNG CÓ (sẽ dùng mặc định: admin@speedreading.com)');
    console.log('  ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? '***' + process.env.ADMIN_PASSWORD.slice(-3) : 'KHÔNG CÓ (sẽ dùng mặc định: admin123)');

    // Check if any admin exists
    console.log('\n👤 Đang kiểm tra admin trong database...');
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('✅ Admin đã tồn tại trong database:');
      console.log('  📧 Email:', adminExists.email);
      console.log('  👤 Tên:', adminExists.name);
      console.log('  🔑 Role:', adminExists.role);
      console.log('  ✅ Trạng thái:', adminExists.isActive ? 'Hoạt động' : 'Vô hiệu');
      console.log('\n💡 Đăng nhập với:');
      console.log('  Email:', adminExists.email);
      console.log('  Password: (password từ .env hoặc password bạn đã set khi tạo admin)');
    } else {
      console.log('❌ KHÔNG TÌM THẤY ADMIN trong database!');
      console.log('\n💡 Để tạo admin, chạy:');
      console.log('  node utils/seedAdmin.js');
    }

    // List all users for debugging
    console.log('\n📊 Tất cả users trong database:');
    const allUsers = await User.find({}).select('name email role isActive');
    if (allUsers.length === 0) {
      console.log('  (Chưa có user nào)');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Active: ${user.isActive}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra:', error.message);
    console.error('\n💡 Kiểm tra:');
    console.error('  - File server/.env có tồn tại không?');
    console.error('  - MONGODB_URI trong .env đúng chưa?');
    console.error('  - Database đã kết nối thành công chưa?');
    process.exit(1);
  }
};

checkAdmin();

