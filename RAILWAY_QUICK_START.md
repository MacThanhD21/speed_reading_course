# ⚡ Railway Quick Start - Tóm Tắt Nhanh

## 🎯 5 Bước Deploy Backend Lên Railway

### Bước 1: Tạo Project
1. Vào https://railway.app → Login với GitHub
2. **New Project** → **Deploy from GitHub repo**
3. Chọn repo của bạn

### Bước 2: Cấu Hình Service
1. Click vào service vừa tạo
2. **Settings** → **Root Directory**: `server`
3. Railway sẽ tự detect Node.js

### Bước 3: Set Environment Variables
Vào **Variables** tab, add:

```env
NODE_ENV=production
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/speedreading_admin?retryWrites=true&w=majority
JWT_SECRET=<generate bằng: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
CORS_ORIGIN=https://your-frontend.vercel.app
GEMINI_API_KEYS=key1,key2,key3
```

⚠️ **BASE_URL**: Đợi Railway tạo domain trước, sau đó set:
```env
BASE_URL=https://your-service.up.railway.app
```

### Bước 4: Lấy Backend URL
1. **Settings** → **Domains**
2. Copy domain (ví dụ: `https://xxx.up.railway.app`)

### Bước 5: Test
```bash
curl https://your-backend.up.railway.app/api/health
```

✅ Phải trả về JSON → Thành công!

---

## 📝 Cấu Hình Frontend Trên Vercel

1. **Vercel Dashboard** → Project → **Settings** → **Environment Variables**
2. Add:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```
3. **Redeploy** frontend

---

## ✅ Checklist

- [ ] Railway service deployed
- [ ] Root Directory = `server`
- [ ] Environment variables set đầy đủ
- [ ] Backend URL lấy được
- [ ] `/api/health` test OK
- [ ] `VITE_API_URL` set trên Vercel
- [ ] Frontend redeployed

---

## 🐛 Lỗi Thường Gặp

**Lỗi**: `Missing required environment variables`
→ Kiểm tra lại tất cả variables

**Lỗi**: `MongoDB connection error`
→ Kiểm tra MONGODB_URI, whitelist IP trên MongoDB Atlas

**Lỗi**: CORS error
→ Kiểm tra `CORS_ORIGIN` có đúng frontend URL không

---

Xem **RAILWAY_DEPLOYMENT_GUIDE.md** để biết chi tiết từng bước!

