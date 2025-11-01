# Hướng Dẫn Thiết Lập Backend - MongoDB Atlas & Node.js

## 📋 Mục Lục
1. [Tạo MongoDB Atlas Cluster](#1-tạo-mongodb-atlas-cluster)
2. [Cấu Hình Database](#2-cấu-hình-database)
3. [Cài Đặt Dependencies](#3-cài-đặt-dependencies)
4. [Cấu Hình Environment Variables](#4-cấu-hình-environment-variables)
5. [Chạy Backend Server](#5-chạy-backend-server)
6. [Kiểm Tra Kết Nối](#6-kiểm-tra-kết-nối)

---

## 1. Tạo MongoDB Atlas Cluster

### Bước 1: Đăng ký/Đăng nhập MongoDB Atlas
1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Đăng ký tài khoản miễn phí (hoặc đăng nhập nếu đã có)
3. Chọn **Free Tier (M0)** để bắt đầu miễn phí

### Bước 2: Tạo Cluster
1. Click **"Create"** hoặc **"Build a Database"**
2. Chọn **M0 (Free Shared)** cluster
3. Chọn Cloud Provider: **AWS** (hoặc Azure/GCP)
4. Chọn Region gần nhất (ví dụ: **ap-southeast-1** cho Singapore)
5. Đặt tên cluster (ví dụ: `SpeedReadingDB`)
6. Click **"Create Cluster"**
7. Đợi 3-5 phút để cluster được tạo

### Bước 3: Tạo Database User
1. Trong **Security** → **Database Access**
2. Click **"Add New Database User"**
3. Chọn **"Password"** authentication
4. Đặt username (ví dụ: `speedreading_admin`)
5. Click **"Autogenerate Secure Password"** hoặc tự đặt password (lưu lại!)
6. Database User Privileges: Chọn **"Atlas admin"** hoặc **"Read and write to any database"**
7. Click **"Add User"**

### Bước 4: Whitelist IP Address
1. Trong **Security** → **Network Access**
2. Click **"Add IP Address"**
3. Chọn **"Allow Access from Anywhere"** (0.0.0.0/0) để development
   - ⚠️ **Lưu ý:** Với production, chỉ whitelist IP cụ thể
4. Click **"Confirm"**

### Bước 5: Lấy Connection String
1. Trong **Deployment** → **Database**, click **"Connect"** trên cluster của bạn
2. Chọn **"Connect your application"**
3. Driver: **Node.js**
4. Version: **5.5 or later**
5. Copy connection string (sẽ có dạng):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **QUAN TRỌNG:** Thay `<username>` và `<password>` bằng thông tin user bạn đã tạo
7. Thêm database name vào cuối:
   ```
   mongodb+srv://speedreading_admin:yourpassword@cluster0.xxxxx.mongodb.net/speedreading?retryWrites=true&w=majority
   ```

---

## 2. Cấu Hình Database

### Tạo Database và Collections
Sau khi kết nối thành công, MongoDB Atlas sẽ tự động tạo database khi bạn insert document đầu tiên.

**Collections (tự động tạo bởi Mongoose khi có data):**
- `users` - Lưu thông tin người dùng
- `contacts` - Lưu thông tin form trang chủ
- `reading_sessions` - Lưu lịch sử đọc
  - **Khi nào có data:** Khi user hoàn thành đọc (click "Kết thúc đọc")
  - **API:** `POST /api/smartread/sessions`
- `quiz_results` - Lưu kết quả quiz
  - **Khi nào có data:** Khi user hoàn thành quiz sau khi đọc
  - **API:** `POST /api/smartread/quiz-results`
  - **Lưu ý:** Cần có `readingSessionId` từ reading session trước

**⚠️ Lưu ý:** Collections sẽ được tạo tự động khi có document đầu tiên. Không cần tạo thủ công.

**Xem chi tiết flow:** Xem file `SMARTREAD_DATA_FLOW.md` để hiểu rõ cách data được lưu.

---

## 3. Cài Đặt Dependencies

### Cài đặt backend dependencies:
```bash
cd server
npm install
```

**Hoặc tạo thư mục server và cài đặt:**
```bash
mkdir server
cd server
npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken express-validator
npm install -D nodemon
```

---

## 4. Cấu Hình Environment Variables

### Tạo file `.env` trong thư mục `server/`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://speedreading_admin:yourpassword@cluster0.xxxxx.mongodb.net/speedreading?retryWrites=true&w=majority

# JWT Secret (tạo một chuỗi ngẫu nhiên, bảo mật)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# JWT Expiration
JWT_EXPIRE=7d

# Admin Default Credentials (thay đổi sau khi tạo admin đầu tiên)
ADMIN_EMAIL=admin@speedreading.com
ADMIN_PASSWORD=admin123
```

### Tạo JWT Secret an toàn:
```bash
# Linux/Mac
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Hoặc dùng online tool: https://randomkeygen.com/
```

---

## 5. Chạy Backend Server

### Development mode:
```bash
cd server
npm run dev
```

### Production mode:
```bash
cd server
npm start
```

Server sẽ chạy tại port được cấu hình trong biến môi trường PORT (mặc định: 5000)

---

## 6. Kiểm Tra Kết Nối

### Test API:
```bash
# Health check (thay ${API_URL} bằng URL thực tế của backend)
curl ${API_URL}/api/health

# Đăng ký user
curl -X POST ${API_URL}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Kiểm tra MongoDB Atlas:
1. Vào **Deployment** → **Database** → **Browse Collections**
2. Xem data đã được insert chưa

---

## 🔐 Bảo Mật Production

### Khi deploy production:
1. ✅ Thay đổi JWT_SECRET thành chuỗi ngẫu nhiên phức tạp
2. ✅ Thay đổi default admin credentials
3. ✅ Whitelist chỉ IP của server production
4. ✅ Enable MongoDB Atlas IP Access List restrictions
5. ✅ Sử dụng environment variables thay vì hardcode
6. ✅ Enable MongoDB Atlas encryption at rest
7. ✅ Setup rate limiting cho APIs
8. ✅ Sử dụng HTTPS cho tất cả connections

---

## 📚 Tài Liệu Tham Khảo

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Authentication Best Practices](https://jwt.io/introduction)

---

## ❓ Troubleshooting

### Lỗi kết nối MongoDB:
- ✅ Kiểm tra IP đã được whitelist chưa
- ✅ Kiểm tra username/password đúng chưa
- ✅ Kiểm tra connection string có đầy đủ không
- ✅ Kiểm tra network/firewall không block port

### Lỗi authentication:
- ✅ Kiểm tra JWT_SECRET đã set chưa
- ✅ Kiểm tra token có được gửi đúng trong header không

---

## 📝 Notes

- MongoDB Atlas Free Tier có giới hạn: 512MB storage, shared RAM
- Connection string có thể thay đổi khi cluster được recreate
- Luôn backup connection string và credentials an toàn
- Không commit file `.env` lên Git (đã có trong `.gitignore`)

