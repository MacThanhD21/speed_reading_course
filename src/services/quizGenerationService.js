import geminiService from './geminiService';

class QuizGenerationService {
  constructor() {
    this.geminiService = geminiService;
  }

  // Tạo quiz 10-20 câu để kiểm tra kiến thức
  async generateQuizQuestions(content) {
    try {
      console.log('Generating quiz questions for knowledge test...');
      
      const prompt = this.createQuizPrompt(content);
      const response = await this.geminiService.generateContent(prompt, {
        temperature: 0.6,
        maxOutputTokens: 3000
      });
      
      const questions = this.parseQuizResponse(response);
      console.log('Generated quiz questions:', questions);
      
      return questions;
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      // Fallback to local generation
      return this.generateLocalQuizQuestions(content);
    }
  }

  // Tạo prompt cho quiz questions
  createQuizPrompt(content) {
    const title = content.title || 'Bài viết';
    const textContent = content.content || content;
    
    return `Bạn là một giáo viên chuyên nghiệp. Hãy tạo một bài quiz kiểm tra kiến thức dựa trên nội dung sau:

**Tiêu đề:** ${title}

**Nội dung:**
${textContent}

**Yêu cầu:**
1. Tạo 15-20 câu hỏi trắc nghiệm để kiểm tra kiến thức toàn bài
2. Mỗi câu hỏi có 4 lựa chọn (A, B, C, D)
3. Chỉ có 1 đáp án đúng duy nhất
4. Câu hỏi phải bao quát toàn bộ nội dung bài viết
5. Độ khó từ dễ đến khó, phù hợp với trình độ học sinh
6. Trả về dưới dạng JSON array với format:
[
  {
    "question": "Câu hỏi cụ thể",
    "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
    "correctAnswer": 0,
    "explanation": "Giải thích tại sao đáp án này đúng",
    "difficulty": "easy|medium|hard"
  }
]

**Lưu ý:** 
- correctAnswer là index của đáp án đúng (0, 1, 2, hoặc 3)
- Chỉ trả về JSON array, không có text thêm
- Đảm bảo các lựa chọn sai có tính hợp lý nhưng không đúng`;
  }

  // Parse response từ API
  parseQuizResponse(response) {
    try {
      // Tìm JSON trong response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        return questions.filter(q => 
          q.question && 
          q.options && 
          q.options.length === 4 && 
          typeof q.correctAnswer === 'number' &&
          q.correctAnswer >= 0 && 
          q.correctAnswer <= 3
        );
      }
      
      // Fallback parsing nếu không có JSON
      return this.parseTextResponse(response);
    } catch (error) {
      console.error('Error parsing quiz response:', error);
      return [];
    }
  }

  // Parse text response (fallback)
  parseTextResponse(response) {
    const questions = [];
    const lines = response.split('\n').filter(line => line.trim());
    
    let currentQuestion = null;
    let currentOptions = [];
    let currentCorrectAnswer = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect question
      if (line.match(/^\d+\./) && line.includes('?')) {
        if (currentQuestion) {
          questions.push({
            question: currentQuestion,
            options: currentOptions,
            correctAnswer: currentCorrectAnswer || 0,
            explanation: 'Đáp án này được chọn dựa trên nội dung bài viết',
            difficulty: 'medium'
          });
        }
        
        currentQuestion = line.replace(/^\d+\.\s*/, '').trim();
        currentOptions = [];
        currentCorrectAnswer = null;
      }
      // Detect options
      else if (line.match(/^[A-D]\./)) {
        const option = line.replace(/^[A-D]\.\s*/, '').trim();
        currentOptions.push(option);
      }
      // Detect correct answer
      else if (line.toLowerCase().includes('đáp án') || line.toLowerCase().includes('correct')) {
        const match = line.match(/[A-D]/);
        if (match) {
          currentCorrectAnswer = match[0].charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        }
      }
    }
    
    // Add last question
    if (currentQuestion && currentOptions.length === 4) {
      questions.push({
        question: currentQuestion,
        options: currentOptions,
        correctAnswer: currentCorrectAnswer || 0,
        explanation: 'Đáp án này được chọn dựa trên nội dung bài viết',
        difficulty: 'medium'
      });
    }
    
    return questions.slice(0, 20); // Giới hạn 20 câu hỏi
  }

  // Fallback: Generate local quiz questions
  generateLocalQuizQuestions(content) {
    const textContent = content.content || content;
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 30);
    
    const questions = [];
    
    // Generate questions from key sentences
    sentences.slice(0, 15).forEach((sentence, index) => {
      const question = this.generateQuestionFromSentence(sentence, index);
      if (question) {
        questions.push(question);
      }
    });
    
    return questions;
  }

  // Generate question from sentence
  generateQuestionFromSentence(sentence, index) {
    const words = sentence.trim().split(' ');
    if (words.length < 8) return null;
    
    // Extract key concept
    const keyWords = words.filter(word => 
      word.length > 4 && 
      !['của', 'và', 'trong', 'với', 'cho', 'được', 'là', 'có', 'đã', 'sẽ'].includes(word.toLowerCase())
    );
    
    if (keyWords.length === 0) return null;
    
    const keyWord = keyWords[0];
    const question = `Từ "${keyWord}" trong đoạn văn có ý nghĩa gì?`;
    
    return {
      question: question,
      options: [
        `Ý nghĩa chính của từ "${keyWord}"`,
        `Định nghĩa khác của "${keyWord}"`,
        `Từ đồng nghĩa với "${keyWord}"`,
        `Từ trái nghĩa với "${keyWord}"`
      ],
      correctAnswer: 0,
      explanation: `Từ "${keyWord}" được sử dụng với ý nghĩa chính trong ngữ cảnh này`,
      difficulty: index < 5 ? 'easy' : index < 10 ? 'medium' : 'hard'
    };
  }
}

// Export singleton instance
export const quizGenerationService = new QuizGenerationService();
export default quizGenerationService;
