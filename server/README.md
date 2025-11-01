# Speed Reading Backend API

Backend API server cho ứng dụng Speed Reading Course.

## 🚀 Quick Start

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình environment variables
Copy file `.env.example` thành `.env` và điền thông tin:

```bash
cp .env.example .env
```

Sau đó chỉnh sửa các giá trị trong `.env`:
- `MONGODB_URI`: Connection string từ MongoDB Atlas
- `JWT_SECRET`: Secret key cho JWT (dùng command trong BACKEND_SETUP_GUIDE.md)
- `ADMIN_EMAIL` và `ADMIN_PASSWORD`: Thông tin admin mặc định
- `BASE_URL`: Base URL của server (cho production)

### 3. Tạo admin đầu tiên
```bash
node utils/seedAdmin.js
```

Hoặc sử dụng API (thay `${BASE_URL}` bằng URL thực tế):
```bash
curl -X POST ${BASE_URL}/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"admin123"}'
```

### 4. Chạy server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server sẽ chạy tại port được cấu hình trong biến môi trường PORT (mặc định: 5000)

**Health Check:**
```bash
curl ${BASE_URL}/api/health
# Thay ${BASE_URL} bằng URL thực tế của server
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại (Protected)
- `PUT /api/auth/profile` - Cập nhật profile (Protected)

### Contacts
- `POST /api/contacts` - Tạo contact mới (Public)
- `GET /api/contacts` - Lấy danh sách contacts (Admin only)
- `GET /api/contacts/:id` - Lấy contact theo ID (Admin only)
- `PUT /api/contacts/:id` - Cập nhật contact (Admin only)
- `DELETE /api/contacts/:id` - Xóa contact (Admin only)

### Admin
- `GET /api/admin/dashboard` - Lấy thống kê dashboard (Admin only)
- `GET /api/admin/users` - Lấy danh sách users (Admin only)
- `POST /api/admin/users` - Tạo user mới (Admin only)
- `PUT /api/admin/users/:id` - Cập nhật user (Admin only)
- `DELETE /api/admin/users/:id` - Xóa user (Admin only)
- `GET /api/admin/smartread/users` - Lấy users với SmartRead stats (Admin only)
- `GET /api/admin/smartread/users/:userId/sessions` - Lấy sessions của user (Admin only)
- `POST /api/admin/init` - Tạo admin đầu tiên (Public, chỉ dùng 1 lần)

### SmartRead
- `POST /api/smartread/sessions` - Tạo reading session (Protected)
- `GET /api/smartread/sessions` - Lấy reading history (Protected)
- `GET /api/smartread/sessions/:id` - Lấy session chi tiết (Protected)
- `POST /api/smartread/quiz-results` - Lưu quiz result (Protected)
- `GET /api/smartread/stats` - Lấy user statistics (Protected)

## 🔐 Authentication

Tất cả các API protected cần gửi JWT token trong header:
```
Authorization: Bearer <token>
```

## 📝 Notes

- Xem `BACKEND_SETUP_GUIDE.md` để biết cách setup MongoDB Atlas
- Xem `ENVIRONMENT_CONFIGURATION.md` để biết cách cấu hình environment variables đúng
- Frontend sử dụng relative path `/api` trong development (được proxy bởi Vite)
- Production: Set `VITE_API_URL` trong `.env.production` với URL đầy đủ của API server

## 🌐 Environment Variables

Backend sử dụng các biến môi trường sau:
- `PORT`: Server port (default: 5000)
- `HOST`: Server host (default: 0.0.0.0)
- `BASE_URL`: Base URL cho server (cho logs và health check)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key cho JWT tokens
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`: Admin credentials for seeding
- `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`: Gemini API keys

Xem `.env.example` để biết cấu trúc đầy đủ.

## 📄 License

MIT License
