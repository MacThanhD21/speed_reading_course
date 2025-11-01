# SmartRead Data Flow - Hướng dẫn xử lý dữ liệu

## 📊 Tổng quan Collections

Dự án có 4 collections trong MongoDB:
1. **`users`** - Lưu thông tin người dùng (đã có data)
2. **`contacts`** - Lưu thông tin form liên hệ (đã có data)
3. **`reading_sessions`** - Lưu lịch sử đọc (CẦN TEST)
4. **`quiz_results`** - Lưu kết quả quiz (CẦN TEST)

## 🔄 Flow xử lý dữ liệu

### 1. Reading Session Flow

**Khi nào data được lưu:**
- Khi user **hoàn thành đọc** (click nút "Kết thúc đọc" hoặc "Finish Reading")

**Quy trình:**
```
1. User đăng nhập → Truy cập /smartread
2. Paste text → Bắt đầu đọc
3. Click "Bắt đầu đọc" → readingStartTimeRef được set
4. Đọc nội dung và scroll
5. Click "Kết thúc đọc" → handleFinishReading() được gọi
   ↓
   saveReadingSession() được gọi
   ↓
   POST /api/smartread/sessions
   ↓
   Backend: createReadingSession() lưu vào database
```

**API Endpoint:**
- **URL:** `POST /api/smartread/sessions`
- **Auth:** Required (Bearer Token)
- **Request Body:**
```json
{
  "content": {
    "title": "Văn bản đã dán",
    "text": "...",
    "wordCount": 100,
    "source": "pasted"
  },
  "readingStats": {
    "wpm": 200,
    "duration": 60000,
    "startTime": "2024-01-01T10:00:00.000Z",
    "endTime": "2024-01-01T10:01:00.000Z"
  }
}
```

**Collection:** `reading_sessions`
**Schema:**
- `user` (ObjectId) - Reference đến User
- `content` - Thông tin nội dung đọc
- `readingStats` - Thống kê đọc (WPM, duration, startTime, endTime)
- `status` - Trạng thái (reading, completed, abandoned)
- `quizResult` - Reference đến QuizResult (nếu có)

---

### 2. Quiz Result Flow

**Khi nào data được lưu:**
- Khi user **hoàn thành quiz** sau khi đọc xong

**Quy trình:**
```
1. User hoàn thành đọc → Reading session được lưu → readingSessionId được set
2. User click "Làm bài kiểm tra trắc nghiệm" → QuizPanel hiển thị
3. User làm quiz và submit
4. Quiz được chấm (local grading)
5. handleQuizComplete() được gọi
   ↓
   saveQuizResult() được gọi
   ↓
   POST /api/smartread/quiz-results
   ↓
   Backend: saveQuizResult() lưu vào database
```

**API Endpoint:**
- **URL:** `POST /api/smartread/quiz-results`
- **Auth:** Required (Bearer Token)
- **Request Body:**
```json
{
  "readingSessionId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "quizType": "mcq",
  "results": {
    "correctCount": 8,
    "totalQuestions": 10,
    "comprehensionPercent": 80
  },
  "metrics": {
    "wpm": 200,
    "rei": 160
  },
  "answers": [
    {
      "questionId": "q1",
      "questionType": "mcq",
      "userAnswer": "A",
      "correctAnswer": "B",
      "isCorrect": false,
      "explanation": "..."
    }
  ],
  "feedback": "Tốt! Bạn đã nắm được phần lớn nội dung."
}
```

**Collection:** `quiz_results`
**Schema:**
- `user` (ObjectId) - Reference đến User
- `readingSession` (ObjectId) - Reference đến ReadingSession
- `quizType` - Loại quiz (mcq, 5w1h, mixed)
- `results` - Kết quả (correctCount, totalQuestions, comprehensionPercent)
- `metrics` - Metrics (WPM, REI, RCI)
- `answers` - Mảng các câu trả lời
- `feedback` - Phản hồi

---

## 🔍 Debug - Tại sao không có data?

### Checklist để kiểm tra:

#### 1. Kiểm tra Reading Sessions

**Bước test:**
1. ✅ Đăng nhập vào hệ thống
2. ✅ Vào `/smartread/paste-text`
3. ✅ Paste một đoạn text
4. ✅ Click "Bắt đầu đọc"
5. ✅ Scroll đọc một chút
6. ✅ **Click "Kết thúc đọc"** ← QUAN TRỌNG
7. ✅ Kiểm tra Console logs:
   - Phải có: `"Saving reading session:"`
   - Phải có: `"✅ Reading session saved successfully:"`

**Nếu không thấy logs:**
- Kiểm tra xem có click "Kết thúc đọc" chưa
- Kiểm tra network tab xem có request `POST /api/smartread/sessions` không
- Kiểm tra response status code (phải là 201)

**Nếu thấy lỗi:**
- 401: Token không hợp lệ → Đăng nhập lại
- 400: Dữ liệu không đầy đủ → Check console logs
- 500: Lỗi server → Check backend logs

#### 2. Kiểm tra Quiz Results

**Bước test:**
1. ✅ Hoàn thành đọc (đã lưu reading session)
2. ✅ Trong popup completion, click **"Làm bài kiểm tra trắc nghiệm"**
3. ✅ Đợi quiz được generate (có thể mất 5-10 giây)
4. ✅ Làm quiz và submit
5. ✅ Kiểm tra Console logs:
   - Phải có: `"Quiz completed:"`
   - Phải có: `"✅ Quiz result saved:"`

**Điều kiện để lưu Quiz Result:**
- ✅ `readingSessionId` phải có giá trị (từ bước 1)
- ✅ `quizResult` phải có data hợp lệ

**Nếu không thấy logs:**
- Kiểm tra xem có click "Làm bài kiểm tra" chưa
- Kiểm tra xem quiz có được generate không
- Kiểm tra xem có submit quiz chưa
- Kiểm tra `readingSessionId` có giá trị không

---

## 📝 Code Locations

### Frontend:
- **Reading Session:** `src/components/smartread/ReadingMode.jsx` → `saveReadingSession()`
- **Quiz Result:** `src/components/smartread/ReadingMode.jsx` → `handleQuizComplete()`
- **API Service:** `src/services/apiService.js` → `createReadingSession()`, `saveQuizResult()`

### Backend:
- **Routes:** `server/routes/smartReadRoutes.js`
- **Controllers:** `server/controllers/smartReadController.js` → `createReadingSession()`, `saveQuizResult()`
- **Models:** 
  - `server/models/ReadingSession.js`
  - `server/models/QuizResult.js`

---

## 🐛 Common Issues

### Issue 1: Reading Sessions không được lưu
**Nguyên nhân:**
- User chưa click "Kết thúc đọc"
- Token authentication failed
- Dữ liệu không hợp lệ (thiếu text, wordCount = 0)

**Giải pháp:**
- Check console logs để xem error
- Đảm bảo đã đăng nhập
- Đảm bảo đã paste text và có nội dung

### Issue 2: Quiz Results không được lưu
**Nguyên nhân:**
- `readingSessionId` là null (chưa lưu reading session)
- User chưa submit quiz
- Quiz generation failed

**Giải pháp:**
- Phải hoàn thành reading session trước
- Kiểm tra xem quiz có được generate không
- Check console logs

### Issue 3: Data không hiển thị trong MongoDB
**Nguyên nhân:**
- Đang connect sai database
- Collection names khác nhau (case-sensitive)
- Data đã bị xóa

**Giải pháp:**
- Kiểm tra MongoDB connection string
- Kiểm tra database name trong `.env`
- Query trực tiếp: `db.reading_sessions.find()` và `db.quiz_results.find()`

---

## 🧪 Test Commands

### Test API trực tiếp với curl:

**1. Test Reading Session:**
```bash
curl -X POST http://localhost:5000/api/smartread/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": {
      "title": "Test Text",
      "text": "This is a test text for reading session.",
      "wordCount": 8,
      "source": "pasted"
    },
    "readingStats": {
      "wpm": 200,
      "duration": 30000,
      "startTime": "2024-01-01T10:00:00.000Z",
      "endTime": "2024-01-01T10:00:30.000Z"
    }
  }'
```

**2. Test Quiz Result:**
```bash
curl -X POST http://localhost:5000/api/smartread/quiz-results \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "readingSessionId": "READING_SESSION_ID",
    "quizType": "mcq",
    "results": {
      "correctCount": 8,
      "totalQuestions": 10,
      "comprehensionPercent": 80
    },
    "metrics": {
      "wpm": 200,
      "rei": 160
    },
    "answers": [],
    "feedback": "Test feedback"
  }'
```

### Check MongoDB:
```javascript
// Connect to MongoDB
use speedreading_admin

// Check reading sessions
db.reading_sessions.find().pretty()

// Check quiz results
db.quiz_results.find().pretty()

// Count documents
db.reading_sessions.countDocuments()
db.quiz_results.countDocuments()
```

---

## ✅ Next Steps

1. **Test end-to-end flow:**
   - Đăng nhập → Paste text → Đọc → Kết thúc → Làm quiz
   - Kiểm tra console logs ở mỗi bước
   - Kiểm tra network requests trong DevTools

2. **Kiểm tra backend logs:**
   - Chạy backend với `npm run dev` trong thư mục `server`
   - Xem logs khi có requests đến
   - Kiểm tra errors nếu có

3. **Verify database:**
   - Connect MongoDB và kiểm tra collections
   - Query data để xem có records không
   - Check indexes đã được tạo chưa

---

## 📞 Nếu vẫn không có data:

1. **Mở Browser DevTools (F12)**
2. **Tab Console** - Xem logs:
   - `"Saving reading session:"`
   - `"✅ Reading session saved successfully:"`
   - `"Quiz completed:"`
   - `"✅ Quiz result saved:"`

3. **Tab Network** - Xem requests:
   - `POST /api/smartread/sessions` (status 201)
   - `POST /api/smartread/quiz-results` (status 201)

4. **Backend Terminal** - Xem server logs:
   - `Create reading session error:`
   - `Save quiz result error:`

5. **MongoDB Compass/Shell:**
   - Connect và query collections
   - Check xem có documents nào không

