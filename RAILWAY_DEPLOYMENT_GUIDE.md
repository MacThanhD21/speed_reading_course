# 🚂 Hướng Dẫn Deploy Backend Lên Railway (Chi Tiết Từng Bước)

## 📋 Tổng Quan

Railway là platform miễn phí để deploy Node.js applications. Guide này sẽ hướng dẫn deploy backend của bạn lên Railway.

## ✅ Yêu Cầu Trước Khi Bắt Đầu

1. ✅ Code đã push lên GitHub repository
2. ✅ Có MongoDB Atlas connection string
3. ✅ Có JWT_SECRET (hoặc generate mới)
4. ✅ Có Gemini API keys
5. ✅ Biết URL frontend trên Vercel (ví dụ: `https://your-app.vercel.app`)

---

## 🚀 BƯỚC 1: Tạo Tài Khoản Railway

### 1.1. Truy cập Railway
- Vào website: **https://railway.app**
- Click **"Start a New Project"** hoặc **"Login"**

### 1.2. Đăng ký/Đăng nhập
- **Option 1**: Sign up với GitHub (khuyến nghị)
  - Click **"Login with GitHub"**
  - Authorize Railway app
- **Option 2**: Sign up với email
  - Nhập email → Verify → Set password

---

## 📦 BƯỚC 2: Tạo Project Mới

### 2.1. Tạo Project
1. Trong Railway Dashboard, click **"+ New Project"**
2. Chọn **"Deploy from GitHub repo"**
3. Nếu lần đầu, Railway sẽ hỏi connect GitHub:
   - Click **"Configure GitHub App"**
   - Chọn repository bạn muốn deploy (có thể chọn tất cả hoặc chỉ repo cụ thể)
   - Click **"Install"**

### 2.2. Chọn Repository
1. Sau khi connect GitHub, Railway sẽ hiện danh sách repos
2. Tìm và click vào repo của bạn (ví dụ: `speed-reading-course`)
3. Railway sẽ tự động detect và bắt đầu deploy

### 2.3. Chờ Railway Deploy
- Railway sẽ tự động:
  - Detect Node.js project
  - Install dependencies
  - Start server
- ⏳ Chờ 2-3 phút để deploy xong

---

## ⚙️ BƯỚC 3: Cấu Hình Service

### 3.1. Đổi Root Directory
Railway mặc định sẽ deploy từ root, nhưng backend của chúng ta ở folder `server/`:

1. Click vào **Service** vừa tạo
2. Vào tab **"Settings"**
3. Scroll xuống phần **"Source"**
4. Tìm **"Root Directory"** → Nhập: `server`
5. Click **"Deploy"** để redeploy với cấu hình mới

### 3.2. Kiểm Tra Build Settings
Trong Settings, kiểm tra:
- **Build Command**: `npm install` (Railway tự detect)
- **Start Command**: `npm start` (Railway tự detect từ `package.json`)
- **Output Directory**: Để trống (không cần cho Node.js)

---

## 🔐 BƯỚC 4: Cấu Hình Environment Variables

### 4.1. Mở Variables Tab
1. Trong Service Settings, click tab **"Variables"**
2. Hoặc click **"Variables"** ở sidebar

### 4.2. Thêm Environment Variables

Click **"+ New Variable"** và thêm từng biến sau:

#### Biến 1: NODE_ENV
```
Name: NODE_ENV
Value: production
```

#### Biến 2: PORT
```
Name: PORT
Value: 5000
```
⚠️ **Lưu ý**: Railway tự set PORT, nhưng set 5000 để backup

#### Biến 3: HOST
```
Name: HOST
Value: 0.0.0.0
```

#### Biến 4: MONGODB_URI
```
Name: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/speedreading_admin?retryWrites=true&w=majority
```
⚠️ **Lưu ý**: 
- Thay `username`, `password`, `cluster` bằng thông tin thực của bạn
- Đảm bảo có `/speedreading_admin` ở cuối
- Nếu chưa có database name, Railway sẽ tạo mới

#### Biến 5: JWT_SECRET
Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Sau đó add:
```
Name: JWT_SECRET
Value: (paste kết quả từ command trên)
```

#### Biến 6: BASE_URL (OPTIONAL - Không bắt buộc)
⚠️ **Biến này KHÔNG BẮT BUỘC** - chỉ dùng để logging thông tin server URL.

Nếu muốn set (để có logs đẹp hơn):

1. Vào tab **"Settings"** → **"Domains"**
2. Railway sẽ tự tạo domain như: `https://your-service-name.up.railway.app`
3. Hoặc click **"Generate Domain"** để có custom domain
4. Copy domain đó, sau đó add:
```
Name: BASE_URL
Value: https://your-service-name.up.railway.app
```
(Không có `/api` ở cuối)

**Lưu ý**: Nếu không set biến này, server vẫn chạy bình thường, chỉ là không log ra URL server mà thôi.

#### Biến 7: CORS_ORIGIN (QUAN TRỌNG - BẮT BUỘC!)
⚠️ **BẮT BUỘC phải set biến này** nếu không frontend sẽ không thể gọi API được!

1. Lấy URL frontend từ Vercel:
   - Vào Vercel Dashboard → Chọn project → Tab **"Deployments"**
   - Copy URL deployment (ví dụ: `https://speed-reading-course.vercel.app`)

2. Add vào Railway:
```
Name: CORS_ORIGIN
Value: https://speed-reading-course.vercel.app
```
⚠️ **QUAN TRỌNG**: 
- Phải có `https://` ở đầu
- Không có `/` ở cuối
- Thay URL trên bằng URL thực của frontend trên Vercel của bạn

**Nếu có nhiều domain** (ví dụ: production + preview):
```
Value: https://speed-reading-course.vercel.app,https://speed-reading-course-git-main-yourname.vercel.app
```
(Phân tách bằng dấu phẩy, KHÔNG có dấu cách giữa các URL)

**Nếu muốn cho phép tất cả preview deployments của Vercel:**
```
Value: https://speed-reading-course.vercel.app,*.vercel.app
```
(Tuy nhiên cách này ít bảo mật hơn)

#### Biến 8: GEMINI_API_KEYS
```
Name: GEMINI_API_KEYS
Value: key1,key2,key3,key4,key5
```
(Phân tách bằng dấu phẩy, không có dấu cách)

---

## 🔄 BƯỚC 5: Redeploy Sau Khi Set Variables

### 5.1. Trigger Redeploy
1. Sau khi set xong tất cả variables, Railway sẽ tự động redeploy
2. Hoặc vào tab **"Deployments"** → Click **"..."** trên deployment mới nhất → **"Redeploy"**

### 5.2. Kiểm Tra Logs
1. Vào tab **"Deployments"**
2. Click vào deployment mới nhất
3. Xem **"Build Logs"** và **"Deploy Logs"**

**Logs thành công sẽ có:**
```
✅ MongoDB Connected to: ...
📊 Database Name: speedreading_admin
🚀 Server running on port 5000
```

**Nếu có lỗi:**
- ❌ `Missing required environment variables` → Kiểm tra lại variables
- ❌ `MongoDB connection error` → Kiểm tra MONGODB_URI
- ❌ `Port already in use` → Railway tự xử lý, không cần lo

---

## 🌐 BƯỚC 6: Lấy Backend URL

### 6.1. Lấy Domain
1. Vào **Settings** → **"Domains"**
2. Railway tự tạo domain như: `https://xxx-production.up.railway.app`
3. Copy domain này (ví dụ: `https://speed-reading-backend-production.up.railway.app`)

### 6.2. Test Backend

**Test Root Endpoint:**
Mở browser và truy cập:
```
https://your-backend.up.railway.app/
```

**Response mong đợi:**
```json
{
  "success": true,
  "message": "Speed Reading API Server",
  "version": "1.0.0",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "contacts": "/api/contacts",
    "admin": "/api/admin",
    "smartread": "/api/smartread"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "production"
}
```

**Test Health Check:**
Mở terminal hoặc browser, test:
```bash
curl https://your-backend.up.railway.app/api/health
```

Hoặc mở browser và truy cập:
```
https://your-backend.up.railway.app/api/health
```

**Response mong đợi:**
```json
{
  "status": "OK",
  "message": "Speed Reading API is running",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "production"
}
```

✅ **Nếu thấy response này → Backend đã chạy thành công!**

---

## 🎨 BƯỚC 7: Cấu Hình Frontend Trên Vercel

### 7.1. Vào Vercel Dashboard
1. Vào https://vercel.com
2. Chọn project của bạn

### 7.2. Add Environment Variable
1. Vào **Settings** → **Environment Variables**
2. Click **"+ Add New"**
3. Thêm:
   ```
   Name: VITE_API_URL
   Value: https://your-backend.up.railway.app/api
   Environments: ✅ Production, ✅ Preview, ✅ Development
   ```
   ⚠️ **QUAN TRỌNG**: 
   - URL phải có `/api` ở cuối
   - Dùng HTTPS
   - Không có trailing slash

4. Click **"Save"**

### 7.3. Redeploy Frontend
1. Vào tab **"Deployments"**
2. Chọn deployment mới nhất
3. Click **"..."** → **"Redeploy"**
4. Chọn **"Use existing Build Cache"** (optional) → **"Redeploy"**

⏳ Chờ 2-3 phút để deploy xong

---

## ✅ BƯỚC 8: Kiểm Tra Kết Nối

### 8.1. Test Frontend
1. Mở frontend URL trên Vercel
2. Mở **Browser DevTools** (F12)
3. Vào tab **Network**
4. Thử đăng ký hoặc đăng nhập
5. Kiểm tra API requests:
   - ✅ Phải đi đến: `https://your-backend.up.railway.app/api/...`
   - ✅ Status code: 200 hoặc 201 (không phải 404)
   - ✅ Response là JSON (không phải HTML)

### 8.2. Test Backend Directly
```bash
# Test register
curl -X POST https://your-backend.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Test health
curl https://your-backend.up.railway.app/api/health
```

---

## 🐛 Troubleshooting

### Lỗi: "Missing required environment variables"
**Nguyên nhân**: Thiếu biến môi trường  
**Giải pháp**: 
- Kiểm tra lại tất cả variables trong Railway
- Đảm bảo không có typo
- Redeploy sau khi thêm variables

### Lỗi: "MongoDB connection error"
**Nguyên nhân**: 
- MONGODB_URI sai
- MongoDB Atlas chưa whitelist IP
- Password có ký tự đặc biệt chưa encode

**Giải pháp**:
1. Kiểm tra MONGODB_URI format
2. Vào MongoDB Atlas → Network Access → Add IP: `0.0.0.0/0` (cho phép tất cả)
3. Encode password nếu có ký tự đặc biệt:
   ```javascript
   // Ví dụ: password là "abc@123"
   // Trong MONGODB_URI phải là: abc%40123
   encodeURIComponent('abc@123') // → abc%40123
   ```

### Lỗi: "CORS error" trên frontend
**Nguyên nhân**: Backend không cho phép frontend domain  
**Giải pháp**:
1. **Kiểm tra `CORS_ORIGIN` trên Railway:**
   - Vào Railway Dashboard → **Settings** → **Variables**
   - Tìm biến `CORS_ORIGIN`
   - Đảm bảo giá trị là URL frontend trên Vercel (ví dụ: `https://speed-reading-course.vercel.app`)

2. **Nếu chưa có hoặc sai, thêm/sửa ngay:**
   - Click **"+ New Variable"** hoặc edit biến hiện có
   - Name: `CORS_ORIGIN`
   - Value: URL frontend (phải có `https://`, không có `/` ở cuối)
   - Railway sẽ tự động redeploy sau khi save

3. **Nếu có nhiều domain** (production + preview):
   - Phân tách bằng dấu phẩy: `https://domain1.vercel.app,https://domain2.vercel.app`
   - KHÔNG có dấu cách giữa các URL

4. **Sau khi redeploy:**
   - Đợi 1-2 phút để Railway redeploy xong
   - Refresh frontend và test lại
   - Mở DevTools → Console, không còn lỗi CORS

⚠️ **Lưu ý**: Biến `CORS_ORIGIN` là BẮT BUỘC trong production, nếu không set sẽ block tất cả requests từ frontend!

### Lỗi: "Cannot GET /api/..."
**Nguyên nhân**: Backend chưa start hoặc route không tồn tại  
**Giải pháp**:
1. Xem logs trên Railway
2. Kiểm tra `Root Directory` đã set `server` chưa
3. Kiểm tra `Start Command` là `npm start`

### Backend bị sleep (free tier)
**Nguyên nhân**: Railway free tier sleep sau 30 phút không dùng  
**Giải pháp**:
- Request đầu tiên sau khi sleep sẽ mất 10-30 giây để wake up
- Đây là bình thường với free tier
- Có thể upgrade để có always-on

---

## 📊 Monitoring & Logs

### Xem Logs Trên Railway
1. Vào Service → Tab **"Deployments"**
2. Click vào deployment
3. Xem **"Build Logs"** và **"Deploy Logs"**

### Metrics
Railway cung cấp:
- CPU usage
- Memory usage
- Network traffic
- Request logs

Xem trong tab **"Metrics"**

---

## 🔄 Auto-Deploy

Railway tự động deploy khi:
- ✅ Push code mới lên GitHub
- ✅ Merge pull request vào main branch

Để tắt auto-deploy:
1. Settings → **"Source"**
2. Tắt **"Auto Deploy"**

---

## 🎯 Quick Checklist

Trước khi test:
- [ ] Railway service đã deploy thành công
- [ ] Tất cả environment variables đã được set
- [ ] Backend URL đã lấy được từ Railway
- [ ] Test `/api/health` trả về JSON
- [ ] `VITE_API_URL` đã set trên Vercel
- [ ] Frontend đã redeploy
- [ ] CORS_ORIGIN đã set đúng frontend URL

---

## 📝 Tóm Tắt URLs Sau Khi Deploy

Sau khi hoàn thành, bạn sẽ có:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.up.railway.app`
- **MongoDB**: MongoDB Atlas (cloud)

---

## 💡 Tips

1. **Always-on**: Railway free tier có thể sleep. Request đầu tiên sẽ mất thời gian wake up
2. **Custom Domain**: Có thể set custom domain trong Railway Settings → Domains
3. **Environment**: Có thể tạo nhiều environments (production, staging) bằng cách tạo nhiều services
4. **Variables**: Có thể set variables cho từng environment riêng
5. **Logs**: Railway lưu logs 30 ngày (free tier)

---

## 🆘 Cần Trợ Giúp?

Nếu gặp lỗi:
1. Xem logs trên Railway
2. Kiểm tra environment variables
3. Test backend trực tiếp với curl
4. Kiểm tra CORS configuration

