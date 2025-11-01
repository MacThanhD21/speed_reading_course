# 🔍 Hướng dẫn kiểm tra Collections trong MongoDB

## ⚠️ Vấn đề: API trả về success nhưng không thấy data trong Compass

Từ response JSON bạn cung cấp, data đã được lưu thành công với IDs:
- Reading Session: `690639d4f64597b455f2bb91`
- Quiz Result: `69063a42f64597b455f2bb97`

**Nhưng không thấy trong Compass!** → Có thể do:

---

## 🔑 Nguyên nhân chính

### 1. **Collection Names khác nhau**

**Mongoose tự động convert model names:**
- Model: `ReadingSession` → Collection: **`readingsessions`** (lowercase + plural, không có underscore)
- Model: `QuizResult` → Collection: **`quizresults`** (lowercase + plural, không có underscore)

**❌ KHÔNG TÌM:** `reading_sessions` hoặc `quiz_results` (có underscore)
**✅ PHẢI TÌM:** `readingsessions` hoặc `quizresults` (không có underscore)

---

## 📋 Cách kiểm tra nhanh

### Bước 1: Kiểm tra Database Name

Trong MongoDB Compass:
1. Xem **top-left corner** → Database name
2. **Phải là:** `speedreading_admin`
3. **❌ KHÔNG PHẢI:** `test` hoặc database khác

### Bước 2: Tìm Collections đúng tên

Trong Compass, tìm các collection names sau:

**Reading Sessions:**
- ✅ **`readingsessions`** ← Tên đúng (không có underscore)
- ❌ `reading_sessions` (sai - có underscore)
- ❌ `readingsession` (sai - số ít)

**Quiz Results:**
- ✅ **`quizresults` ← Tên đúng (không có underscore)**
- ❌ `quiz_results` (sai - có underscore)
- ❌ `quizresult` (sai - số ít)

### Bước 3: Chạy Script kiểm tra

```bash
cd server
npm run check:collections
```

Hoặc:
```bash
cd server
node utils/checkCollections.js
```

Script sẽ:
- ✅ Hiển thị database name đang connect
- ✅ List tất cả collections
- ✅ Đếm documents
- ✅ Hiển thị sample data

---

## 🧪 Test nhanh trong MongoDB Compass

1. **Connect** với connection string từ `.env`
2. **Check database name** (top-left) → Phải là `speedreading_admin`
3. **Tìm collections:**
   - `readingsessions` (không phải `reading_sessions`)
   - `quizresults` (không phải `quiz_results`)
4. **Click vào collection** → Xem documents
5. **Search với ID từ response:**
   - Reading Session ID: `690639d4f64597b455f2bb91`
   - Quiz Result ID: `69063a42f64597b455f2bb97`

---

## 🔧 Fix nếu vẫn không thấy

### Fix 1: Verify Database Connection String

Trong `server/.env`:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/speedreading_admin
```

**Lưu ý:** Phải có `/speedreading_admin` ở cuối!

### Fix 2: Check Backend Logs

Khi start server, phải thấy:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
📊 Database: speedreading_admin  ← Phải là speedreading_admin
```

Nếu thấy:
```
⚠️  WARNING: Đang sử dụng database "test"
```

→ Fix connection string!

### Fix 3: Refresh Compass

1. Disconnect và reconnect
2. Click refresh button (↻)
3. Clear all filters

---

## 📊 Collection Names Reference

| Model Name | Collection Name | Tìm trong Compass |
|------------|----------------|-------------------|
| `ReadingSession` | `readingsessions` | ✅ **readingsessions** |
| `QuizResult` | `quizresults` | ✅ **quizresults** |
| `User` | `users` | ✅ users |
| `Contact` | `contacts` | ✅ contacts |

---

## 🔍 Direct MongoDB Query

Nếu có MongoDB Shell hoặc Compass Query:

```javascript
// Switch to correct database
use speedreading_admin

// List all collections
show collections

// Check specific collections
db.readingsessions.find().pretty()
db.quizresults.find().pretty()

// Search by ID
db.readingsessions.findOne({_id: ObjectId("690639d4f64597b455f2bb91")})
db.quizresults.findOne({_id: ObjectId("69063a42f64597b455f2bb97")})

// Count documents
db.readingsessions.countDocuments()
db.quizresults.countDocuments()
```

---

## ✅ Checklist

- [ ] Compass đang connect đúng database (`speedreading_admin`)
- [ ] Tìm `readingsessions` (không phải `reading_sessions`)
- [ ] Tìm `quizresults` (không phải `quiz_results`)
- [ ] Đã refresh Compass
- [ ] Đã clear filters
- [ ] Backend logs show đúng database name
- [ ] Connection string có `/speedreading_admin` ở cuối

---

## 💡 Quick Test

1. **Chạy script:**
   ```bash
   cd server
   npm run check:collections
   ```

2. **Hoặc trong Compass, search theo ID:**
   - Reading Session: `690639d4f64597b455f2bb91`
   - Quiz Result: `69063a42f64597b455f2bb97`

3. **Hoặc query trực tiếp:**
   ```javascript
   db.readingsessions.findOne({_id: ObjectId("690639d4f64597b455f2bb91")})
   db.quizresults.findOne({_id: ObjectId("69063a42f64597b455f2bb97")})
   ```

---

## 🎯 Tóm tắt

**Tên Collections đúng:**
- ✅ `readingsessions` (không có underscore, lowercase, plural)
- ✅ `quizresults` (không có underscore, lowercase, plural)

**Database name đúng:**
- ✅ `speedreading_admin`

**Nếu vẫn không thấy:** Chạy script `checkCollections.js` để debug chi tiết!

