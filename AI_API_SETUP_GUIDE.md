# Hướng dẫn cấu hình AI API cho SmartRead

## 🚀 Tích hợp ChatGPT và Gemini

SmartRead đã được tích hợp với AI để tạo câu hỏi thông minh từ nội dung bài viết.

## 📋 Cấu hình API Keys

### 1. Tạo file .env trong thư mục gốc
```bash
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Gemini API Configuration  
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Lấy API Key

#### OpenAI API Key
1. Truy cập: https://platform.openai.com/api-keys
2. Đăng nhập/đăng ký tài khoản
3. Tạo API key mới
4. Copy và paste vào file .env

#### Gemini API Key
1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập bằng Google account
3. Tạo API key mới
4. Copy và paste vào file .env

## 🔧 Cách hoạt động

### Priority Order
1. **OpenAI GPT-3.5-turbo** (ưu tiên cao nhất)
2. **Gemini Pro** (fallback)
3. **Local generation** (fallback cuối cùng)

### Features
- ✅ Tạo câu hỏi 5W1H thông minh
- ✅ Tạo câu hỏi MCQ với distractors
- ✅ Phân tích nội dung tiếng Việt
- ✅ Fallback tự động khi API lỗi
- ✅ Caching và error handling

## 💡 Lưu ý

### API Costs
- **OpenAI**: ~$0.002 per 1K tokens
- **Gemini**: Miễn phí với giới hạn
- **Local**: Miễn phí hoàn toàn

### Performance
- **AI Generation**: 2-5 giây
- **Local Generation**: <1 giây
- **Fallback**: Tự động khi cần

### Security
- API keys được lưu trong .env (không commit vào git)
- Không lưu trữ nội dung bài viết trên server
- Chỉ gửi nội dung đến API khi cần thiết

## 🛠️ Troubleshooting

### Lỗi thường gặp

#### 1. API Key không hợp lệ
```
Error: OpenAI API error: 401
```
**Giải pháp**: Kiểm tra lại API key trong file .env

#### 2. Quota exceeded
```
Error: OpenAI API error: 429
```
**Giải pháp**: Đợi hoặc nâng cấp plan

#### 3. Network error
```
Error: Failed to fetch
```
**Giải pháp**: Kiểm tra kết nối internet

### Debug Mode
Mở Developer Console để xem logs:
```javascript
// Xem quá trình tạo câu hỏi
console.log('Starting question generation...');
console.log('Using AI-generated questions:', questions.length);
console.log('Falling back to local question generation...');
```

## 📊 So sánh chất lượng

| Method | Quality | Speed | Cost | Vietnamese Support |
|--------|---------|-------|------|-------------------|
| OpenAI | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Gemini | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Local | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## 🎯 Kết quả mong đợi

Với AI integration, SmartRead sẽ tạo ra:
- ✅ Câu hỏi chất lượng cao hơn
- ✅ Phân tích nội dung sâu hơn
- ✅ Câu hỏi phù hợp với ngữ cảnh
- ✅ Distractors thông minh hơn
- ✅ Giải thích chi tiết hơn

## 🔄 Cập nhật

Để cập nhật API keys:
1. Sửa file .env
2. Restart development server
3. Test lại chức năng tạo câu hỏi

```bash
npm run dev
```
