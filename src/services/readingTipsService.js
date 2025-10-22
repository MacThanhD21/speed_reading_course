import geminiService from './geminiService';

class ReadingTipsService {
  constructor() {
    this.geminiService = geminiService;
  }

  // Tạo câu hỏi 5W1H cho phần học tập
  async generate5W1HQuestions(content) {
    try {
      console.log('Generating 5W1H questions for learning...');
      
      const prompt = this.create5W1HPrompt(content);
      const response = await this.geminiService.generateContent(prompt, {
        temperature: 0.7,
        maxOutputTokens: 1500
      });
      
      const questions = this.parse5W1HResponse(response);
      console.log('Generated 5W1H questions:', questions);
      
      return questions;
    } catch (error) {
      console.error('Error generating 5W1H questions:', error);
      // Fallback to local generation
      return this.generateLocal5W1HQuestions(content);
    }
  }

  // Tạo prompt cho 5W1H questions
  create5W1HPrompt(content) {
    const title = content.title || 'Bài viết';
    const textContent = content.content || content;
    
    return `Bạn là một giáo viên chuyên nghiệp người Việt Nam. Hãy tạo các câu hỏi học tập theo phương pháp 5W1H bằng TIẾNG VIỆT dựa trên nội dung sau:

**Tiêu đề:** ${title}

**Nội dung:**
${textContent}

**Yêu cầu:**
1. Tạo 6-8 câu hỏi học tập theo phương pháp 5W1H bằng TIẾNG VIỆT
2. Mỗi câu hỏi phải liên quan trực tiếp đến nội dung bài viết
3. Câu hỏi phải giúp người đọc hiểu sâu hơn về chủ đề
4. Sử dụng từ ngữ tiếng Việt tự nhiên và dễ hiểu
5. Trả về dưới dạng JSON array với format:
[
  {
    "question": "Câu hỏi bằng tiếng Việt",
    "type": "what|who|when|where|why|how",
    "hint": "Gợi ý ngắn gọn bằng tiếng Việt",
    "learningPoint": "Điểm học tập quan trọng bằng tiếng Việt"
  }
]

**QUAN TRỌNG:** 
- TẤT CẢ câu hỏi, gợi ý và điểm học tập phải bằng TIẾNG VIỆT
- Không sử dụng tiếng Anh trong câu hỏi
- Chỉ trả về JSON array, không có text thêm.`;
  }

  // Parse response từ API
  parse5W1HResponse(response) {
    try {
      // Tìm JSON trong response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        return questions.filter(q => q.question && q.type);
      }
      
      // Fallback parsing
      const lines = response.split('\n').filter(line => line.trim());
      const questions = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('?') && line.length > 10) {
          const type = this.detectQuestionType(line);
          questions.push({
            question: line.replace(/^\d+\.\s*/, '').trim(),
            type: type,
            hint: this.generateHint(type),
            learningPoint: this.generateLearningPoint(line)
          });
        }
      }
      
      return questions.slice(0, 8); // Giới hạn 8 câu hỏi
    } catch (error) {
      console.error('Error parsing 5W1H response:', error);
      return [];
    }
  }

  // Detect loại câu hỏi
  detectQuestionType(question) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('gì') || lowerQuestion.includes('what')) return 'what';
    if (lowerQuestion.includes('ai') || lowerQuestion.includes('who')) return 'who';
    if (lowerQuestion.includes('khi nào') || lowerQuestion.includes('when')) return 'when';
    if (lowerQuestion.includes('ở đâu') || lowerQuestion.includes('where')) return 'where';
    if (lowerQuestion.includes('tại sao') || lowerQuestion.includes('why')) return 'why';
    if (lowerQuestion.includes('như thế nào') || lowerQuestion.includes('how')) return 'how';
    
    return 'what'; // Default
  }

  // Generate hint
  generateHint(type) {
    const hints = {
      what: 'Tìm hiểu về khái niệm, định nghĩa hoặc sự kiện chính',
      who: 'Xác định các nhân vật, tổ chức hoặc đối tượng liên quan',
      when: 'Tìm hiểu về thời gian, giai đoạn hoặc thời điểm quan trọng',
      where: 'Xác định địa điểm, vùng miền hoặc không gian liên quan',
      why: 'Tìm hiểu nguyên nhân, lý do hoặc mục đích',
      how: 'Tìm hiểu về quy trình, phương pháp hoặc cách thức'
    };
    return hints[type] || 'Tìm hiểu sâu hơn về chủ đề này';
  }

  // Generate learning point
  generateLearningPoint(question) {
    return 'Đây là điểm kiến thức quan trọng giúp bạn hiểu sâu hơn về chủ đề';
  }

  // Fallback: Generate local 5W1H questions
  generateLocal5W1HQuestions(content) {
    const textContent = content.content || content;
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    const questions = [];
    const questionTypes = ['what', 'who', 'when', 'where', 'why', 'how'];
    
    // Generate questions based on content
    sentences.slice(0, 6).forEach((sentence, index) => {
      const type = questionTypes[index % questionTypes.length];
      const question = this.generateQuestionFromSentence(sentence, type);
      
      if (question) {
        questions.push({
          question: question,
          type: type,
          hint: this.generateHint(type),
          learningPoint: this.generateLearningPoint(question)
        });
      }
    });
    
    return questions;
  }

  // Generate question from sentence
  generateQuestionFromSentence(sentence, type) {
    const words = sentence.trim().split(' ');
    if (words.length < 5) return null;
    
    const typeQuestions = {
      what: `Nội dung chính của đoạn này là gì?`,
      who: `Ai là đối tượng được đề cập trong đoạn này?`,
      when: `Khi nào sự kiện này xảy ra?`,
      where: `Địa điểm nào được đề cập trong đoạn này?`,
      why: `Tại sao điều này lại quan trọng?`,
      how: `Cách thức này hoạt động như thế nào?`
    };
    
    return typeQuestions[type];
  }

  // Tạo mẹo đọc hiệu quả
  async generateReadingTips(content, readingData = {}) {
    try {
      console.log('Generating reading tips...');
      
      const prompt = this.createReadingTipsPrompt(content, readingData);
      const response = await this.geminiService.generateContent(prompt, {
        temperature: 0.7,
        maxOutputTokens: 1000
      });
      
      const tips = this.parseReadingTipsResponse(response);
      console.log('Generated reading tips:', tips);
      
      return tips;
    } catch (error) {
      console.error('Error generating reading tips:', error);
      // Fallback to local generation
      return this.generateLocalReadingTips(content, readingData);
    }
  }

  // Tạo prompt cho reading tips
  createReadingTipsPrompt(content, readingData) {
    const title = content.title || 'Bài viết';
    const textContent = content.content || content;
    const readingProgress = readingData.progress || 'start';
    const readingSpeed = readingData.speed || 'normal';
    
    return `Bạn là một chuyên gia về kỹ năng đọc hiệu quả người Việt Nam. Hãy tạo các mẹo đọc hiệu quả bằng TIẾNG VIỆT dựa trên nội dung sau:

**Tiêu đề:** ${title}

**Nội dung:**
${textContent}

**Thông tin đọc hiện tại:**
- Tiến độ: ${readingProgress}
- Tốc độ: ${readingSpeed}

**Yêu cầu:**
1. Tạo 3-5 mẹo đọc hiệu quả bằng TIẾNG VIỆT
2. Mỗi mẹo phải phù hợp với nội dung bài viết
3. Mẹo phải giúp người đọc hiểu và ghi nhớ tốt hơn
4. Sử dụng từ ngữ tiếng Việt tự nhiên và dễ hiểu
5. Trả về dưới dạng JSON array với format:
[
  {
    "id": 1,
    "title": "Tiêu đề mẹo bằng tiếng Việt",
    "description": "Mô tả chi tiết mẹo bằng tiếng Việt",
    "icon": "emoji phù hợp"
  }
]

**QUAN TRỌNG:** 
- TẤT CẢ tiêu đề và mô tả phải bằng TIẾNG VIỆT
- Không sử dụng tiếng Anh trong mẹo
- Chỉ trả về JSON array, không có text thêm.`;
  }

  // Parse response từ API cho reading tips
  parseReadingTipsResponse(response) {
    try {
      // Tìm JSON trong response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const tips = JSON.parse(jsonMatch[0]);
        return tips.filter(tip => tip.title && tip.description);
      }
      
      // Fallback parsing
      const lines = response.split('\n').filter(line => line.trim());
      const tips = [];
      let currentTip = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.match(/^\d+\./) || line.includes('Mẹo') || line.includes('Tip')) {
          if (currentTip) {
            tips.push(currentTip);
          }
          currentTip = {
            id: tips.length + 1,
            title: line.replace(/^\d+\.\s*/, '').trim(),
            description: '',
            icon: this.getRandomIcon()
          };
        } else if (currentTip && line.length > 10) {
          currentTip.description = line;
        }
      }
      
      if (currentTip) {
        tips.push(currentTip);
      }
      
      return tips.slice(0, 5); // Giới hạn 5 mẹo
    } catch (error) {
      console.error('Error parsing reading tips response:', error);
      return [];
    }
  }

  // Get random icon for tips
  getRandomIcon() {
    const icons = ['📖', '🎯', '⚡', '🧠', '💡', '🚀', '⭐', '🔍', '📝', '💪'];
    return icons[Math.floor(Math.random() * icons.length)];
  }

  // Fallback: Generate local reading tips
  generateLocalReadingTips(content, readingData) {
    const textContent = content.content || content;
    const wordCount = textContent.split(' ').length;
    const readingProgress = readingData.progress || 'start';
    
    const tips = [
      {
        id: 1,
        title: "Đọc với tốc độ thoải mái",
        description: "Hãy đọc ở tốc độ bạn cảm thấy thoải mái và có thể hiểu nội dung một cách rõ ràng",
        icon: "🐌"
      },
      {
        id: 2,
        title: "Tập trung vào nội dung",
        description: "Loại bỏ các yếu tố gây phân tán và tập trung hoàn toàn vào bài đọc",
        icon: "🎯"
      },
      {
        id: 3,
        title: "Ghi chú những điểm quan trọng",
        description: "Đánh dấu hoặc ghi chú những thông tin quan trọng để dễ dàng ôn tập sau này",
        icon: "📝"
      }
    ];

    // Thêm mẹo dựa trên độ dài nội dung
    if (wordCount > 500) {
      tips.push({
        id: 4,
        title: "Chia nhỏ nội dung",
        description: "Với bài viết dài, hãy chia thành các phần nhỏ để đọc và hiểu từng phần một cách hiệu quả",
        icon: "📚"
      });
    }

    // Thêm mẹo dựa trên tiến độ đọc
    if (readingProgress === 'in_progress') {
      tips.push({
        id: 5,
        title: "Nhấn 'Hoàn thành' khi xong",
        description: "Đánh dấu hoàn thành khi bạn đã đọc và hiểu nội dung để tiếp tục các bước học tập tiếp theo",
        icon: "✅"
      });
    }

    return tips;
  }
}

// Export singleton instance
export const readingTipsService = new ReadingTipsService();
export default readingTipsService;