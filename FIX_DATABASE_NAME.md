# 🔧 Sửa Lỗi Database Name - Kết Nối Vào Collection "test" Thay Vì "speedreading_admin"

## Vấn đề

Nếu dữ liệu đang được lưu vào database `test` thay vì `speedreading_admin`, có nghĩa là connection string MongoDB của bạn chưa chỉ định đúng database name.

## Giải pháp

### Cách 1: Sửa Connection String trong file `.env` (KHUYẾN NGHỊ)

1. Mở file `server/.env` (hoặc tạo nếu chưa có)

2. Kiểm tra connection string hiện tại:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/???
   ```

3. Đảm bảo connection string có database name `speedreading_admin`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speedreading_admin?retryWrites=true&w=majority
   ```

   **Lưu ý**: Database name nằm sau dấu `/` và trước dấu `?` hoặc cuối string.

4. Restart server:
   ```bash
   cd server
   npm run dev
   ```

### Cách 2: Kiểm tra Connection String Hiện Tại

Connection string MongoDB có format:
```
mongodb+srv://[username]:[password]@[cluster]/[DATABASE_NAME]?[options]
```

**Ví dụ đúng:**
```
mongodb+srv://speedreading_admin:password123@cluster0.xxxxx.mongodb.net/speedreading_admin?retryWrites=true&w=majority
                                                                      ^^^^^^^^^^^^^^^^^^^^
                                                                      Đây là database name
```

**Ví dụ SAI (sẽ kết nối vào "test"):**
```
mongodb+srv://speedreading_admin:password123@cluster0.xxxxx.mongodb.net/test?retryWrites=true&w=majority
                                                                      ^^^^
                                                                      Sai - đang dùng "test"
```

**Ví dụ SAI (không có database name - sẽ tự động dùng "test"):**
```
mongodb+srv://speedreading_admin:password123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
                                                                      ^
                                                                      Thiếu database name
```

### Cách 3: Thêm DB_NAME vào .env (Nếu không muốn sửa connection string)

Nếu bạn không thể sửa connection string, có thể thêm biến môi trường:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=speedreading_admin
```

Code sẽ tự động thêm database name vào connection string.

## Kiểm Tra Sau Khi Sửa

1. Restart server
2. Kiểm tra console log khi server khởi động:
   ```
   ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
   📊 Database: speedreading_admin
   ```
3. Nếu vẫn thấy "Database: test", kiểm tra lại connection string
4. Kiểm tra trong MongoDB Atlas:
   - Vào MongoDB Atlas Dashboard
   - Click "Collections"
   - Đảm bảo bạn đang xem database `speedreading_admin`, không phải `test`

## Xóa Dữ Liệu Cũ Trong Database "test" (Tùy chọn)

Nếu bạn đã có dữ liệu trong database `test` và muốn xóa:

1. Vào MongoDB Atlas Dashboard
2. Chọn database `test`
3. Xóa collections không cần thiết (hoặc xóa toàn bộ database nếu muốn)

**⚠️ CẢNH BÁO**: Chỉ xóa nếu bạn chắc chắn không cần dữ liệu cũ!

## Ví Dụ Connection String Đúng

```env
# Format đầy đủ
MONGODB_URI=mongodb+srv://speedreading_admin:yourpassword@cluster0.xxxxx.mongodb.net/speedreading_admin?retryWrites=true&w=majority

# Hoặc ngắn gọn (code sẽ tự thêm options)
MONGODB_URI=mongodb+srv://speedreading_admin:yourpassword@cluster0.xxxxx.mongodb.net/speedreading_admin
```

## Troubleshooting

### Vẫn thấy "Database: test" sau khi sửa?

1. **Kiểm tra file .env đúng chưa:**
   - Đảm bảo file nằm trong thư mục `server/`
   - Đảm bảo không có khoảng trắng thừa trong connection string

2. **Kiểm tra biến môi trường:**
   ```bash
   cd server
   node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"
   ```

3. **Xóa cache và restart:**
   - Dừng server (Ctrl+C)
   - Xóa `node_modules/.cache` nếu có
   - Chạy lại `npm run dev`

4. **Kiểm tra MongoDB Atlas:**
   - Đảm bảo database `speedreading_admin` đã tồn tại hoặc sẽ được tạo tự động
   - Kiểm tra network access đã cho phép IP của bạn chưa

## Liên hệ

Nếu vẫn gặp vấn đề, kiểm tra:
1. Connection string trong `server/.env`
2. Console log khi server khởi động
3. Database name trong MongoDB Atlas Dashboard

