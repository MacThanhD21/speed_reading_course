# Giải pháp xử lý Concurrent Requests (10-100 requests cùng lúc)

## 🎯 Tổng quan

Đã implement đầy đủ các giải pháp để xử lý **10-100 concurrent requests** từ nhiều máy khác nhau một cách hiệu quả và ổn định.

---

## 🔧 Các thành phần đã implement

### 1. **API Key Pool Manager** ✅
**File:** `server/utils/geminiPoolManager.js`

**Tính năng:**
- **Round-robin load balancing**: Phân phối requests đều giữa các API keys
- **Health tracking**: Theo dõi trạng thái từng key (healthy, rate-limited, error)
- **Auto recovery**: Tự động unmark rate-limited sau thời gian retry
- **Statistics**: Thống kê usage, errors, last used time cho mỗi key

**Cách hoạt động:**
```javascript
// Tự động distribute requests giữa các keys
const key = geminiPoolManager.getNextKey(); // Round-robin

// Nếu key bị rate limit
geminiPoolManager.markRateLimited(key, 60); // Mark và skip trong 60s

// Record success/error
geminiPoolManager.recordSuccess(key);
geminiPoolManager.recordError(key, error);
```

---

### 2. **Request Queue System** ✅
**File:** `server/utils/requestQueue.js`

**Tính năng:**
- **Concurrent limit**: Giới hạn số requests đồng thời tới Gemini API
- **Default: 10 concurrent requests** (configurable via `GEMINI_MAX_CONCURRENT`)
- **Queue management**: Requests được xếp hàng và xử lý tuần tự
- **Non-blocking**: Requests không bị block, chỉ được queue

**Cách hoạt động:**
```javascript
// Tất cả requests qua queue
const result = await geminiQueue.enqueue(async () => {
  return await callGeminiAPI();
});

// Queue tự động process:
// - Nếu < 10 requests đang chạy → Execute ngay
// - Nếu >= 10 requests → Xếp hàng, đợi slot trống
```

**Config:**
```bash
# server/.env
GEMINI_MAX_CONCURRENT=10  # Default: 10 concurrent requests
```

---

### 3. **Rate Limiting Middleware** ✅
**File:** `server/middleware/rateLimitMiddleware.js`

**Tính năng:**
- **Per-IP limiting**: Giới hạn requests theo IP address
- **AI endpoints**: 10 requests/phút (strict)
- **Regular endpoints**: 60 requests/phút
- **Auto cleanup**: Tự động xóa expired entries

**Cách hoạt động:**
```javascript
// AI endpoints có rate limit nghiêm ngặt hơn
router.post('/generate-quiz', aiRateLimiter, generateQuiz);
// → Max 10 requests/phút/IP

// Response headers
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 2024-01-01T12:01:00Z
```

---

### 4. **Smart Retry Logic** ✅
**File:** `server/controllers/smartReadController.js` (callGeminiJson)

**Tính năng:**
- **Multi-key retry**: Tự động thử key khác nếu key hiện tại fail
- **Rate limit detection**: Detect 429 errors và mark key
- **Exponential backoff**: Tăng dần thời gian chờ giữa các retry
- **Max retries**: Tối đa 5 lần (hoặc bằng số keys nếu có nhiều keys hơn)

**Cách hoạt động:**
```javascript
// Try key 1 → Fail (rate limit) → Wait 1s → Try key 2
// Try key 2 → Fail (rate limit) → Wait 2s → Try key 3
// ...
// Tối đa retry = max(5, số lượng keys)
```

---

## 📊 Flow xử lý 100 concurrent requests

```
┌─────────────────────────────────────────────────────────────────┐
│ 100 Requests từ nhiều máy khác nhau                             │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Rate Limiting Middleware                               │
│ - Check IP rate limit (10 req/min cho AI endpoints)             │
│ - Reject requests vượt quá limit với 429 status                 │
│ - Remaining requests tiếp tục                                    │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Request Queue                                           │
│ - Requests được enqueue vào queue                               │
│ - Chỉ 10 requests chạy đồng thời (configurable)                │
│ - Requests còn lại chờ trong queue                              │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: API Key Pool Manager                                    │
│ - Mỗi request được assign một key từ pool                       │
│ - Round-robin để distribute đều                                │
│ - Skip keys bị rate-limited                                     │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Gemini API Call                                        │
│ - Call Gemini với key được assign                              │
│ - Nếu success → Record success, return result                  │
│ - Nếu fail (429) → Mark key as rate-limited, retry với key khác│
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: Response                                                │
│ - Return kết quả về client                                      │
│ - Queue process next request                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Kết quả với 100 concurrent requests

### Scenario: 100 requests từ 10 IPs khác nhau (10 req/IP)

**Xử lý:**
1. ✅ **Rate Limiting**: Mỗi IP chỉ được 10 requests/phút → Tất cả requests đều pass (10 req/IP × 10 IPs = 100 req)
2. ✅ **Queue Management**: 
   - 10 requests đầu chạy ngay
   - 90 requests còn lại chờ trong queue
   - Queue tự động process tuần tự
3. ✅ **Key Distribution**: 
   - 10 keys trong pool → Mỗi request dùng 1 key khác nhau
   - Load được distribute đều
   - Nếu 1 key rate-limited → Auto switch sang key khác
4. ✅ **Retry Logic**: 
   - Nếu tất cả keys đều rate-limited → Retry với backoff
   - Đợi rate limit reset → Retry lại

**Kết quả:**
- ✅ Không có request nào bị lost
- ✅ Requests được xử lý ổn định
- ✅ API keys được sử dụng hiệu quả
- ✅ Server không bị overload

---

## ⚙️ Configuration

### Environment Variables

```bash
# server/.env

# API Keys (comma-separated)
GEMINI_API_KEYS=key1,key2,key3,...,key10

# Max concurrent requests to Gemini API
GEMINI_MAX_CONCURRENT=10  # Default: 10

# Rate limiting (configured in code, not env)
# AI endpoints: 10 req/min
# Regular endpoints: 60 req/min
```

---

## 📈 Monitoring & Debugging

### Check Pool Stats

```bash
GET /api/smartread/pool-stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "pool": {
    "totalKeys": 10,
    "healthyKeys": 8,
    "rateLimitedKeys": 2,
    "usage": [
      {
        "key": "AIzaSyC3B6...Z8Y",
        "usageCount": 150,
        "errorCount": 2,
        "lastUsed": "2024-01-01T12:00:00Z",
        "isRateLimited": false,
        "limitedUntil": null
      },
      {
        "key": "AIzaSyB-o...Wfg",
        "usageCount": 145,
        "errorCount": 0,
        "lastUsed": "2024-01-01T12:00:05Z",
        "isRateLimited": true,
        "limitedUntil": "2024-01-01T12:01:00Z"
      }
    ]
  },
  "queue": {
    "running": 5,
    "queued": 23,
    "maxConcurrent": 10,
    "total": 28
  },
  "timestamp": "2024-01-01T12:00:10Z"
}
```

---

## 🚀 Performance Tuning

### Tăng capacity cho nhiều requests hơn

1. **Tăng concurrent limit:**
   ```bash
   GEMINI_MAX_CONCURRENT=20  # Tăng từ 10 → 20
   ```

2. **Thêm more API keys:**
   ```bash
   GEMINI_API_KEYS=key1,key2,...,key20  # Thêm keys vào pool
   ```

3. **Tăng rate limit (nếu cần):**
   ```javascript
   // server/middleware/rateLimitMiddleware.js
   export const aiRateLimiter = rateLimiter({
     windowMs: 60 * 1000,
     max: 20,  // Tăng từ 10 → 20
   });
   ```

---

## ✅ Checklist

- [x] API Key Pool Manager với round-robin
- [x] Request Queue để limit concurrent requests
- [x] Rate Limiting middleware cho AI endpoints
- [x] Smart retry logic với key rotation
- [x] Rate limit detection và auto-marking
- [x] Statistics endpoint để monitor
- [x] Auto recovery cho rate-limited keys
- [x] Error handling cho all scenarios

---

## 🔍 Testing

### Test với nhiều requests cùng lúc

```bash
# Test script (bash)
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/smartread/generate-quiz \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"textId":"test","textContent":"..."}' &
done
wait

# Check pool stats
curl http://localhost:5000/api/smartread/pool-stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Notes

1. **Queue không block requests**: Requests được enqueue, không bị reject
2. **Keys tự động recover**: Sau khi rate limit hết, key tự động được unmark
3. **Round-robin đảm bảo fairness**: Tất cả keys được sử dụng đều
4. **Statistics real-time**: Pool stats update ngay khi có usage
5. **Configurable**: Tất cả limits đều có thể config qua env vars

---

**Last Updated:** 2024-01-XX  
**Status:** ✅ Production Ready

