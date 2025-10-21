// Reading Tips Service - Generate personalized reading tips based on content
import geminiService from './geminiService.js';

class ReadingTipsService {
  constructor() {
    this.cache = new Map(); // Cache tips to avoid repeated API calls
  }

  // Generate reading tips based on content and reading progress
  async generateReadingTips(content, readingProgress = {}) {
    const { isReading, currentWPM, wordsRead, elapsedTime } = readingProgress;
    
    // Create cache key based on content and progress
    const cacheKey = this.createCacheKey(content, readingProgress);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log('Returning cached reading tips');
      return this.cache.get(cacheKey);
    }

    try {
      const prompt = this.createReadingTipsPrompt(content, readingProgress);
      const response = await geminiService.generateContent(prompt, {
        temperature: 0.7,
        maxOutputTokens: 1000
      });

      const tips = this.parseTipsResponse(response);
      
      // Cache the result
      this.cache.set(cacheKey, tips);
      
      return tips;
    } catch (error) {
      console.error('Error generating reading tips:', error);
      return this.getFallbackTips(readingProgress);
    }
  }

  // Create prompt for reading tips generation
  createReadingTipsPrompt(content, readingProgress) {
    const { isReading, currentWPM, wordsRead, elapsedTime } = readingProgress;
    const contentText = content?.content || content;
    const title = content?.title || 'Bài viết';
    
    // Determine reading phase
    let phase = 'preparation';
    if (isReading && wordsRead === 0) {
      phase = 'starting';
    } else if (isReading && wordsRead > 0) {
      phase = 'in_progress';
    } else if (!isReading && wordsRead > 0) {
      phase = 'completed';
    }

    return `Bạn là một chuyên gia giáo dục và tâm lý học chuyên về kỹ năng đọc hiệu quả. Dựa trên thông tin sau, hãy tạo ra 3-4 mẹo đọc hiệu quả phù hợp và cá nhân hóa:

THÔNG TIN BÀI ĐỌC:
- Tiêu đề: ${title}
- Nội dung: ${contentText.substring(0, 2000)}...
- Giai đoạn đọc: ${phase}
- Tốc độ hiện tại: ${currentWPM || 0} từ/phút
- Số từ đã đọc: ${wordsRead || 0}
- Thời gian đã đọc: ${elapsedTime || 0} giây

YÊU CẦU:
1. Tạo 3-4 mẹo đọc hiệu quả phù hợp với giai đoạn hiện tại
2. Mẹo phải cụ thể và có thể áp dụng ngay
3. Phù hợp với nội dung bài đọc
4. Ngắn gọn, dễ hiểu (mỗi mẹo 1-2 câu)
5. Khuyến khích và tích cực

Trả về định dạng JSON:
{
  "tips": [
    {
      "id": 1,
      "title": "Tiêu đề mẹo",
      "description": "Mô tả chi tiết mẹo",
      "icon": "emoji_icon"
    }
  ]
}

Lưu ý:
- Sử dụng tiếng Việt
- Mẹo phải phù hợp với giai đoạn đọc hiện tại
- Tập trung vào cải thiện hiệu quả đọc
- Không quá dài, dễ nhớ và áp dụng`;
  }

  // Parse tips response from AI
  parseTipsResponse(response) {
    try {
      const jsonData = geminiService.parseJSONResponse(response);
      if (jsonData && jsonData.tips) {
        return jsonData.tips;
      }
      
      // Fallback parsing if JSON parsing fails
      return this.parseTipsFromText(response);
    } catch (error) {
      console.error('Error parsing tips response:', error);
      return this.getFallbackTips();
    }
  }

  // Fallback parsing from plain text
  parseTipsFromText(text) {
    const tips = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentTip = null;
    let tipCount = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for numbered tips or bullet points
      if (trimmedLine.match(/^\d+[\.\)]\s/) || trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        if (currentTip) {
          tips.push(currentTip);
        }
        
        tipCount++;
        const content = trimmedLine.replace(/^\d+[\.\)]\s/, '').replace(/^[•\-]\s/, '');
        
        currentTip = {
          id: tipCount,
          title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
          description: content,
          icon: this.getRandomIcon()
        };
      } else if (currentTip && trimmedLine) {
        // Add to current tip description
        currentTip.description += ' ' + trimmedLine;
      }
    }
    
    if (currentTip) {
      tips.push(currentTip);
    }
    
    return tips.length > 0 ? tips : this.getFallbackTips();
  }

  // Get fallback tips when API fails
  getFallbackTips(readingProgress = {}) {
    const { isReading, currentWPM, wordsRead } = readingProgress;
    
    if (!isReading) {
      return [
        {
          id: 1,
          title: "Chuẩn bị tâm lý",
          description: "Hãy thư giãn và tập trung trước khi bắt đầu đọc",
          icon: "🧘"
        },
        {
          id: 2,
          title: "Đọc với tốc độ thoải mái",
          description: "Đừng vội vàng, hãy đọc ở tốc độ bạn cảm thấy thoải mái",
          icon: "🐌"
        },
        {
          id: 3,
          title: "Tập trung vào nội dung",
          description: "Loại bỏ các yếu tố gây phân tán và tập trung vào bài đọc",
          icon: "🎯"
        },
        {
          id: 4,
          title: "Nhấn 'Hoàn thành' khi xong",
          description: "Đánh dấu hoàn thành khi bạn đã đọc và hiểu nội dung",
          icon: "✅"
        }
      ];
    }
    
    if (currentWPM < 100) {
      return [
        {
          id: 1,
          title: "Tăng tốc độ từ từ",
          description: "Hãy thử đọc nhanh hơn một chút nhưng vẫn đảm bảo hiểu nội dung",
          icon: "⚡"
        },
        {
          id: 2,
          title: "Sử dụng mắt hiệu quả",
          description: "Di chuyển mắt theo dòng chữ một cách mượt mà",
          icon: "👁️"
        },
        {
          id: 3,
          title: "Đọc theo cụm từ",
          description: "Thay vì đọc từng từ, hãy đọc theo cụm từ có nghĩa",
          icon: "📝"
        }
      ];
    }
    
    return [
      {
        id: 1,
        title: "Duy trì tốc độ",
        description: "Bạn đang đọc ở tốc độ tốt, hãy duy trì nhịp độ này",
        icon: "👍"
      },
      {
        id: 2,
        title: "Kiểm tra hiểu biết",
        description: "Thỉnh thoảng dừng lại để kiểm tra xem bạn có hiểu nội dung không",
        icon: "🤔"
      },
      {
        id: 3,
        title: "Ghi nhớ ý chính",
        description: "Cố gắng ghi nhớ các ý chính của bài viết",
        icon: "🧠"
      }
    ];
  }

  // Get random icon for tips
  getRandomIcon() {
    const icons = ['📚', '🎯', '⚡', '🧠', '👁️', '📝', '✅', '🎉', '💡', '🌟'];
    return icons[Math.floor(Math.random() * icons.length)];
  }

  // Create cache key
  createCacheKey(content, readingProgress) {
    const contentHash = this.hashContent(content);
    const progressHash = this.hashProgress(readingProgress);
    return `${contentHash}_${progressHash}`;
  }

  // Hash content for caching
  hashContent(content) {
    const text = content?.content || content || '';
    return text.substring(0, 100).replace(/\s+/g, '_');
  }

  // Hash progress for caching
  hashProgress(progress) {
    const { isReading, currentWPM, wordsRead } = progress;
    return `${isReading ? 'reading' : 'not_reading'}_${Math.floor(currentWPM / 50) * 50}_${Math.floor(wordsRead / 100) * 100}`;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache size
  getCacheSize() {
    return this.cache.size;
  }
}

export default new ReadingTipsService();
