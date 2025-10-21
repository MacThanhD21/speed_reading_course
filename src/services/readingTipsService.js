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
}

// Export singleton instance
export const readingTipsService = new ReadingTipsService();
export default readingTipsService;