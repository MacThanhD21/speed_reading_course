# 🔐 Hướng Dẫn Đăng Nhập Admin

## Vấn đề

Nếu bạn không thể đăng nhập vào admin panel, có thể do:
1. Admin user chưa được tạo trong database
2. Email/password không khớp
3. File `.env` chưa có ADMIN_EMAIL và ADMIN_PASSWORD

## Cách 1: Tạo Admin bằng Script (KHUYẾN NGHỊ)

### Bước 1: Kiểm tra file `.env`

Đảm bảo file `server/.env` có các biến sau:

```env
ADMIN_EMAIL=admin@speedreading.com
ADMIN_PASSWORD=admin123
```

### Bước 2: Chạy script tạo admin

```bash
cd server
node utils/seedAdmin.js
```

**Kết quả mong đợi:**
- Nếu admin chưa tồn tại: `✅ Đã tạo admin thành công!`
- Nếu admin đã tồn tại: `✅ Admin đã tồn tại: admin@speedreading.com`

### Bước 3: Đăng nhập

1. Mở trình duyệt và truy cập trang admin login (URL tùy thuộc vào cấu hình deployment của bạn)
2. Nhập:
   - **Email**: `admin@speedreading.com` (hoặc email trong `.env`)
   - **Password**: `admin123` (hoặc password trong `.env`)

---

## Cách 2: Tạo Admin bằng API

Nếu script không hoạt động, bạn có thể tạo admin qua API:

### Bước 1: Đảm bảo backend đang chạy

```bash
cd server
npm run dev
```

### Bước 2: Gọi API tạo admin

**Sử dụng curl (Terminal/PowerShell):**
```bash
# Thay thế {API_BASE_URL} bằng URL thực tế của backend API
curl -X POST ${API_BASE_URL}/api/admin/init \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Admin\",\"email\":\"admin@speedreading.com\",\"password\":\"admin123\"}"
```

**Hoặc sử dụng Postman:**
- Method: `POST`
- URL: `{API_BASE_URL}/api/admin/init` (Thay {API_BASE_URL} bằng URL thực tế)
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "Admin",
  "email": "admin@speedreading.com",
  "password": "admin123"
}
```

### Bước 3: Đăng nhập với thông tin vừa tạo

---

## Cách 3: Tạo Admin bằng MongoDB Atlas (Nếu có quyền truy cập)

1. Vào MongoDB Atlas Dashboard
2. Chọn database `speedreading_admin`
3. Vào collection `users`
4. Click "Insert Document"
5. Nhập document sau (password đã được hash: `$2a$10$...` - cần hash mật khẩu trước)

**⚠️ Không khuyến nghị** vì cần hash password phức tạp.

---

## Kiểm Tra Admin Đã Tồn Tại Chưa

### Cách 1: Chạy script seedAdmin
```bash
cd server
node utils/seedAdmin.js
```

Script sẽ báo nếu admin đã tồn tại.

### Cách 2: Kiểm tra qua API

```bash
# Thay thế {API_BASE_URL} bằng URL thực tế của backend API
curl ${API_BASE_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@speedreading.com\",\"password\":\"admin123\"}"
```

Nếu đăng nhập thành công, admin đã tồn tại.

---

## Troubleshooting

### Lỗi: "Email hoặc mật khẩu không đúng"

**Nguyên nhân có thể:**
1. Admin chưa được tạo
2. Email/password không khớp
3. Password đã bị hash khác với password bạn nhập

**Giải pháp:**
1. Chạy lại `node utils/seedAdmin.js` để tạo admin mới
2. Kiểm tra email/password trong `.env` và form đăng nhập có giống nhau không

### Lỗi: "Bạn không có quyền truy cập admin"

**Nguyên nhân:**
- User đã đăng nhập nhưng `role` không phải `admin`

**Giải pháp:**
1. Kiểm tra user trong database có `role: "admin"` không
2. Nếu không, cập nhật user thành admin qua MongoDB Atlas hoặc tạo admin mới

### Lỗi: "Admin đã tồn tại" nhưng vẫn không đăng nhập được

**Giải pháp:**
1. Xóa admin cũ trong MongoDB Atlas
2. Chạy lại `node utils/seedAdmin.js` để tạo admin mới với password mới
3. Hoặc reset password admin cũ (phức tạp hơn)

---

## Thông Tin Đăng Nhập Mặc Định

Sau khi chạy `seedAdmin.js` với file `.env` mặc định:

- **Email**: `admin@speedreading.com`
- **Password**: `admin123`
- **URL**: Trang admin login (URL tùy thuộc vào cấu hình deployment)

**⚠️ QUAN TRỌNG**: Sau khi đăng nhập thành công, nên đổi mật khẩu ngay!

---

## Cập Nhật Password Admin

### Cách 1: Tạo admin mới với password mới

1. Xóa admin cũ trong database
2. Cập nhật `ADMIN_PASSWORD` trong `.env`
3. Chạy lại `node utils/seedAdmin.js`

### Cách 2: Cập nhật qua Admin Panel

1. Đăng nhập admin
2. Vào "Users" section
3. Tìm admin user và cập nhật password (cần thêm tính năng này)

---

## Test Nhanh

1. **Kiểm tra backend:**
   ```bash
   # Kiểm tra health check endpoint
   curl ${API_BASE_URL}/api/health
   ```
   Kết quả: `{"status":"OK","message":"Speed Reading API is running"}`

2. **Tạo admin:**
   ```bash
   cd server
   node utils/seedAdmin.js
   ```

3. **Đăng nhập:**
   - Mở trình duyệt và truy cập trang admin login
   - Nhập email/password từ `.env`

---

Nếu vẫn gặp vấn đề, kiểm tra:
- ✅ Backend đang chạy (kiểm tra thông qua health check endpoint)
- ✅ File `server/.env` có `ADMIN_EMAIL` và `ADMIN_PASSWORD`
- ✅ Database connection thành công
- ✅ Đã chạy `node utils/seedAdmin.js`

