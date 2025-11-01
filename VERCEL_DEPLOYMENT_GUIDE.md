# 🚀 Vercel Deployment Guide

## ⚠️ QUAN TRỌNG: Kiến trúc Deployment

**Vercel chỉ host được FRONTEND (React/Vite)**

Backend Node.js/Express **PHẢI** được deploy ở nơi khác:
- ✅ **Railway** (khuyến nghị - miễn phí tier tốt)
- ✅ **Render** (miễn phí, auto-deploy từ Git)
- ✅ **Heroku** (có phí sau free tier)
- ✅ **DigitalOcean App Platform**
- ✅ **Vercel Serverless Functions** (chuyển đổi code - phức tạp)

## 📋 Checklist Deployment

### Bước 1: Deploy Backend

#### Option A: Railway (Khuyến nghị)

1. **Tạo tài khoản Railway**
   - Vào https://railway.app
   - Sign up với GitHub

2. **Tạo project mới**
   ```
   New Project → Deploy from GitHub repo
   → Chọn repo của bạn
   ```

3. **Setup Backend Service**
   - Chọn folder `server/` làm root
   - Railway tự detect Node.js

4. **Cấu hình Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000 (Railway tự set PORT)
   HOST=0.0.0.0
   BASE_URL=https://your-backend.railway.app (Railway sẽ cung cấp)
   MONGODB_URI=mongodb+srv://.../speedreading_admin
   JWT_SECRET=your_jwt_secret_here
   CORS_ORIGIN=https://your-frontend.vercel.app
   GEMINI_API_KEYS=key1,key2,key3
   ```

5. **Deploy**
   - Railway tự động deploy khi có commit mới
   - Lấy URL backend từ Railway dashboard (ví dụ: `https://your-app.railway.app`)

#### Option B: Render

1. **Tạo tài khoản Render**
   - Vào https://render.com
   - Sign up với GitHub

2. **Tạo Web Service**
   ```
   New → Web Service
   → Connect GitHub repo
   → Root Directory: server/
   → Build Command: npm install
   → Start Command: npm start
   ```

3. **Cấu hình Environment Variables** (giống Railway)

4. **Deploy**
   - Render sẽ tự động deploy

### Bước 2: Cấu hình Frontend trên Vercel

1. **Vào Vercel Dashboard**
   - Project Settings → Environment Variables

2. **Thêm Environment Variable**
   ```
   Name: VITE_API_URL
   Value: https://your-backend.railway.app/api
   Environment: Production, Preview, Development
   ```
   
   ⚠️ **QUAN TRỌNG**: 
   - URL phải có `/api` ở cuối
   - Dùng HTTPS
   - Không có trailing slash

3. **Redeploy Frontend**
   - Vào Deployments tab
   - Chọn latest deployment
   - Click "..." → "Redeploy"

### Bước 3: Kiểm tra CORS trên Backend

Đảm bảo backend cho phép frontend domain:

```env
# Trong backend .env
CORS_ORIGIN=https://your-frontend.vercel.app,https://www.your-frontend.vercel.app
```

### Bước 4: Test Deployment

1. **Test Backend Health**
   ```bash
   curl https://your-backend.railway.app/api/health
   ```

2. **Test Frontend**
   - Mở frontend URL trên Vercel
   - Thử đăng ký/đăng nhập
   - Check Browser Console (F12) → Network tab
   - Xem API calls có đi đến đúng backend URL không

## 🔧 Troubleshooting

### Lỗi: "Server returned non-JSON response"

**Nguyên nhân**: Frontend đang gọi `/api` nhưng không có backend xử lý

**Giải pháp**:
1. ✅ Deploy backend lên Railway/Render
2. ✅ Set `VITE_API_URL` trên Vercel
3. ✅ Redeploy frontend

### Lỗi: CORS error

**Nguyên nhân**: Backend không cho phép frontend domain

**Giải pháp**:
- Thêm frontend URL vào `CORS_ORIGIN` trong backend env vars

### Lỗi: 404 trên API routes

**Nguyên nhân**: 
- Backend chưa deploy
- `VITE_API_URL` chưa được set đúng

**Giải pháp**:
- Kiểm tra backend URL
- Kiểm tra environment variables trên Vercel

## 📝 Tóm tắt URLs

Sau khi deploy, bạn sẽ có:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app` (hoặc Render)
- **MongoDB**: MongoDB Atlas (cloud)

## 🎯 Quick Start (Railway)

```bash
# 1. Push code lên GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Tạo Railway project
# - Vào railway.app
# - New Project → Deploy from GitHub
# - Chọn repo → Deploy

# 3. Set env vars trên Railway
# (xem ở trên)

# 4. Set VITE_API_URL trên Vercel
# VITE_API_URL=https://your-backend.railway.app/api

# 5. Redeploy Vercel
# Vercel Dashboard → Redeploy
```

## 💡 Lưu ý

- Railway/Render free tier có thể sleep sau 15 phút không dùng
- Có thể cần upgrade để có always-on
- Hoặc dùng cron job để keep-alive backend

