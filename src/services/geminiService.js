// Gemini API Service - Centralized service for all Gemini API calls
class GeminiService {
  constructor() {
    this.apiKey = 'AIzaSyBd6g9ac99blI_CARFWqRciL87-44ObzWQ';
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    this.requestQueue = [];
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // 1 second between requests
  }

  // Rate limiting helper
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  // Retry logic with exponential backoff
  async retryRequest(requestFn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        console.log(`Attempt ${attempt} failed:`, error.message);
        
        if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
          if (attempt < maxRetries) {
            const backoffTime = Math.pow(2, attempt) * 1000; // Exponential backoff
            console.log(`Rate limited, retrying in ${backoffTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            continue;
          }
        }
        
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
  }

  // Generic method to call Gemini API
  async generateContent(prompt, options = {}) {
    if (!this.apiKey) {
      console.warn('Gemini API key not found');
      throw new Error('Gemini API key not found');
    }

    // Wait for rate limiting
    await this.waitForRateLimit();

    // Use retry logic
    return this.retryRequest(async () => {
      console.log('Calling Gemini API...');
      
      const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxOutputTokens || 2000,
            topP: options.topP || 0.8,
            topK: options.topK || 40
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Gemini API response:', data);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }

      const generatedContent = data.candidates[0].content.parts[0].text;
      console.log('Generated content:', generatedContent);
      
      // Clean markdown formatting from the response
      const cleanedContent = this.cleanMarkdown(generatedContent);
      console.log('Cleaned content:', cleanedContent);
      
      return cleanedContent;
    });
  }

  // Method specifically for generating questions
  async generateQuestions(content) {
    const prompt = this.createQuestionPrompt(content);
    return await this.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 2000
    });
  }

  // Method specifically for generating recommendations
  async generateRecommendations(readingData, quizData, content) {
    const prompt = this.createRecommendationPrompt(readingData, quizData, content);
    return await this.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 2000
    });
  }

  // Create question generation prompt
  createQuestionPrompt(content) {
    const text = content.content || content;
    const title = content.title || 'Bài viết';
    
    return `Bạn là một giáo viên chuyên tạo câu hỏi kiểm tra hiểu biết từ bài viết tiếng Việt. Dựa trên bài viết sau, hãy tạo các câu hỏi trắc nghiệm (không giới hạn số câu, tối thiểu 5 câu) có đáp án đúng với 4 lựa chọn mỗi câu để kiểm tra hiểu biết:

Tiêu đề: ${title}
Nội dung: ${text.substring(0, 3000)}

Yêu cầu:
1. Tạo các câu hỏi trắc nghiệm phù hợp với nội dung bài đọc
2. Mỗi câu có 4 lựa chọn (A, B, C, D)
3. Đánh dấu đáp án đúng (0-3)
4. Viết giải thích ngắn gọn cho mỗi câu
5. Trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu

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

  // Create recommendation prompt
  createRecommendationPrompt(readingData, quizData, content) {
    const { finalWPM, wordsRead, elapsedTime, averageWPM } = readingData;
    const { score, correctAnswers, totalQuestions } = quizData;
    const contentText = content?.content || 'Nội dung bài đọc';
    
    return `Bạn là một chuyên gia giáo dục và tâm lý học. Dựa trên kết quả đọc hiểu sau, hãy đưa ra khuyến nghị cải thiện cụ thể và cá nhân hóa:

KẾT QUẢ ĐỌC HIỂU:
- Tốc độ đọc: ${finalWPM} từ/phút
- Điểm hiểu biết: ${score}%
- Số câu đúng: ${correctAnswers}/${totalQuestions}
- Thời gian đọc: ${Math.floor(elapsedTime / 60)} phút ${elapsedTime % 60} giây
- Tốc độ trung bình: ${averageWPM} từ/phút

NỘI DUNG BÀI ĐỌC: ${contentText.substring(0, 1000)}...

Hãy phân tích và đưa ra khuyến nghị theo định dạng JSON sau:

{
  "overview": "Đánh giá tổng quan về kỹ năng đọc của người dùng",
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2", "Điểm mạnh 3"],
  "weaknesses": ["Điểm yếu 1", "Điểm yếu 2", "Điểm yếu 3"],
  "recommendations": ["Khuyến nghị 1", "Khuyến nghị 2", "Khuyến nghị 3"],
  "exercises": ["Bài tập 1", "Bài tập 2", "Bài tập 3"]
}

Yêu cầu:
1. Phân tích dựa trên tốc độ đọc và độ chính xác
2. Đưa ra khuyến nghị cụ thể và có thể thực hiện
3. Bài tập phù hợp với trình độ hiện tại
4. Trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu
5. Tập trung vào cải thiện kỹ năng đọc hiệu quả`;
  }

  // Utility method to clean markdown formatting from AI responses
  cleanMarkdown(text) {
    if (!text) return text;
    
    // Remove common markdown formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*(.*?)\*/g, '$1') // Remove italic *text*
      .replace(/__(.*?)__/g, '$1') // Remove bold __text__
      .replace(/_(.*?)_/g, '$1') // Remove italic _text_
      .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough ~~text~~
      .replace(/`(.*?)`/g, '$1') // Remove inline code `text`
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/#{1,6}\s/g, '') // Remove headers # ## ### etc
      .replace(/^\s*[-*+]\s/gm, '') // Remove list bullets
      .replace(/^\s*\d+\.\s/gm, '') // Remove numbered lists
      .replace(/>\s/g, '') // Remove blockquotes
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .trim();
  }

  // Utility method to parse JSON from AI response
  parseJSONResponse(content) {
    try {
      // Clean markdown first
      const cleanedContent = this.cleanMarkdown(content);
      
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        return JSON.parse(jsonStr);
      }
      return null;
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return null;
    }
  }

  // Check if API key is available
  isApiKeyAvailable() {
    return !!this.apiKey;
  }

  // Get API key status
  getApiKeyStatus() {
    return {
      available: this.isApiKeyAvailable(),
      preview: this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'Not found'
    };
  }
}

export default new GeminiService();
