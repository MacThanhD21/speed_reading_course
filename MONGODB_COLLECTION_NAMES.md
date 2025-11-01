# MongoDB Collection Names - Hướng dẫn tìm collections

## 🔍 Vấn đề: Không thấy data trong Compass

API trả về success nhưng không thấy data trong MongoDB Compass. Có thể do:

1. **Đang connect sai database**
2. **Collection names khác với tên model**
3. **Filter/search trong Compass đang sai**

---

## 📝 Mongoose Collection Naming

Mongoose tự động convert model names thành collection names theo quy tắc:

### Quy tắc:
1. **Lowercase** - Chuyển tất cả về chữ thường
2. **Pluralize** - Thêm 's' vào cuối (nếu chưa có)
3. **Loại bỏ underscores** - Không dùng underscore

### Ví dụ:

| Model Name | Collection Name |
|------------|----------------|
| `ReadingSession` | `readingsessions` |
| `QuizResult` | `quizresults` |
| `User` | `users` |
| `Contact` | `contacts` |

---

## 🔧 Cách kiểm tra trong MongoDB Compass

### Bước 1: Kiểm tra Database Name

1. Mở MongoDB Compass
2. Xem **top-left corner** → Database name hiển thị ở đó
3. **Phải là:** `speedreading_admin` (không phải `test` hoặc database khác)

### Bước 2: Kiểm tra Connection String

Trong `.env` file (server/.env):
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/speedreading_admin
```

**Lưu ý:** Connection string phải có `/speedreading_admin` ở cuối (trước `?` nếu có).

### Bước 3: Tìm Collections

Trong Compass, tìm các collection names sau (theo thứ tự ưu tiên):

**Reading Sessions:**
1. ✅ `readingsessions` (most likely)
2. `reading_sessions`
3. `readingsession`

**Quiz Results:**
1. ✅ `quizresults` (most likely)
2. `quiz_results`
3. `quizresult`

**Khác:**
- `users` - User collection
- `contacts` - Contact collection

---

## 🧪 Script để kiểm tra

Chạy script này để xem tất cả collections:

```bash
cd server
node utils/checkCollections.js
```

Script sẽ:
- ✅ Hiển thị database name đang connect
- ✅ List tất cả collections
- ✅ Đếm documents trong mỗi collection
- ✅ Hiển thị sample documents
- ✅ Tìm specific collections (readingsessions, quizresults, etc.)

---

## 📊 Kiểm tra từ Backend Logs

Khi start server, check logs:

```bash
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
📊 Database: speedreading_admin  ← Phải là speedreading_admin
```

Nếu thấy:
```
⚠️  WARNING: Đang sử dụng database "test"
```

→ Đang connect sai database! Fix MONGODB_URI trong `.env`.

---

## ✅ Quick Check trong MongoDB Compass

1. **Mở Compass**
2. **Connect** với connection string từ `.env`
3. **Check database name** ở top-left
4. **Click vào database** → Xem list collections
5. **Tìm:** `readingsessions` và `quizresults`
6. **Click vào collection** → Xem documents

### Nếu không thấy collections:

**Option 1: Refresh**
- Click refresh button (↻)
- Hoặc disconnect và reconnect

**Option 2: Check Filter**
- Đảm bảo không có filter nào đang active
- Clear all filters

**Option 3: Check Database**
- Đảm bảo đang ở đúng database (`speedreading_admin`)
- Không phải `test` hoặc database khác

---

## 🐛 Debug Steps

### Step 1: Verify API Response

Check network tab trong browser:
- Request: `POST /api/smartread/sessions`
- Response: `201 Created`
- Response body có `_id` và `data`

### Step 2: Check Backend Logs

Trong terminal (backend):
```
Create reading session error: [nếu có]
Save quiz result error: [nếu có]
```

### Step 3: Verify Database Connection

Chạy script:
```bash
cd server
node utils/checkCollections.js
```

### Step 4: Direct MongoDB Query

Nếu có MongoDB shell:
```javascript
use speedreading_admin
show collections
db.readingsessions.find().pretty()
db.quizresults.find().pretty()
```

---

## 🔄 Fix Common Issues

### Issue 1: Wrong Database

**Symptom:** Thấy data trong `test` database nhưng không thấy trong `speedreading_admin`

**Fix:**
```env
# server/.env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/speedreading_admin
```

**Verify:**
- Restart server
- Check logs: `📊 Database: speedreading_admin`

### Issue 2: Collection Name Mismatch

**Symptom:** Data có nhưng tìm sai tên collection

**Fix:**
- Tìm `readingsessions` (không phải `reading_sessions`)
- Tìm `quizresults` (không phải `quiz_results`)

### Issue 3: Connection String không có Database Name

**Symptom:** Data vào `test` database

**Fix:**
- Thêm `/speedreading_admin` vào connection string
- Hoặc set `DB_NAME=speedreading_admin` trong `.env`

---

## 📞 Nếu vẫn không thấy data:

1. **Chạy check script:**
   ```bash
   cd server
   node utils/checkCollections.js
   ```

2. **Check backend terminal logs** khi tạo reading session

3. **Verify MongoDB Compass:**
   - Database name: `speedreading_admin`
   - Collections: `readingsessions`, `quizresults`
   - Refresh và clear filters

4. **Test với MongoDB shell:**
   ```javascript
   use speedreading_admin
   db.readingsessions.countDocuments()
   db.quizresults.countDocuments()
   ```

---

## 💡 Tips

- **Mongoose collection names** luôn là **lowercase** và **plural**
- **Model:** `ReadingSession` → **Collection:** `readingsessions`
- **Model:** `QuizResult` → **Collection:** `quizresults`
- Luôn check **database name** trước khi tìm collections
- Dùng script `checkCollections.js` để debug nhanh

