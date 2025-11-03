# 🌍 Environment Configuration Guide

## Frontend Configuration

### Development Mode

Trong development mode, frontend sử dụng relative path `/api` và Vite sẽ tự động proxy requests đến backend server.

**File: `.env` hoặc `.env.local`**
```env
# Sử dụng relative path (khuyến nghị cho development)
VITE_API_URL=/api

# Hoặc nếu backend chạy ở server khác
# VITE_API_URL=http://your-backend-url/api

# Port cho frontend (tùy chọn)
VITE_PORT=3000

# Proxy target cho Vite (chỉ dùng trong development)
# Set URL backend server của bạn cho proxy
# Ví dụ: http://your-backend-server:5000
# Để trống nếu không dùng proxy (sẽ dùng relative path /api)
VITE_API_PROXY=
```

### Production Mode

Trong production, đặt URL đầy đủ của API server:

**File: `.env.production`**
```env
VITE_API_URL=https://api.yourdomain.com/api
```

**Không cần VITE_API_PROXY trong production** vì requests sẽ đi trực tiếp đến API server.

## Backend Configuration

### Environment Variables

**File: `server/.env`**
```env
# Server Configuration
PORT=5000
HOST=0.0.0.0
NODE_ENV=development
# BASE_URL cho development (optional)
# Trong production, đặt URL thực tế của server
BASE_URL=https://api.yourdomain.com

# Duplicate Check Configuration (Development only)
# Set to 'true' to disable duplicate email/phone check for easier testing
# WARNING: Never set this to 'true' in production!
DISABLE_DUPLICATE_CHECK=false

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speedreading_admin

# JWT Secret (tạo secret key mạnh)
JWT_SECRET=your_very_secure_jwt_secret_key_here

# Admin Credentials (for initial setup)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure_password_here
ADMIN_NAME=Admin User

# Gemini API Keys
GEMINI_API_KEY_1=your_gemini_api_key_1
GEMINI_API_KEY_2=your_gemini_api_key_2
```

## Development Setup

### Frontend
```bash
# Frontend sẽ tự động sử dụng /api và proxy đến backend
npm run dev
# Hoặc
npm run dev -- --port 3000
```

### Backend
```bash
cd server
npm start
# Backend sẽ chạy tại port được cấu hình trong .env
```

## Production Setup

### Frontend Build
```bash
# Build với production environment
npm run build

# Deploy dist/ folder lên hosting service
# Đảm bảo .env.production có VITE_API_URL đúng
```

### Backend Deployment
```bash
# Set environment variables trên hosting platform
# Ví dụ: Heroku, Railway, Render, Vercel, etc.

# Environment variables cần set:
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
BASE_URL=https://api.yourdomain.com
```

## Important Notes

1. **Không commit `.env` files** - Chúng đã được thêm vào `.gitignore`
2. **Sử dụng `.env.example`** như template cho các biến môi trường cần thiết
3. **Production URLs** - Luôn sử dụng HTTPS trong production
4. **API Security** - Đảm bảo CORS được cấu hình đúng cho production domain

## Configuration Priority

Frontend sẽ sử dụng environment variables theo thứ tự:
1. `VITE_API_URL` từ `.env.production` (production build)
2. `VITE_API_URL` từ `.env.local` hoặc `.env` (development)
3. Default: `/api` (relative path)

Backend sẽ sử dụng:
1. Environment variables từ hosting platform
2. `.env` file trong `server/` directory
3. Default values trong code

