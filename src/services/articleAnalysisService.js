// Service for analyzing articles and generating learning content using Gemini AI
import geminiService from './geminiService';

class ArticleAnalysisService {
  constructor() {
    this.basePrompt = `Bạn là một chuyên gia sư phạm và chuyên gia chủ đề (subject-matter expert). 
Nhiệm vụ: Từ tiêu đề và (nếu có) nội dung bài viết, hãy tạo một phản hồi JSON có cấu trúc rõ ràng, gồm các phần sau:

1) concepts: Danh sách tất cả KHÁI NIỆM CHUYÊN NGÀNH xuất hiện trong tiêu đề/nội dung. 
   - Mỗi mục: { "term": "...", "definition": "... (dễ hiểu, 1-2 câu)", "example": "... (ví dụ ngắn)" }.

2) difficult_terms: Từ ngữ khó / thuật ngữ chuyên ngành (không trùng với concepts). 
   - Mỗi mục: { "term": "...", "explain": "... (giải thích đơn giản)", "tip": "... (mẹo nhớ hoặc liên hệ)" }.

3) fiveWoneH: 6 câu hỏi dạng 5W1H phù hợp với tiêu đề (Who, What, Where, When, Why, How). 
   - Mỗi mục: { "type": "Who/What/Where/When/Why/How", "question": "... (câu hỏi ngắn, rõ ràng, hướng người đọc tìm ý chính)" }.

4) mcq: Tạo 4 câu hỏi trắc nghiệm (Multiple Choice) kiểm tra những ý chính của bài.
   - Mỗi câu: 
     {
       "id": 1,
       "question": "....",
       "options": ["A ...", "B ...", "C ...", "D ..."],
       "correct_index": 0,            // 0-based index cho đáp án đúng
       "explanation": "Giải thích ngắn tại sao đáp án đó đúng (1-2 câu)"
     }

5) short_prompts: 3 câu hỏi tự luận / tóm tắt (mỗi câu yêu cầu 1–3 câu trả lời ngắn).

6) reading_tips: 3–5 gợi ý Hand-Pacing / Chunking / Skim/Scan cụ thể áp dụng cho bài này (cách đọc nhanh phù hợp với nội dung).

Yêu cầu xuất ra CHỈ duy nhất 1 JSON hợp lệ, không kèm lời giới thiệu khác. 
Ví dụ mẫu format JSON trả về:

{
 "concepts": [ { "term": "...", "definition": "...", "example": "..." } ],
 "difficult_terms": [ { "term":"...", "explain":"...", "tip":"..." } ],
 "fiveWoneH": [ { "type":"Who", "question":"..." }, ... ],
 "mcq": [ { "id":1, "question":"...", "options":[...], "correct_index":0, "explanation":"..." }, ... ],
 "short_prompts": [ "Viết tóm tắt 2 câu về ...", ... ],
 "reading_tips": [ "..." ]
}

Tiêu chí chất lượng:
- Ngắn gọn, dễ hiểu (dành cho sinh viên đại học và người đi làm).
- Mỗi phần không vượt quá 6 item (trừ concepts có thể nhiều hơn nếu cần).
- Nếu không đủ thông tin từ tiêu đề, hãy dựa vào nội dung (text). Nếu text trống, tạo câu hỏi và khái niệm dựa trên tiêu đề một cách hợp lý.`;
  }

  // Analyze article and generate learning content
  async analyzeArticle(title, text) {
    if (!geminiService.isApiKeyAvailable()) {
      console.warn('Gemini API key not found');
      return null;
    }

    try {
      console.log('Analyzing article:', title);
      console.log('Text length:', text?.length || 0);

      const fullPrompt = `${this.basePrompt}

Tiêu đề: "${title}"
Nội dung: """${text || ''}"""`;

      const response = await geminiService.generateContent(fullPrompt);
      console.log('Raw response:', response);

      // Parse JSON from response
      const analysisData = this.parseAnalysisResponse(response);
      console.log('Parsed analysis:', analysisData);

      return analysisData;
    } catch (error) {
      console.error('Error analyzing article:', error);
      return null;
    }
  }

  // Parse AI response to extract JSON
  parseAnalysisResponse(content) {
    try {
      // Clean markdown first
      const cleanedContent = geminiService.cleanMarkdown(content);
      
      // Try to extract JSON from the response
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        // Validate structure
        if (this.validateAnalysisStructure(parsed)) {
          return parsed;
        }
      }
      
      // Fallback: return default structure
      return this.getDefaultAnalysisStructure();
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      return this.getDefaultAnalysisStructure();
    }
  }

  // Validate the structure of analysis data
  validateAnalysisStructure(data) {
    const requiredFields = ['concepts', 'difficult_terms', 'fiveWoneH', 'mcq', 'short_prompts', 'reading_tips'];
    
    for (const field of requiredFields) {
      if (!data[field] || !Array.isArray(data[field])) {
        console.warn(`Missing or invalid field: ${field}`);
        return false;
      }
    }

    // Validate MCQ structure
    if (data.mcq && data.mcq.length > 0) {
      for (const question of data.mcq) {
        if (!question.id || !question.question || !question.options || 
            typeof question.correct_index !== 'number' || !question.explanation) {
          console.warn('Invalid MCQ structure:', question);
          return false;
        }
      }
    }

    return true;
  }

  // Get default analysis structure when parsing fails
  getDefaultAnalysisStructure() {
    return {
      concepts: [
        {
          term: "Khái niệm chính",
          definition: "Khái niệm quan trọng trong bài viết",
          example: "Ví dụ minh họa"
        }
      ],
      difficult_terms: [
        {
          term: "Thuật ngữ khó",
          explain: "Giải thích thuật ngữ",
          tip: "Mẹo nhớ"
        }
      ],
      fiveWoneH: [
        { type: "What", question: "Nội dung chính của bài viết là gì?" },
        { type: "Why", question: "Tại sao chủ đề này quan trọng?" },
        { type: "How", question: "Làm thế nào để áp dụng kiến thức này?" }
      ],
      mcq: [
        {
          id: 1,
          question: "Câu hỏi trắc nghiệm mẫu",
          options: ["A. Đáp án A", "B. Đáp án B", "C. Đáp án C", "D. Đáp án D"],
          correct_index: 0,
          explanation: "Giải thích đáp án đúng"
        }
      ],
      short_prompts: [
        "Tóm tắt nội dung chính của bài viết trong 2-3 câu",
        "Nêu những điểm quan trọng nhất bạn học được",
        "Áp dụng kiến thức này như thế nào trong thực tế?"
      ],
      reading_tips: [
        "Đọc lướt tiêu đề và phần kết luận trước",
        "Tập trung vào các từ khóa quan trọng",
        "Ghi chú những điểm chính khi đọc"
      ]
    };
  }

  // Grade student answer for short-answer questions
  async gradeShortAnswer(studentAnswer, referenceAnswer, questionType = 'short_answer') {
    if (!geminiService.isApiKeyAvailable()) {
      console.warn('Gemini API key not found');
      return null;
    }

    try {
      const gradingPrompt = `Bạn là giám khảo giáo dục. 
Cho tôi đánh giá câu trả lời sau so với đáp án mẫu. Trả về JSON:
{
 "score_percent": 0-100,
 "rating": "Excellent/Good/Fair/Poor",
 "feedback": "Ghi nhận ngắn gọn (2-3 câu)",
 "model_answer": "Một đáp án mẫu ngắn gọn"
}

Context: "${referenceAnswer}"   // tóm tắt/đáp án mẫu
Student answer: "${studentAnswer}"
Yêu cầu: đánh giá trung thực, dựa trên nội dung, không dài dòng.`;

      const response = await geminiService.generateContent(gradingPrompt);
      const gradingData = this.parseGradingResponse(response);
      
      return gradingData;
    } catch (error) {
      console.error('Error grading short answer:', error);
      return null;
    }
  }

  // Parse grading response
  parseGradingResponse(content) {
    try {
      const cleanedContent = geminiService.cleanMarkdown(content);
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        // Validate grading structure
        if (parsed.score_percent !== undefined && parsed.rating && parsed.feedback) {
          return parsed;
        }
      }
      
      // Fallback
      return {
        score_percent: 50,
        rating: "Fair",
        feedback: "Câu trả lời cần cải thiện thêm",
        model_answer: "Đáp án mẫu"
      };
    } catch (error) {
      console.error('Error parsing grading response:', error);
      return {
        score_percent: 50,
        rating: "Fair",
        feedback: "Không thể đánh giá câu trả lời",
        model_answer: "Đáp án mẫu"
      };
    }
  }

  // Calculate similarity using simple text comparison (fallback)
  calculateTextSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    
    const normalize = (text) => text.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const normalized1 = normalize(text1);
    const normalized2 = normalize(text2);
    
    if (normalized1 === normalized2) return 1;
    
    // Simple word overlap calculation
    const words1 = normalized1.split(/\s+/);
    const words2 = normalized2.split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }
}

export default new ArticleAnalysisService();
