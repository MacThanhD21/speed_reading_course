# 🚀 Hướng Dẫn Setup Google OAuth cho Production

## 📋 Checklist Deployment

### Bước 1: Cập Nhật Google Cloud Console

1. **Vào Google Cloud Console**
   - https://console.cloud.google.com/
   - Chọn project của bạn
   - **APIs & Services** → **Credentials**

2. **Mở OAuth 2.0 Client ID**
   - Click vào Client ID bạn đã tạo

3. **Thêm Production URLs vào Authorized JavaScript origins**
   ```
   https://your-frontend.vercel.app
   https://your-domain.com (nếu có custom domain)
   ```
   ⚠️ **Lưu ý**: 
   - Phải có `https://` ở đầu
   - Không có `/` ở cuối
   - Không có path (ví dụ: không có `/login`)

4. **Thêm Production URLs vào Authorized redirect URIs**
   ```
   https://your-frontend.vercel.app
   https://your-domain.com (nếu có custom domain)
   ```
   ⚠️ **Lưu ý**: Giống như JavaScript origins

5. **Click SAVE** ⚠️ **QUAN TRỌNG**: Phải click SAVE để lưu thay đổi!

6. **Giữ lại Development URLs** (nếu muốn test localhost):
   ```
   http://localhost:3000
   http://localhost:5173
   ```

---

## 🔧 Bước 2: Cấu Hình Frontend (Vercel)

1. **Vào Vercel Dashboard**
   - https://vercel.com/dashboard
   - Chọn project của bạn

2. **Settings → Environment Variables**

3. **Thêm/Cập nhật biến sau:**
   ```
   Name: VITE_GOOGLE_CLIENT_ID
   Value: 597980135679-s5va9pr3ragv8vjrnv853smk8sv1nk1c.apps.googleusercontent.com
   Environments: ✅ Production, ✅ Preview, ✅ Development
   ```
   ⚠️ **Lưu ý**: 
   - Thay bằng Client ID thực của bạn
   - Giống hệt với Client ID trong Google Console

4. **Thêm biến VITE_API_URL** (nếu chưa có):
   ```
   Name: VITE_API_URL
   Value: https://your-backend.railway.app/api
   Environments: ✅ Production, ✅ Preview, ✅ Development
   ```
   ⚠️ **Lưu ý**: 
   - URL backend từ Railway (hoặc hosting khác)
   - Phải có `/api` ở cuối
   - Dùng HTTPS

5. **Click Save**

6. **Redeploy Frontend**
   - Tab **Deployments** → Click **"..."** trên deployment mới nhất → **Redeploy**

---

## 🔧 Bước 3: Cấu Hình Backend (Railway)

1. **Vào Railway Dashboard**
   - https://railway.app/dashboard
   - Chọn service backend của bạn

2. **Variables Tab**

3. **Thêm/Cập nhật biến sau:**
   ```
   Name: GOOGLE_CLIENT_ID
   Value: 597980135679-s5va9pr3ragv8vjrnv853smk8sv1nk1c.apps.googleusercontent.com
   ```
   ⚠️ **Lưu ý**: 
   - Giống hệt với `VITE_GOOGLE_CLIENT_ID` trên Vercel
   - Giống hệt với Client ID trong Google Console

4. **Kiểm tra các biến khác:**
   - `CORS_ORIGIN`: Phải có URL frontend production (ví dụ: `https://your-frontend.vercel.app`)
   - `MONGODB_URI`: Connection string MongoDB Atlas
   - `JWT_SECRET`: Secret key cho JWT
   - `NODE_ENV`: `production`

5. **Railway sẽ tự động redeploy** sau khi thêm variables

---

## ✅ Bước 4: Kiểm Tra

### 4.1. Test Frontend

1. Mở production URL: `https://your-frontend.vercel.app`
2. Vào trang Login/Register
3. Kiểm tra nút Google Sign-In có hiển thị không
4. Click nút Google Sign-In
5. Kiểm tra:
   - ✅ Không có lỗi "The given origin is not allowed" trong console
   - ✅ Google popup hiển thị
   - ✅ Có thể chọn Google account
   - ✅ Đăng nhập thành công

### 4.2. Test Backend

1. Mở Browser DevTools (F12) → Network tab
2. Thử đăng nhập với Google
3. Kiểm tra request `/api/auth/google`:
   - ✅ Status: 200 hoặc 201 (không phải 401)
   - ✅ Response có `token` và `user` data
   - ✅ Không có lỗi CORS

### 4.3. Test Backend Logs

1. Vào Railway Dashboard → Service → Deployments
2. Xem logs mới nhất
3. Kiểm tra:
   - ✅ Không có lỗi "Google token không hợp lệ"
   - ✅ Không có lỗi "GOOGLE_CLIENT_ID chưa được cấu hình"

---

## 🐛 Troubleshooting

### Lỗi: "The given origin is not allowed"

**Nguyên nhân**: Production URL chưa được thêm vào Google Console

**Giải pháp**:
1. Vào Google Cloud Console → OAuth 2.0 Client ID
2. Kiểm tra **Authorized JavaScript origins** có production URL chưa
3. Nếu chưa có, thêm vào và **click SAVE**
4. Đợi 1-2 phút để Google cập nhật
5. Refresh trang và thử lại

### Lỗi: "Google token không hợp lệ" (401)

**Nguyên nhân**: 
- `GOOGLE_CLIENT_ID` trên backend không khớp với frontend
- Client ID không đúng

**Giải pháp**:
1. Kiểm tra `GOOGLE_CLIENT_ID` trên Railway:
   - Phải giống hệt với `VITE_GOOGLE_CLIENT_ID` trên Vercel
   - Phải giống hệt với Client ID trong Google Console
2. Nếu sai, sửa lại và redeploy
3. Kiểm tra backend logs để xem error chi tiết

### Lỗi: CORS error

**Nguyên nhân**: Backend chưa cho phép frontend domain

**Giải pháp**:
1. Vào Railway → Variables
2. Kiểm tra `CORS_ORIGIN`:
   - Phải có production URL frontend (ví dụ: `https://your-frontend.vercel.app`)
   - Không có `/` ở cuối
   - Dùng HTTPS
3. Nếu chưa có hoặc sai, thêm/sửa và redeploy

### Nút Google không hiển thị

**Nguyên nhân**: `VITE_GOOGLE_CLIENT_ID` chưa được set trên Vercel

**Giải pháp**:
1. Vào Vercel Dashboard → Settings → Environment Variables
2. Kiểm tra có `VITE_GOOGLE_CLIENT_ID` chưa
3. Nếu chưa có, thêm vào và redeploy frontend

---

## 📝 Tóm Tắt URLs Sau Khi Deploy

Sau khi hoàn thành, bạn sẽ có:

- **Frontend**: `https://your-frontend.vercel.app`
- **Backend**: `https://your-backend.railway.app`
- **Google OAuth**: Đã cấu hình với production URLs

---

## ✅ Production Checklist

Trước khi launch:

- [ ] Google Console: Đã thêm production URLs vào Authorized JavaScript origins
- [ ] Google Console: Đã thêm production URLs vào Authorized redirect URIs
- [ ] Google Console: Đã click SAVE
- [ ] Vercel: Đã set `VITE_GOOGLE_CLIENT_ID`
- [ ] Vercel: Đã set `VITE_API_URL`
- [ ] Vercel: Đã redeploy frontend
- [ ] Railway: Đã set `GOOGLE_CLIENT_ID`
- [ ] Railway: Đã set `CORS_ORIGIN` với production frontend URL
- [ ] Railway: Backend đã deploy thành công
- [ ] Test: Đã test đăng nhập Google trên production
- [ ] Test: Không có lỗi trong console
- [ ] Test: Không có lỗi trong backend logs

---

## 🎯 Quick Reference

### Environment Variables

**Frontend (Vercel):**
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_API_URL=https://your-backend.railway.app/api
```

**Backend (Railway):**
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
CORS_ORIGIN=https://your-frontend.vercel.app
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
NODE_ENV=production
```

### Google Console URLs

**Authorized JavaScript origins:**
```
https://your-frontend.vercel.app
http://localhost:3000 (development)
```

**Authorized redirect URIs:**
```
https://your-frontend.vercel.app
http://localhost:3000 (development)
```

---

**Chúc bạn deploy thành công! 🎉**

