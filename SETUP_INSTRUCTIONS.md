# Hướng Dẫn Setup Dự Án Speed Reading

## 📋 Tổng Quan

Dự án bao gồm:
- **Frontend**: React + Vite (Port 3000)
- **Backend**: Node.js + Express (Port 5000)
- **Database**: MongoDB Atlas

## 🚀 Setup Backend

### 1. Cài đặt dependencies
```bash
cd server
npm install
```

### 2. Cấu hình MongoDB Atlas
Xem file `BACKEND_SETUP_GUIDE.md` để biết cách:
- Tạo MongoDB Atlas cluster
- Lấy connection string
- Cấu hình database

### 3. Tạo file `.env`
```bash
cd server
cp .env.example .env
```

Chỉnh sửa `.env` với thông tin MongoDB Atlas của bạn.

### 4. Tạo admin đầu tiên
```bash
cd server
node utils/seedAdmin.js
```

### 5. Chạy backend server
```bash
cd server
npm run dev
```

Backend sẽ chạy tại port được cấu hình (mặc định: 5000)

## 🎨 Setup Frontend

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Tạo file `.env` (nếu chưa có)
Tạo file `.env` trong root folder:
```env
# Sử dụng relative path trong development (sẽ được proxy)
# Trong production, đặt URL thực tế của API server
VITE_API_URL=/api
```

### 3. Chạy frontend
```bash
npm run dev
```

Frontend sẽ chạy tại port được cấu hình (mặc định: 3000)

## 🔐 Truy Cập Admin Panel

1. Mở trình duyệt và truy cập trang admin login
2. Đăng nhập với thông tin admin đã tạo (hoặc từ `.env`):
   - Email: `admin@speedreading.com` (hoặc email bạn đã set)
   - Password: `admin123` (hoặc password bạn đã set)

## 📝 API Endpoints

### Public
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/contacts` - Gửi form liên hệ

### Protected (Cần token)
- `GET /api/auth/me` - Thông tin user
- `PUT /api/auth/profile` - Cập nhật profile

### Admin Only
- `GET /api/admin/dashboard` - Thống kê dashboard
- `GET /api/admin/users` - Danh sách users
- `GET /api/contacts` - Danh sách contacts
- `PUT /api/admin/users/:id` - Cập nhật user
- `PUT /api/contacts/:id` - Cập nhật contact

## 🐛 Troubleshooting

### Backend không kết nối được MongoDB
- ✅ Kiểm tra MongoDB URI trong `.env`
- ✅ Kiểm tra IP đã được whitelist trong MongoDB Atlas
- ✅ Kiểm tra username/password đúng chưa

### Frontend không gọi được API
- ✅ Kiểm tra backend đang chạy
- ✅ Kiểm tra `VITE_API_URL` trong `.env` (nên dùng `/api` cho development)
- ✅ Kiểm tra proxy config trong `vite.config.js`
- ✅ Xem `ENVIRONMENT_CONFIGURATION.md` để biết cách cấu hình đúng

### Admin không đăng nhập được
- ✅ Kiểm tra đã tạo admin chưa (chạy `node utils/seedAdmin.js`)
- ✅ Kiểm tra email/password đúng chưa
- ✅ Kiểm tra user có role = 'admin' trong database

## 📚 Tài Liệu

- `BACKEND_SETUP_GUIDE.md` - Hướng dẫn setup MongoDB Atlas
- `server/README.md` - API documentation
- `README.md` - Project overview

