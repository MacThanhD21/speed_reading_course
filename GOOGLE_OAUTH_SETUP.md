# 🔐 Hướng Dẫn Setup Google OAuth Login

## 📋 Tổng quan

Tính năng đăng nhập với Google đã được tích hợp vào hệ thống. Người dùng có thể đăng nhập/đăng ký bằng tài khoản Google của họ.

## 🚀 Bước 1: Tạo Google OAuth Credentials

### 1.1. Truy cập Google Cloud Console

1. Vào https://console.cloud.google.com/
2. Chọn hoặc tạo một project mới
3. Điều hướng đến **APIs & Services** > **Credentials**

### 1.2. Tạo OAuth 2.0 Client ID

1. Click **Create Credentials** > **OAuth client ID**
2. Nếu chưa có OAuth consent screen, bạn sẽ được yêu cầu cấu hình:
   - **User Type**: External (cho public app)
   - **App name**: Tên ứng dụng của bạn (ví dụ: "Speed Reading Course")
   - **User support email**: Email hỗ trợ
   - **Developer contact information**: Email của bạn
   - **Scopes**: Chọn `email`, `profile`, `openid`
   - **Test users**: Thêm email test (nếu ở chế độ testing)

3. Sau khi có OAuth consent screen, tạo OAuth client ID:
   - **Application type**: Web application
   - **Name**: Tên cho client ID (ví dụ: "Speed Reading Web Client")
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     http://localhost:5173
     https://yourdomain.com
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000
     http://localhost:5173
     https://yourdomain.com
     ```

4. Click **Create**
5. Copy **Client ID** (sẽ cần dùng ở bước sau)

## 🔧 Bước 2: Cấu hình Environment Variables

### 2.1. Frontend (.env hoặc .env.local)

**File: `.env`** (trong thư mục root của frontend)

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Ví dụ:**
```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### 2.2. Backend (.env)

**File: `server/.env`**

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Ví dụ:**
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

> **Lưu ý**: Client ID phải giống nhau ở frontend và backend!

## 📦 Bước 3: Cài đặt Dependencies

### 3.1. Frontend

```bash
cd website_speed_reading
npm install
```

Package đã được thêm vào `package.json`:
- `@react-oauth/google`: ^0.12.1

### 3.2. Backend

```bash
cd website_speed_reading/server
npm install
```

Package đã được thêm vào `server/package.json`:
- `google-auth-library`: ^9.4.1

## ✅ Bước 4: Kiểm tra

### 4.1. Restart Servers

**Frontend:**
```bash
npm run dev
```

**Backend:**
```bash
cd server
npm run dev
```

### 4.2. Test Google Login

1. Mở trình duyệt và vào trang đăng nhập: `http://localhost:3000/login`
2. Click nút **"Continue with Google"**
3. Chọn tài khoản Google và xác nhận
4. Kiểm tra xem đã đăng nhập thành công chưa

## 🔍 Troubleshooting

### Lỗi: "VITE_GOOGLE_CLIENT_ID chưa được cấu hình"

**Nguyên nhân**: Environment variable chưa được set

**Giải pháp**: 
- Kiểm tra file `.env` có đúng format không
- Restart dev server sau khi thêm `.env`
- Đảm bảo tên biến là `VITE_GOOGLE_CLIENT_ID` (có prefix `VITE_`)

### Lỗi: "Google token không hợp lệ"

**Nguyên nhân**: 
- Client ID không khớp giữa frontend và backend
- Token đã hết hạn
- Client ID không đúng

**Giải pháp**:
- Kiểm tra `GOOGLE_CLIENT_ID` trong `server/.env` có khớp với `VITE_GOOGLE_CLIENT_ID` không
- Restart backend server
- Tạo lại OAuth client ID nếu cần

### Lỗi: "redirect_uri_mismatch"

**Nguyên nhân**: Domain trong Google Console không khớp

**Giải pháp**:
- Vào Google Cloud Console
- Thêm domain hiện tại vào **Authorized JavaScript origins**
- Thêm URL hiện tại vào **Authorized redirect URIs**

### Google Sign-In button không hiển thị

**Nguyên nhân**: 
- Script Google Identity Services chưa load
- Client ID không hợp lệ

**Giải pháp**:
- Mở browser console để xem lỗi
- Kiểm tra network tab xem script có load không
- Kiểm tra `VITE_GOOGLE_CLIENT_ID` có đúng không

## 📝 Cấu trúc Code

### Frontend

1. **main.jsx**: Wrap app với `GoogleOAuthProvider`
2. **Login.jsx**: Google Sign-In button và callback
3. **Register.jsx**: Google Sign-In button và callback
4. **AuthContext.jsx**: Method `googleLogin()` để xử lý login
5. **apiService.js**: Method `googleLogin()` để gọi API

### Backend

1. **authController.js**: Endpoint `googleLogin()` để verify token và tạo/login user
2. **authRoutes.js**: Route `/api/auth/google`
3. **User.js**: Model đã được update với `googleId` và `provider`

## 🔐 Security Notes

1. **Không commit `.env` files**: Đảm bảo `.env` đã có trong `.gitignore`
2. **Production**: Sử dụng environment variables của hosting platform (Vercel, Railway, etc.)
3. **HTTPS**: Trong production, chỉ sử dụng HTTPS
4. **Token Verification**: Backend luôn verify Google token trước khi tạo/login user

## 🎯 Production Deployment

### Vercel (Frontend)

1. Vào Vercel Dashboard > Project > Settings > Environment Variables
2. Thêm:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id
   ```
3. Redeploy

### Railway/Backend Server

1. Vào Railway Dashboard > Project > Variables
2. Thêm:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   ```
3. Restart service

### Cập nhật Google Console

Thêm production URLs vào:
- **Authorized JavaScript origins**: `https://yourdomain.com`
- **Authorized redirect URIs**: `https://yourdomain.com`

## 📚 Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google](https://www.npmjs.com/package/@react-oauth/google)

## ✅ Checklist

- [ ] Đã tạo Google OAuth Client ID
- [ ] Đã cấu hình OAuth consent screen
- [ ] Đã thêm `VITE_GOOGLE_CLIENT_ID` vào frontend `.env`
- [ ] Đã thêm `GOOGLE_CLIENT_ID` vào backend `.env`
- [ ] Đã cài đặt dependencies (`npm install`)
- [ ] Đã restart servers
- [ ] Đã test Google login thành công
- [ ] Đã cấu hình production URLs (nếu deploy)

---

**Chúc bạn setup thành công! 🎉**

