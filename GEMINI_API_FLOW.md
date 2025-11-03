# Luồng Gemini API - Tài liệu Kỹ thuật

## 📋 Tổng quan

Tất cả các tính năng AI (Quiz, 5W1H, Reading Tips, Concepts & Statistics) đều được xử lý qua **Backend** (Railway) để đảm bảo:
- ✅ Bảo mật API keys (không expose ra frontend)
- ✅ Quản lý API keys tập trung
- ✅ Retry logic với nhiều keys
- ✅ Error handling thống nhất

---

## 🏗️ Kiến trúc tổng quan

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend  │ ──────> │    Backend   │ ──────> │ Gemini API   │
│  (Vercel)  │         │  (Railway)   │         │  (Google)    │
└─────────────┘         └──────────────┘         └──────────────┘
```

### Data Flow:
1. **Frontend Component** → Gọi service method
2. **Frontend Service** → Gọi `apiService` method
3. **apiService** → HTTP request tới Backend endpoint
4. **Backend Controller** → Xử lý request, gọi Gemini API
5. **Backend** → Parse response, normalize data
6. **Backend** → Trả JSON về Frontend
7. **Frontend Service** → Xử lý response, trả data cho Component

---

## 📁 Cấu trúc Files

### Frontend (Vercel)

#### 1. **Services Layer** (`src/services/`)
- `apiService.js` - Wrapper cho tất cả API calls đến backend
- `quizService.js` - Xử lý Quiz generation & grading (local)
- `readingTipsService.js` - Xử lý 5W1H, Reading Tips, Concepts & Statistics
- `stepByStepAnalysisService.js` - Xử lý phân tích từng bước (fallback)

#### 2. **Components** (`src/components/smartread/`)
- `QuizPanel.jsx` - Hiển thị quiz
- `LearningPanel.jsx` - Hiển thị 5W1H, Concepts, Statistics
- `ReadingMode.jsx` - Component chính điều phối

---

### Backend (Railway)

#### 1. **Controller** (`server/controllers/smartReadController.js`)
Chứa tất cả logic xử lý Gemini API:
- Helper functions: `getGeminiApiKeys()`, `callGemini()`, `callGeminiJson()`, `parseSimpleJson()`
- Prompt builders: `createQuizPrompt()`, `buildFiveWOneHPrompt()`, `buildTipsPrompt()`, `buildComprehensivePrompt()`
- Endpoints: `generateQuiz()`, `generateFiveWOneH()`, `generateReadingTips()`, `generateComprehensiveLearning()`

#### 2. **Routes** (`server/routes/smartReadRoutes.js`)
Định nghĩa các routes:
- `POST /api/smartread/generate-quiz`
- `POST /api/smartread/fivewoneh`
- `POST /api/smartread/reading-tips`
- `POST /api/smartread/comprehensive-learning`

#### 3. **Environment Variables** (`server/.env`)
```bash
GEMINI_API_KEYS=key1,key2,key3,...
```

---

## 🔄 Luồng chi tiết từng tính năng

### 1️⃣ Quiz Generation

```
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: QuizPanel.jsx                                         │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ quizService.generateQuiz(textId, textContent, n)                │
│ Location: src/services/quizService.js:107                       │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ apiService.generateQuiz({ textId, textContent, n })             │
│ Location: src/services/apiService.js:196                         │
│ HTTP POST: /api/smartread/generate-quiz                         │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend Route Handler                                           │
│ Location: server/routes/smartReadRoutes.js:26                   │
│ Route: POST /api/smartread/generate-quiz                        │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend Controller: generateQuiz()                              │
│ Location: server/controllers/smartReadController.js:600        │
│                                                                  │
│ Steps:                                                           │
│ 1. Validate input (textId, textContent)                         │
│ 2. Build prompt: createQuizPrompt(textId, textContent, n)       │
│ 3. Get API keys: getGeminiApiKeys()                             │
│ 4. Try each key: callGemini(prompt, key)                        │
│    - Retry with next key if fails                               │
│ 5. Parse response: parseQuizJSON(responseText)                  │
│ 6. Normalize: Map questions with qid, type, prompt, options... │
│ 7. Return JSON: { success, quizId, textId, questions }           │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Gemini API Call                                                 │
│ Location: server/controllers/smartReadController.js:37          │
│                                                                  │
│ Function: callGemini(prompt, apiKey)                            │
│ - Endpoint: https://generativelanguage.googleapis.com/          │
│   v1beta/models/gemini-2.0-flash:generateContent                │
│ - Method: POST                                                  │
│ - Headers: Content-Type: application/json                        │
│ - Body: {                                                        │
│     contents: [{ parts: [{ text: prompt }] }],                   │
│     generationConfig: {                                          │
│       temperature: 0.2,                                          │
│       maxOutputTokens: 4000,                                     │
│       topP: 0.8,                                                 │
│       topK: 40                                                   │
│     }                                                            │
│   }                                                              │
│                                                                  │
│ Response: {                                                      │
│   candidates: [{                                                 │
│     content: {                                                   │
│       parts: [{ text: "JSON string response" }]                   │
│     }                                                            │
│   }]                                                             │
│ }                                                                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend: Parse & Return                                         │
│ - Extract text from response                                    │
│ - Parse JSON (handle markdown, trailing commas...)              │
│ - Validate structure                                            │
│ - Normalize data                                                │
│ - Return to Frontend                                            │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: Receive & Display                                     │
│ - quizService receives JSON                                     │
│ - Returns quiz object to QuizPanel                              │
│ - Component displays questions                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Functions:**
- `createQuizPrompt()` - Tạo prompt cho Gemini (dòng 63-85)
- `parseQuizJSON()` - Parse JSON từ Gemini response (dòng 87-100)
- `callGemini()` - Gọi Gemini API với một key (dòng 37-61)
- `callGeminiJson()` - Retry với nhiều keys (dòng 353-365)

---

### 2️⃣ 5W1H Questions Generation

```
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: LearningPanel.jsx hoặc ReadingMode.jsx                 │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ readingTipsService.generate5W1HQuestions(content)               │
│ Location: src/services/readingTipsService.js:8                   │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ apiService.generateFiveWOneH({ title, text })                   │
│ Location: src/services/apiService.js:204                         │
│ HTTP POST: /api/smartread/fivewoneh                             │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend Controller: generateFiveWOneH()                         │
│ Location: server/controllers/smartReadController.js:443          │
│                                                                  │
│ Steps:                                                           │
│ 1. Extract: { title, text } from req.body                      │
│ 2. Build prompt: buildFiveWOneHPrompt(title, text)              │
│    - Truncate text to 3000 chars                                 │
│    - Create Vietnamese prompt với yêu cầu chi tiết             │
│ 3. Get keys: getGeminiApiKeys()                                 │
│ 4. Call Gemini: callGeminiJson(prompt, keys)                    │
│    - Auto retry với key khác nếu fail                           │
│ 5. Parse JSON: parseSimpleJson(txt)                             │
│    - Remove markdown code blocks                                │
│    - Fix trailing commas                                        │
│    - Extract JSON object                                        │
│ 6. Normalize questions:                                         │
│    - Ensure id, question, type, expectedLength, keyPoints       │
│    - Default fallback nếu thiếu                                  │
│ 7. Return: { success, questions: [...] }                         │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Gemini API → Returns JSON                                       │
│ Expected format: {                                              │
│   "questions": [                                                │
│     {                                                           │
│       "id": 1,                                                  │
│       "question": "...",                                         │
│       "type": "what|who|when|where|why|how",                    │
│       "expectedLength": "Ngắn|Trung bình|Dài",                  │
│       "keyPoints": ["...", "..."]                                │
│     }                                                            │
│   ]                                                              │
│ }                                                                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: Receive & Display                                     │
│ - readingTipsService receives questions array                   │
│ - Normalize and validate                                        │
│ - Return to component                                           │
│ - LearningPanel displays 5W1H questions                         │
└─────────────────────────────────────────────────────────────────┘
```

**Key Functions:**
- `buildFiveWOneHPrompt()` - Tạo prompt chi tiết cho 5W1H (dòng 367-408)
- `parseSimpleJson()` - Parse JSON generic (dòng 424-438)
- Normalize logic - Đảm bảo đủ fields (dòng 455-463)

---

### 3️⃣ Reading Tips Generation

```
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: LearningPanel.jsx                                    │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ readingTipsService.generateComprehensiveLearningData(...)       │
│ (Tips được lấy từ backend, nhưng hiện tại dùng fixed tips)      │
│ Location: src/services/readingTipsService.js:796                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ apiService.generateReadingTips({ readingData, content })        │
│ Location: src/services/apiService.js:212                         │
│ HTTP POST: /api/smartread/reading-tips                           │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend Controller: generateReadingTips()                      │
│ Location: server/controllers/smartReadController.js:474         │
│                                                                  │
│ Steps:                                                           │
│ 1. Extract: { readingData, content }                            │
│ 2. Build prompt: buildTipsPrompt(readingData, content)          │
│    - Include: finalWPM, averageWPM, wordsRead, elapsedTime     │
│    - Content snippet (1200 chars)                               │
│ 3. Call Gemini: callGeminiJson(prompt, keys)                   │
│ 4. Parse: parseSimpleJson(txt)                                   │
│ 5. Validate: Check data.tips exists                            │
│ 6. Return: { success, tips: [...] }                              │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Gemini API → Returns                                           │
│ Expected: { "tips": ["...", "...", "...", "...", "..."] }       │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: Display Tips                                          │
│ Note: Hiện tại tips được hardcode trong getFixedReadingTips()   │
│ Backend tips được dùng như fallback khi có                       │
└─────────────────────────────────────────────────────────────────┘
```

**Key Functions:**
- `buildTipsPrompt()` - Tạo prompt dựa trên reading metrics (dòng 410-422)

---

### 4️⃣ Concepts & Statistics Generation

```
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: LearningPanel.jsx                                    │
│ User clicks tab "Khái niệm & Thuật ngữ" hoặc "Số liệu"          │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ loadComprehensiveData()                                         │
│ Location: src/components/smartread/LearningPanel.jsx:122        │
│ - Calls readingTipsService.generateComprehensiveLearningData()  │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ readingTipsService.generateComprehensiveLearningData(...)       │
│ Location: src/services/readingTipsService.js:796                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ apiService.generateComprehensiveLearning({ content, readingData })│
│ Location: src/services/apiService.js:220                         │
│ HTTP POST: /api/smartread/comprehensive-learning                 │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend Controller: generateComprehensiveLearning()             │
│ Location: server/controllers/smartReadController.js:566         │
│                                                                  │
│ Steps:                                                           │
│ 1. Validate: Check content exists                               │
│ 2. Build prompt: buildComprehensivePrompt(content, readingData) │
│    - Extract title, textContent                                 │
│    - Truncate to 8000 chars                                     │
│    - Create detailed Vietnamese prompt                          │
│    - Request: conceptsAndTerms, statistics, previewQuestions    │
│ 3. Get keys: getGeminiApiKeys()                                 │
│ 4. Call Gemini: callGeminiJson(prompt, keys)                   │
│ 5. Parse: parseSimpleJson(txt)                                  │
│ 6. Normalize: Ensure arrays exist                              │
│ 7. Return: {                                                    │
│     success: true,                                              │
│     conceptsAndTerms: [...],                                     │
│     statistics: [...],                                          │
│     previewQuestions: [...]                                      │
│   }                                                              │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Gemini API → Returns                                            │
│ Expected format: {                                              │
│   "conceptsAndTerms": [                                         │
│     {                                                           │
│       "term": "...",                                            │
│       "definition": "...",                                       │
│       "example": "...",                                          │
│       "type": "khái niệm" hoặc "thuật ngữ"                      │
│     }                                                            │
│   ],                                                             │
│   "statistics": [                                               │
│     {                                                           │
│       "data": "...",                                            │
│       "unit": "...",                                             │
│       "significance": "...",                                     │
│       "context": "...",                                          │
│       "memoryTip": "..."                                         │
│     }                                                            │
│   ],                                                             │
│   "previewQuestions": [                                         │
│     { "question": "..." }                                       │
│   ]                                                              │
│ }                                                                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: Receive & Display                                     │
│ - readingTipsService receives data                              │
│ - Fallback to local data nếu API fail                           │
│ - LearningPanel displays concepts/statistics                    │
└─────────────────────────────────────────────────────────────────┘
```

**Key Functions:**
- `buildComprehensivePrompt()` - Tạo prompt chi tiết (dòng 488-561)
- Normalize logic - Đảm bảo arrays không empty (dòng 583-593)

---

## 🔧 Helper Functions (Backend)

### `getGeminiApiKeys()`
**Location:** `server/controllers/smartReadController.js:7`

```javascript
// Đọc từ environment variable
const keys = process.env.GEMINI_API_KEYS.split(',').filter(Boolean);
// Fallback: GEMINI_API_KEY_1, GEMINI_API_KEY_2, ...
// Throw error nếu không có keys
```

**Usage:** Được gọi trong mỗi endpoint để lấy danh sách API keys.

---

### `callGemini(prompt, apiKey)`
**Location:** `server/controllers/smartReadController.js:37`

```javascript
// Gọi Gemini API với một key cụ thể
const response = await fetch(`${geminiEndpoint}?key=${apiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4000,
      topP: 0.8,
      topK: 40
    }
  })
});
// Extract text từ response
```

**Returns:** Raw text response từ Gemini.

---

### `callGeminiJson(prompt, keys)`
**Location:** `server/controllers/smartReadController.js:353`

```javascript
// Retry logic: Thử từng key cho đến khi thành công
for (const key of keys) {
  try {
    const txt = await callGemini(prompt, key);
    return txt;
  } catch (e) {
    lastError = e;
    continue; // Thử key tiếp theo
  }
}
throw lastError || new Error('All Gemini keys failed');
```

**Returns:** Text response (nếu thành công), hoặc throw error.

---

### `parseSimpleJson(text)`
**Location:** `server/controllers/smartReadController.js:424`

```javascript
// Clean response:
// 1. Remove BOM
// 2. Remove markdown code blocks (```json ... ```)
// 3. Fix smart quotes
// 4. Extract JSON object (from first { to last })
// 5. Remove trailing commas
// 6. Parse JSON
// Return parsed object hoặc null nếu fail
```

**Usage:** Dùng cho 5W1H, Reading Tips, Comprehensive Learning.

---

### `parseQuizJSON(text)`
**Location:** `server/controllers/smartReadController.js:87`

Similar to `parseSimpleJson()` but specialized for quiz format.

---

## 🔐 API Key Management

### Environment Setup (Railway)

**File:** `server/.env`

```bash
# Comma-separated list of Gemini API keys
GEMINI_API_KEYS=AIzaSy...,AIzaSy...,AIzaSy...
```

**Fallback (nếu cần):**
```bash
GEMINI_API_KEY_1=AIzaSy...
GEMINI_API_KEY_2=AIzaSy...
# ...
```

### Key Rotation Logic

Backend tự động retry với key khác nếu một key fail:
1. Key 1 fail → Thử Key 2
2. Key 2 fail → Thử Key 3
3. ...
4. Tất cả fail → Return error

---

## 📊 Response Format

### Quiz Response
```json
{
  "success": true,
  "quizId": "quiz_1234567890",
  "textId": "text_id",
  "generatedAt": "2024-01-01T00:00:00.000Z",
  "questions": [
    {
      "qid": "q1",
      "type": "mcq",
      "prompt": "Câu hỏi...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct": "B",
      "explanation": "Giải thích..."
    }
  ]
}
```

### 5W1H Response
```json
{
  "success": true,
  "questions": [
    {
      "id": 1,
      "question": "Câu hỏi...",
      "type": "what",
      "expectedLength": "Trung bình",
      "keyPoints": ["Điểm 1", "Điểm 2", "Điểm 3"]
    }
  ]
}
```

### Reading Tips Response
```json
{
  "success": true,
  "tips": [
    "Mẹo 1...",
    "Mẹo 2...",
    "..."
  ]
}
```

### Comprehensive Learning Response
```json
{
  "success": true,
  "conceptsAndTerms": [
    {
      "term": "...",
      "definition": "...",
      "example": "...",
      "type": "khái niệm"
    }
  ],
  "statistics": [
    {
      "data": "...",
      "unit": "...",
      "significance": "...",
      "context": "...",
      "memoryTip": "..."
    }
  ],
  "previewQuestions": [
    { "question": "..." }
  ]
}
```

---

## 🚨 Error Handling

### Frontend Error Handling

**Location:** `src/services/readingTipsService.js`, `src/services/quizService.js`

- Catch errors từ API calls
- Fallback to local/fixed data nếu API fail
- Log errors để debug

### Backend Error Handling

**Location:** `server/controllers/smartReadController.js`

- Validate input parameters
- Try multiple API keys nếu một key fail
- Parse JSON với error handling
- Return standardized error format:
  ```json
  {
    "success": false,
    "message": "Error message here"
  }
  ```

---

## 📝 Notes

1. **Tất cả API keys được quản lý ở Backend**, không expose ra Frontend
2. **Prompt được build ở Backend** để dễ maintain và update
3. **JSON parsing** xử lý nhiều edge cases (markdown, trailing commas, smart quotes)
4. **Retry logic** tự động thử key khác nếu một key fail
5. **Normalize data** để đảm bảo frontend nhận được format chuẩn
6. **Fallback data** ở frontend để đảm bảo UX khi API fail

---

## 🔄 Thay đổi API Keys

### Để thay thế API keys:

1. **Railway Dashboard:**
   - Vào Settings → Environment Variables
   - Update `GEMINI_API_KEYS` với keys mới (comma-separated)
   - Redeploy backend

2. **Local Development:**
   - Update `server/.env`:
     ```bash
     GEMINI_API_KEYS=new_key1,new_key2,new_key3
     ```
   - Restart backend server

---

## 🧪 Testing

### Test từng endpoint:

1. **Quiz:**
   ```bash
   POST /api/smartread/generate-quiz
   Body: { "textId": "test", "textContent": "...", "n": 12 }
   ```

2. **5W1H:**
   ```bash
   POST /api/smartread/fivewoneh
   Body: { "title": "...", "text": "..." }
   ```

3. **Reading Tips:**
   ```bash
   POST /api/smartread/reading-tips
   Body: { "readingData": {...}, "content": {...} }
   ```

4. **Comprehensive:**
   ```bash
   POST /api/smartread/comprehensive-learning
   Body: { "content": {...}, "readingData": {...} }
   ```

---

## 📚 Related Files

### Frontend:
- `src/services/apiService.js` - API client
- `src/services/quizService.js` - Quiz logic
- `src/services/readingTipsService.js` - 5W1H, Tips, Concepts, Statistics
- `src/components/smartread/QuizPanel.jsx` - Quiz UI
- `src/components/smartread/LearningPanel.jsx` - Learning UI

### Backend:
- `server/controllers/smartReadController.js` - All Gemini logic
- `server/routes/smartReadRoutes.js` - Route definitions
- `server/server.js` - Express server setup

---

**Last Updated:** 2024-01-XX  
**Version:** 1.0

