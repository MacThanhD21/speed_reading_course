# SmartRead Logging System Documentation

## Tổng quan
Hệ thống logging tập trung cho SmartRead đã được tối ưu hóa để dễ kiểm soát và debug. Tất cả logs được quản lý thông qua `src/utils/logger.js`.

## Cấu trúc Logging

### 1. Log Levels (Mức độ ưu tiên)
- **ERROR (0)**: Lỗi nghiêm trọng cần xử lý ngay
- **WARN (1)**: Cảnh báo, có thể ảnh hưởng đến trải nghiệm
- **INFO (2)**: Thông tin quan trọng về hoạt động
- **DEBUG (3)**: Chi tiết kỹ thuật cho debugging
- **TRACE (4)**: Thông tin rất chi tiết

### 2. Modules (Các module được theo dõi)
- **🔑 API Manager**: Quản lý API keys và load balancing
- **📚 Reading Tips**: Service tạo câu hỏi và nội dung học tập
- **🎓 Learning Panel**: Component hiển thị nội dung học tập
- **🤖 Gemini**: Service gọi Gemini API
- **📖 Reading Mode**: Component chế độ đọc
- **📝 General**: Logs chung

## Cách sử dụng

### Trong Development
```javascript
// Mặc định ở mức DEBUG trong development
logger.debug('MODULE_NAME', 'Debug message', { data: 'value' });
logger.info('MODULE_NAME', 'Info message');
logger.warn('MODULE_NAME', 'Warning message');
logger.error('MODULE_NAME', 'Error message', { error: errorObject });
```

### Trong Production
```javascript
// Mặc định ở mức INFO trong production
// Chỉ hiển thị INFO, WARN, ERROR
```

### Điều chỉnh Log Level
```javascript
// Trong browser console (chỉ development)
setLogLevel(0); // ERROR only
setLogLevel(1); // WARN and ERROR
setLogLevel(2); // INFO, WARN, ERROR (default production)
setLogLevel(3); // DEBUG, INFO, WARN, ERROR (default development)
setLogLevel(4); // All logs including TRACE
```

## Tính năng Debugging

### 1. Xem Logs đã lưu
```javascript
// Trong browser console
getLogs(); // Trả về array các logs
```

### 2. Xóa Logs
```javascript
clearLogs(); // Xóa tất cả logs đã lưu
```

### 3. Export Logs
```javascript
exportLogs(); // Trả về JSON string của logs
```

### 4. Lưu trữ Logs
- Logs được lưu trong memory (tối đa 100 logs gần nhất)
- Tự động xóa logs cũ khi vượt quá giới hạn
- Chỉ hoạt động trong development mode

## Các Service đã được cập nhật

### 1. API Key Manager (`apiKeyManager.js`)
- Log khi khởi tạo và quản lý keys
- Log khi chọn key và thống kê
- Log khi có lỗi và retry
- Log khi cleanup quotas

### 2. Reading Tips Service (`readingTipsService.js`)
- Log khi tạo 5W1H questions
- Log khi parse response từ AI
- Log khi tạo comprehensive data
- Log chi tiết về fallback data

### 3. Learning Panel (`LearningPanel.jsx`)
- Log khi load data
- Log khi user interactions
- Log khi có lỗi API
- Log khi evaluation

### 4. Gemini Service (`geminiService.js`)
- Log API calls và responses
- Log rate limiting
- Log retry attempts
- Log errors chi tiết

### 5. Step by Step Analysis (`stepByStepAnalysisService.js`)
- Log khi tạo concepts, 5W1H, MCQ
- Log parsing responses
- Log fallback data

## Lợi ích

### 1. Dễ Debug
- Tất cả logs có timestamp và module
- Structured data cho debugging
- Có thể filter theo level và module

### 2. Performance Monitoring
- Track API call success/failure rates
- Monitor response times
- Identify bottlenecks

### 3. Error Tracking
- Chi tiết về lỗi API
- Context về user actions
- Fallback behavior tracking

### 4. Development Experience
- Console commands để debug
- Export logs để phân tích
- Real-time log level adjustment

## Best Practices

### 1. Sử dụng đúng Module
```javascript
// ✅ Đúng
logger.info('READING_TIPS', 'Generated questions', { count: 5 });

// ❌ Sai
logger.info('GENERAL', 'Generated questions', { count: 5 });
```

### 2. Structured Data
```javascript
// ✅ Đúng - có context
logger.error('GEMINI_SERVICE', 'API call failed', {
  status: 503,
  keyId: 1,
  attempt: 2,
  error: error.message
});

// ❌ Sai - thiếu context
logger.error('GEMINI_SERVICE', 'API call failed');
```

### 3. Appropriate Levels
```javascript
// ✅ Đúng
logger.debug('API_KEY_MANAGER', 'Key selected', { keyId: 1 }); // Debug info
logger.info('LEARNING_PANEL', 'Data loaded successfully'); // Important info
logger.warn('GEMINI_SERVICE', 'Rate limited, retrying'); // Warning
logger.error('READING_TIPS', 'Failed to parse response'); // Error
```

## Troubleshooting

### 1. Không thấy logs
- Kiểm tra log level: `setLogLevel(3)` cho DEBUG
- Kiểm tra console có bị filter không
- Reload page để reset logger

### 2. Quá nhiều logs
- Giảm log level: `setLogLevel(1)` cho WARN/ERROR only
- Clear logs: `clearLogs()`

### 3. Logs bị mất
- Logs chỉ lưu trong memory
- Reload page sẽ mất logs
- Export logs trước khi reload: `exportLogs()`

## Kết luận
Hệ thống logging mới giúp:
- Debug dễ dàng hơn với structured logs
- Monitor performance và errors
- Có control tốt hơn về log levels
- Cải thiện development experience

Tất cả services đã được cập nhật để sử dụng hệ thống logging tập trung này.
