// API service for question generation using external AI
import geminiService from './geminiService';

class QuestionGenerationService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseURL = 'https://api.openai.com/v1';
  }

  // Generate questions using OpenAI GPT
  async generateQuestionsWithOpenAI(content) {
    if (!this.apiKey) {
      console.warn('OpenAI API key not found, falling back to local generation');
      return null;
    }

    try {
      const prompt = this.createPrompt(content);
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Bạn là một giáo viên chuyên tạo câu hỏi kiểm tra hiểu biết từ bài viết tiếng Việt. Tạo câu hỏi 5W1H và MCQ dựa trên nội dung bài viết.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      return this.parseAIResponse(generatedContent);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return null;
    }
  }

  // Generate questions using Gemini API
  async generateQuestionsWithGemini(content) {
    console.log('Gemini API Key available:', geminiService.isApiKeyAvailable());
    console.log('API Key preview:', geminiService.getApiKeyStatus().preview);
    
    if (!geminiService.isApiKeyAvailable()) {
      console.warn('Gemini API key not found, falling back to local generation');
      return null;
    }

    try {
      console.log('Sending prompt to Gemini API...');
      
      const generatedContent = await geminiService.generateQuestions(content);
      console.log('Generated content:', generatedContent);
      
      const parsedQuestions = this.parseAIResponse(generatedContent);
      console.log('Parsed questions:', parsedQuestions);
      
      return parsedQuestions;
    } catch (error) {
      console.error('Gemini API error:', error);
      return null;
    }
  }

  // Create prompt for AI
  createPrompt(content) {
    const text = content.content || content;
    const title = content.title || 'Bài viết';
    
    console.log('Creating prompt for:', title);
    console.log('Text length:', text.length);
    
    return `Dựa trên bài viết sau, hãy tạo 5 câu hỏi trắc nghiệm với 4 lựa chọn mỗi câu để kiểm tra hiểu biết:

Tiêu đề: ${title}
Nội dung: ${text.substring(0, 3000)}

Yêu cầu:
1. Tạo 5 câu hỏi trắc nghiệm
2. Mỗi câu có 4 lựa chọn (A, B, C, D)
3. Đánh dấu đáp án đúng (0-3)
4. Viết giải thích ngắn gọn cho mỗi câu

Trả về định dạng JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "Câu hỏi...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Giải thích..."
    }
  ]
}`;
  }

  // Parse AI response
  parseAIResponse(content) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        if (parsed.questions && Array.isArray(parsed.questions)) {
          return parsed.questions;
        }
      }
      
      // Fallback: try to parse manually
      return this.parseQuestionsManually(content);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.parseQuestionsManually(content);
    }
  }

  // Manual parsing fallback
  parseQuestionsManually(content) {
    const questions = [];
    const lines = content.split('\n');
    let currentQuestion = null;
    let questionId = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('Câu hỏi') || line.includes('Question')) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        
        currentQuestion = {
          id: questionId++,
          type: 'MCQ',
          category: 'General',
          question: line.replace(/^\d+\.?\s*/, ''),
          options: [],
          correctAnswer: 0,
          explanation: ''
        };
      } else if (line.match(/^[A-D]\.?\s/)) {
        if (currentQuestion) {
          currentQuestion.options.push(line.replace(/^[A-D]\.?\s/, ''));
        }
      } else if (line.includes('Đáp án') || line.includes('Answer')) {
        // Extract correct answer
        const answerMatch = line.match(/[A-D]/);
        if (answerMatch && currentQuestion) {
          currentQuestion.correctAnswer = answerMatch[0].charCodeAt(0) - 65; // A=0, B=1, etc.
        }
      }
    }

    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return questions;
  }

  // Main method to generate questions
  async generateQuestions(content) {
    console.log('Generating questions with AI...');
    
    // Try Gemini API first (since we have it configured)
    console.log('Trying Gemini API...');
    let questions = await this.generateQuestionsWithGemini(content);
    
    // Fallback to local generation if Gemini fails
    if (!questions || questions.length === 0) {
      console.log('Gemini API failed, falling back to local question generation...');
      return null;
    }
    
    console.log('AI generated questions:', questions.length);
    return questions;
  }
}

export default new QuestionGenerationService();
