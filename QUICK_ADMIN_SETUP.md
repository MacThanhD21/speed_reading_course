# 🚀 Hướng Dẫn Nhanh: Tạo Admin User

## ⚡ Cách Nhanh Nhất

### Bước 1: Tạo Admin User

```bash
cd server
npm run seed:admin
```

Hoặc:
```bash
cd server
node utils/seedAdmin.js
```

### Bước 2: Kiểm Tra Admin Đã Tạo

```bash
cd server
npm run check:admin
```

Hoặc:
```bash
cd server
node utils/checkAdmin.js
```

### Bước 3: Đăng Nhập

1. Mở trình duyệt và truy cập trang admin login
2. Nhập thông tin:
   - **Email**: Email từ file `.env` (mặc định: `admin@speedreading.com`)
   - **Password**: Password từ file `.env` (mặc định: `admin123`)

---

## 📝 Thiết Lập File `.env`

Nếu chưa có file `server/.env`, tạo file với nội dung:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speedreading_admin?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Admin Credentials
ADMIN_EMAIL=admin@speedreading.com
ADMIN_PASSWORD=admin123

# Server
PORT=5000
NODE_ENV=development
```

---

## 🔍 Kiểm Tra Admin User

### Xem thông tin admin hiện tại:
```bash
cd server
npm run check:admin
```

Script sẽ hiển thị:
- ✅ Email của admin
- ✅ Trạng thái admin
- ✅ Tất cả users trong database

---

## ⚠️ Lỗi Thường Gặp

### 1. "Admin đã tồn tại" nhưng không đăng nhập được

**Giải pháp:**
1. Chạy `npm run check:admin` để xem email của admin hiện tại
2. Đăng nhập với email đó
3. Nếu không nhớ password, xóa admin cũ trong database và tạo lại

### 2. "Email hoặc mật khẩu không đúng"

**Nguyên nhân:**
- Email/password trong form không khớp với database
- Admin chưa được tạo

**Giải pháp:**
1. Chạy `npm run check:admin` để xem email của admin
2. Chạy `npm run seed:admin` để tạo admin mới (nếu chưa có)
3. Kiểm tra password trong `.env` và form đăng nhập có giống nhau không

### 3. Connection Error

**Giải pháp:**
1. Kiểm tra `MONGODB_URI` trong `.env`
2. Đảm bảo database name là `speedreading_admin`
3. Kiểm tra network access trong MongoDB Atlas

---

## 🎯 Thông Tin Đăng Nhập Mặc Định

Sau khi chạy `seed:admin` với file `.env` mặc định:

- **Email**: `admin@speedreading.com`
- **Password**: `admin123`
- **URL**: Trang admin login (URL tùy thuộc vào cấu hình deployment)

**⚠️ LƯU Ý**: Đổi mật khẩu ngay sau khi đăng nhập thành công!

---

## 📞 Các Lệnh Tiện Ích

```bash
# Tạo admin mới
npm run seed:admin

# Kiểm tra admin hiện tại
npm run check:admin

# Chạy server development
npm run dev

# Chạy server production
npm start
```

