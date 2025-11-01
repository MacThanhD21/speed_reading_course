import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('✅ Admin đã tồn tại:', adminExists.email);
      process.exit(0);
    }

    // Create admin
    const admin = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@speedreading.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
    });

    console.log('✅ Đã tạo admin thành công!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', process.env.ADMIN_PASSWORD || 'admin123');
    console.log('⚠️  Vui lòng đổi mật khẩu sau khi đăng nhập!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi tạo admin:', error);
    process.exit(1);
  }
};

seedAdmin();

