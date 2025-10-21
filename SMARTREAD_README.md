# SmartRead - Tính năng đo tốc độ đọc thông minh

## Tổng quan
SmartRead là một tính năng được tích hợp vào website speed reading, cho phép người dùng đo tốc độ đọc thực tế và kiểm tra khả năng hiểu biết thông qua các câu hỏi tự động.

## Tính năng chính

### 1. Đo tốc độ đọc (WPM)
- **Thuật toán scroll-based**: Sử dụng vị trí scroll để tính toán số từ đã đọc
- **WPM real-time**: Hiển thị tốc độ đọc trực tiếp với smoothing algorithm
- **Phát hiện fake speed**: Cảnh báo khi tốc độ cao nhưng hiểu biết thấp

### 2. Sinh câu hỏi tự động
- **5W1H questions**: Who, What, Where, When, Why, How
- **Multiple Choice Questions (MCQ)**: Câu hỏi trắc nghiệm với 4 lựa chọn
- **Short answer questions**: Câu hỏi tự luận ngắn

### 3. Chấm điểm thông minh
- **MCQ scoring**: Chấm điểm tự động cho câu hỏi trắc nghiệm
- **Semantic similarity**: Sử dụng embedding để đánh giá câu trả lời tự luận
- **Consistency check**: Kiểm tra tính nhất quán giữa tốc độ đọc và hiểu biết

## Cách sử dụng

### Bước 1: Truy cập SmartRead
- Nhấn nút "SmartRead" trên header của website
- Hoặc truy cập trực tiếp `/smartread`

### Bước 2: Nhập nội dung
- **Dán văn bản**: Copy và paste nội dung bài đọc
- **Nhập URL**: Nhập link bài viết để tự động trích xuất nội dung
- **Tải file**: Upload file văn bản (sẽ được phát triển)

### Bước 3: Đọc và đo tốc độ
- Nhấn "Bắt đầu đọc" để bắt đầu phiên đọc
- Theo dõi WPM real-time trên thanh điều khiển
- Có thể tạm dừng/tiếp tục trong quá trình đọc
- Nhấn "Hoàn thành" khi đọc xong

### Bước 4: Làm bài kiểm tra
- Hệ thống tự động sinh câu hỏi dựa trên nội dung
- Trả lời các câu hỏi 5W1H và MCQ
- Hệ thống chấm điểm tự động

### Bước 5: Xem kết quả
- WPM cuối cùng và trung bình
- Điểm số hiểu biết (%)
- Phân tích chi tiết và khuyến nghị
- Cảnh báo nếu phát hiện fake speed

## Công nghệ sử dụng

### Frontend
- **React 18**: Component-based architecture
- **React Router**: Navigation và routing
- **Framer Motion**: Animations và transitions
- **Tailwind CSS**: Styling và responsive design
- **React Icons**: Icon library

### Thuật toán đo WPM
```javascript
// Exponential moving average for smooth WPM
const alpha = 0.25;
const newSmoothedWPM = alpha * instantWPM + (1 - alpha) * lastSmoothedWPM;

// Scroll-based word counting
const scrollProgress = scrollTop / (document.body.scrollHeight - viewportHeight);
const wordsRead = Math.floor(totalWords * scrollProgress);
```

### Phát hiện fake speed
```javascript
// Consistency check
const isConsistent = !(finalWPM > 450 && comprehensionScore < 60);

// Regression detection
if (wordsReadIncrease > threshold && timeElapsed < 1s) {
  // Flag as possible cheating
}
```

## Cấu trúc thư mục

```
src/components/smartread/
├── SmartRead.jsx          # Main component với state management
├── SmartReadHome.jsx      # Trang chủ SmartRead
├── PasteText.jsx          # Nhập nội dung (text/URL)
├── ReadingMode.jsx        # Chế độ đọc với WPM tracking
├── Quiz.jsx               # Bài kiểm tra hiểu biết
└── Results.jsx            # Hiển thị kết quả
```

## API Integration (Tương lai)

### Question Generation
```javascript
// POST /api/generate-questions
{
  "content": "text content",
  "wordCount": 1000,
  "language": "vi"
}

// Response
{
  "5W1H": [...],
  "MCQ": [...],
  "shortAnswer": [...]
}
```

### Scoring Service
```javascript
// POST /api/score-answer
{
  "question": "question text",
  "userAnswer": "user's answer",
  "correctAnswer": "correct answer"
}

// Response
{
  "score": 0.85,
  "similarity": 0.92,
  "feedback": "Good answer"
}
```

## Tính năng sắp tới

### Phase 2
- [ ] URL content extraction với Readability API
- [ ] File upload support (PDF, DOCX, TXT)
- [ ] Advanced question generation với AI
- [ ] User history và progress tracking
- [ ] Export results to PDF/CSV

### Phase 3
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Social features (leaderboard, sharing)
- [ ] Mobile app với React Native
- [ ] Integration với LMS systems

## Performance Optimization

### Virtual Scrolling
- Sử dụng react-window cho văn bản dài (>10k từ)
- Lazy loading cho components
- Memoization cho expensive calculations

### Caching Strategy
- Cache generated questions
- Local storage cho user preferences
- Service worker cho offline support

## Security & Privacy

### Data Protection
- Không lưu trữ nội dung văn bản mặc định
- Encryption cho sensitive data
- GDPR compliance

### Rate Limiting
- Giới hạn số lần generate questions
- Throttle API calls
- Input validation và sanitization

## Testing

### Unit Tests
```bash
npm test -- --coverage
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Docker
```bash
docker build -t smartread .
docker run -p 3000:3000 smartread
```

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License
MIT License - Xem file LICENSE để biết thêm chi tiết.
