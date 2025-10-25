// Gemini API Service - Centralized service for all Gemini API calls
import { getApiKeyManager } from './apiKeyManager.js';
import logger from '../utils/logger.js';

class GeminiService {
  constructor() {
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    this.apiKeyManager = getApiKeyManager();
    this.requestQueue = [];
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // 1 second between requests
  }

  // Rate limiting helper - chỉ áp dụng cho cùng một key
  async waitForRateLimit(keyId) {
    const now = Date.now();
    const keyStat = this.apiKeyManager.keyStats.find(stat => stat.id === keyId);
    
    if (keyStat && keyStat.lastUsed > 0) {
      const timeSinceLastUse = now - keyStat.lastUsed;
      const cooldownPeriod = 1000; // 1 giây giữa các requests cho cùng key
      
      if (timeSinceLastUse < cooldownPeriod) {
        const waitTime = cooldownPeriod - timeSinceLastUse;
        logger.debug('GEMINI_SERVICE', `Rate limiting key ${keyId}: waiting ${waitTime}ms`, {
          keyId,
          waitTime,
          timeSinceLastUse
        });
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // Retry logic with exponential backoff
  async retryRequest(requestFn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        logger.debug('GEMINI_SERVICE', `Attempt ${attempt} failed`, {
          attempt,
          maxRetries,
          error: error.message
        });
        
        if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
          if (attempt < maxRetries) {
            const backoffTime = Math.pow(2, attempt) * 1000; // Exponential backoff
            logger.warn('GEMINI_SERVICE', `Rate limited, retrying in ${backoffTime}ms`, {
              attempt,
              backoffTime,
              maxRetries
            });
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

  // Generic method to call Gemini API with API Key Manager
  async generateContent(prompt, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        // Queue request để tránh spam
        const result = await this.apiKeyManager.queueRequest(async () => {
          return await this.makeApiCall(prompt, options);
        });
        
        resolve(result);
      } catch (error) {
        console.error('Gemini API call failed:', error);
        reject(error);
      }
    });
  }

  // Thực hiện API call với API key được chọn
  async makeApiCall(prompt, options = {}) {
    const maxRetries = 5; // Tăng số lần retry
    const baseDelay = 2000; // Tăng delay cơ bản
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Lấy API key từ manager
        const keyStat = await this.apiKeyManager.getApiKeyWithRetry();
        const apiKey = keyStat.key;
        
        logger.debug('GEMINI_SERVICE', `Making API call with key ${keyStat.id}`, {
          attempt: attempt + 1,
          maxRetries,
          keyId: keyStat.id,
          promptLength: prompt?.length || 0
        });
        
        // Rate limiting
        await this.waitForRateLimit(keyStat.id);
        
        // Prepare request
        const requestBody = {
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
        };

        const response = await fetch(`${this.baseURL}?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        if (!response.ok) {
          const errorText = await response.text();
          logger.error('GEMINI_SERVICE', `API Error (Key ${keyStat.id})`, {
            status: response.status,
            errorText,
            keyId: keyStat.id,
            attempt: attempt + 1
          });
          
          // Cập nhật thống kê key
          this.apiKeyManager.updateKeyStats(keyStat.id, false, `${response.status}: ${errorText}`);
          
          // Nếu là lỗi 429, 503, 500 hoặc quota exceeded, thử key khác
          if (response.status === 429 || response.status === 503 || response.status === 500 || errorText.includes('quota')) {
            logger.warn('GEMINI_SERVICE', `Key ${keyStat.id} failed with status ${response.status}, trying next key`, {
              status: response.status,
              keyId: keyStat.id,
              attempt: attempt + 1
            });
            continue;
          }
          
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        // Cập nhật thống kê thành công
        this.apiKeyManager.updateKeyStats(keyStat.id, true);
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const generatedText = data.candidates[0].content.parts[0].text;
          logger.info('GEMINI_SERVICE', `API call successful with key ${keyStat.id}`, {
            keyId: keyStat.id,
            responseLength: generatedText?.length || 0,
            attempt: attempt + 1
          });
          
          // Clean markdown formatting from the response
          const cleanedContent = this.cleanMarkdown(generatedText);
          return cleanedContent;
        } else {
          logger.error('GEMINI_SERVICE', 'Invalid response format from Gemini API', {
            keyId: keyStat.id,
            responseData: data
          });
          throw new Error('Invalid response format from Gemini API');
        }
        
      } catch (error) {
        logger.error('GEMINI_SERVICE', `Attempt ${attempt + 1} failed`, {
          attempt: attempt + 1,
          maxRetries,
          error: error.message,
          errorType: error.constructor.name
        });
        
        if (attempt === maxRetries - 1) {
          logger.error('GEMINI_SERVICE', `All API keys failed after ${maxRetries} attempts`, {
            maxRetries,
            finalError: error.message
          });
          throw new Error(`All API keys failed after ${maxRetries} attempts: ${error.message}`);
        }
        
        // Exponential backoff với delay dài hơn cho server errors
        let delay;
        if (error.message.includes('503') || error.message.includes('500')) {
          delay = baseDelay * Math.pow(2, attempt); // 2s, 4s, 8s, 16s
          logger.warn('GEMINI_SERVICE', `Server overload detected, waiting ${delay}ms before retry`, {
            delay,
            attempt: attempt + 1,
            error: error.message
          });
        } else {
          delay = 1000 * (attempt + 1); // 1s, 2s, 3s, 4s
          logger.debug('GEMINI_SERVICE', `Retrying in ${delay}ms`, {
            delay,
            attempt: attempt + 1
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
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
  async generateRecommendations(readingData, content) {
    const prompt = this.createRecommendationPrompt(readingData, content);
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
  createRecommendationPrompt(readingData, content) {
    const { finalWPM, wordsRead, elapsedTime, averageWPM } = readingData;
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
    const stats = this.apiKeyManager.getStats();
    return stats.activeKeys > 0;
  }

  // Lấy thống kê API keys
  getApiKeyStats() {
    return this.apiKeyManager.getStats();
  }

  // Reset tất cả API keys
  resetApiKeys() {
    this.apiKeyManager.resetAllKeys();
  }

  // Get API key status (legacy method)
  getApiKeyStatus() {
    const stats = this.apiKeyManager.getStats();
    return {
      available: stats.activeKeys > 0,
      totalKeys: stats.totalKeys,
      activeKeys: stats.activeKeys,
      quotaExceededKeys: stats.quotaExceededKeys,
      totalRequests: stats.totalRequests
    };
  }
}

export default new GeminiService();
