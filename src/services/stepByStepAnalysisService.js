// Service for step-by-step article analysis using Gemini AI
import geminiService from './geminiService';

class StepByStepAnalysisService {
  constructor() {
    this.conceptsPrompt = `Bạn là một chuyên gia sư phạm. Nhiệm vụ: Từ tiêu đề và nội dung bài viết, tạo phản hồi JSON gồm:

1) concepts: Danh sách KHÁI NIỆM CHUYÊN NGÀNH xuất hiện trong tiêu đề/nội dung.
   - Mỗi mục: { "term": "...", "definition": "... (dễ hiểu, 1-2 câu)", "example": "... (ví dụ ngắn)" }.

2) difficult_terms: Từ ngữ khó / thuật ngữ chuyên ngành (không trùng với concepts).
   - Mỗi mục: { "term": "...", "explain": "... (giải thích đơn giản)", "tip": "... (mẹo nhớ hoặc liên hệ)" }.

3) reading_tips: 3–5 gợi ý về cách đọc nhanh phù hợp với nội dung:
   - Hand-Pacing / Chunking / Skimming / Scanning
   - 5W1H tips (hướng dẫn cách đọc nhanh và tìm ý chính)

4) preview_questions: 2-3 câu hỏi liên quan đến tiêu đề (chưa hiển thị đáp án):
   - Mỗi mục: { "question": "...", "hint": "... (gợi ý để tìm đáp án)" }

Yêu cầu xuất ra CHỈ duy nhất 1 JSON hợp lệ, không kèm lời giới thiệu khác.

Tiêu chí chất lượng:
- Ngắn gọn, dễ hiểu (dành cho sinh viên đại học và người đi làm)
- Mỗi phần không vượt quá 6 item (trừ concepts có thể nhiều hơn nếu cần)
- Nếu không đủ thông tin từ tiêu đề, hãy dựa vào nội dung (text)
- Nếu text trống, tạo câu hỏi và khái niệm dựa trên tiêu đề một cách hợp lý`;

    this.fiveWoneHPrompt = `Bạn là một chuyên gia sư phạm. Nhiệm vụ: Từ tiêu đề và nội dung bài viết, tạo các câu hỏi 5W1H phù hợp với THỰC TẾ nội dung.

QUAN TRỌNG: Chỉ tạo câu hỏi phù hợp với nội dung thực tế. Nếu bài viết không có nhân vật cụ thể, đừng tạo câu hỏi Who. Nếu bài viết không có địa điểm cụ thể, đừng tạo câu hỏi Where.

Tạo phản hồi JSON gồm:
"fiveWoneH": [
  { "type": "What", "question": "Vấn đề chính được đề cập là gì?" },
  { "type": "Why", "question": "Tại sao vấn đề này quan trọng?" },
  { "type": "How", "question": "Làm thế nào để giải quyết vấn đề này?" }
]

🔹 Số lượng câu hỏi không cố định, tùy thuộc vào nội dung thực tế
🔹 Ưu tiên: What, Why, How (luôn phù hợp)
🔹 Chỉ thêm Who nếu có nhân vật cụ thể được nhắc đến
🔹 Chỉ thêm Where nếu có địa điểm cụ thể được nhắc đến  
🔹 Chỉ thêm When nếu có thời gian cụ thể được nhắc đến
🔹 Câu hỏi phải ngắn gọn, rõ ràng, định hướng người đọc tìm ý chính
🔹 Tránh tạo câu hỏi không có câu trả lời rõ ràng trong bài

Yêu cầu xuất ra CHỈ duy nhất 1 JSON hợp lệ, không kèm lời giới thiệu khác.`;

    this.mcqPrompt = `Bạn là một chuyên gia sư phạm. Nhiệm vụ: Từ tiêu đề và nội dung bài viết, tạo các câu hỏi trắc nghiệm kiểm tra ý chính.

Tạo phản hồi JSON gồm:
"mcq": [
  {
    "id": 1,
    "question": "Mục tiêu chính của quy hoạch đô thị thông minh là gì?",
    "options": ["A. Tăng dân số", "B. Tối ưu sử dụng đất", "C. Giảm thuế", "D. Xây sân bay"],
    "correct_index": 1,
    "explanation": "Quy hoạch hướng tới sử dụng đất hiệu quả."
  }
]

🔹 Không cố định số lượng câu hỏi (nên có từ 3 trở lên, tùy độ dài nội dung)
🔹 Mỗi câu cần có giải thích ngắn (1–2 câu) cho đáp án đúng
🔹 Câu hỏi phải kiểm tra hiểu biết về ý chính của bài

Yêu cầu xuất ra CHỈ duy nhất 1 JSON hợp lệ, không kèm lời giới thiệu khác.`;

    this.shortPromptsPrompt = `Bạn là một chuyên gia sư phạm. Nhiệm vụ: Từ tiêu đề và nội dung bài viết, tạo các câu hỏi tự luận hoặc tóm tắt.

Tạo phản hồi JSON gồm:
"short_prompts": [
  "Tóm tắt nội dung chính của bài trong 2–3 câu.",
  "Theo bạn, yếu tố quan trọng nhất trong bài này là gì và vì sao?",
  "Áp dụng kiến thức này như thế nào trong thực tế?"
]

🔹 Gồm 1–5 câu hỏi ngắn
🔹 Giúp người học rèn kỹ năng diễn đạt và nắm ý chính
🔹 Câu hỏi phải phù hợp với nội dung bài viết

Yêu cầu xuất ra CHỈ duy nhất 1 JSON hợp lệ, không kèm lời giới thiệu khác.`;
  }

  // 1️⃣ API Concepts - Gọi khi mở Panel học tập
  async getConcepts(title, text) {
    if (!geminiService.isApiKeyAvailable()) {
      console.warn('Gemini API key not found');
      return this.getDefaultConcepts();
    }

    try {
      console.log('Getting concepts for:', title);
      
      const fullPrompt = `${this.conceptsPrompt}

Tiêu đề: "${title}"
Nội dung: """${text || ''}"""`;

      const response = await geminiService.generateContent(fullPrompt);
      const conceptsData = this.parseConceptsResponse(response);
      
      return conceptsData;
    } catch (error) {
      console.error('Error getting concepts:', error);
      return this.getDefaultConcepts();
    }
  }

  // 2️⃣ API FiveWOneH - Gọi sau khi hoàn thành đọc
  async getFiveWOneH(title, text) {
    if (!geminiService.isApiKeyAvailable()) {
      console.warn('Gemini API key not found');
      return this.getDefaultFiveWOneH();
    }

    try {
      console.log('Getting 5W1H for:', title);
      
      const fullPrompt = `${this.fiveWoneHPrompt}

Tiêu đề: "${title}"
Nội dung: """${text || ''}"""`;

      const response = await geminiService.generateContent(fullPrompt);
      const fiveWOneHData = this.parseFiveWOneHResponse(response);
      
      return fiveWOneHData;
    } catch (error) {
      console.error('Error getting 5W1H:', error);
      return this.getDefaultFiveWOneH();
    }
  }

  // 3️⃣ API MCQ - Gọi sau khi hoàn thành Quiz ABCD
  async getMCQ(title, text) {
    if (!geminiService.isApiKeyAvailable()) {
      console.warn('Gemini API key not found');
      return this.getDefaultMCQ();
    }

    try {
      console.log('Getting MCQ for:', title);
      
      const fullPrompt = `${this.mcqPrompt}

Tiêu đề: "${title}"
Nội dung: """${text || ''}"""`;

      const response = await geminiService.generateContent(fullPrompt);
      const mcqData = this.parseMCQResponse(response);
      
      return mcqData;
    } catch (error) {
      console.error('Error getting MCQ:', error);
      return this.getDefaultMCQ();
    }
  }

  // 4️⃣ API Short Prompts - Gọi sau khi làm xong quiz
  async getShortPrompts(title, text) {
    if (!geminiService.isApiKeyAvailable()) {
      console.warn('Gemini API key not found');
      return this.getDefaultShortPrompts();
    }

    try {
      console.log('Getting short prompts for:', title);
      
      const fullPrompt = `${this.shortPromptsPrompt}

Tiêu đề: "${title}"
Nội dung: """${text || ''}"""`;

      const response = await geminiService.generateContent(fullPrompt);
      const shortPromptsData = this.parseShortPromptsResponse(response);
      
      return shortPromptsData;
    } catch (error) {
      console.error('Error getting short prompts:', error);
      return this.getDefaultShortPrompts();
    }
  }

  // Parse responses
  parseConceptsResponse(content) {
    try {
      const cleanedContent = geminiService.cleanMarkdown(content);
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        if (parsed.concepts && parsed.difficult_terms && parsed.reading_tips) {
          return parsed;
        }
      }
      
      return this.getDefaultConcepts();
    } catch (error) {
      console.error('Error parsing concepts response:', error);
      return this.getDefaultConcepts();
    }
  }

  parseFiveWOneHResponse(content) {
    try {
      const cleanedContent = geminiService.cleanMarkdown(content);
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        if (parsed.fiveWoneH && Array.isArray(parsed.fiveWoneH)) {
          return parsed;
        }
      }
      
      return this.getDefaultFiveWOneH();
    } catch (error) {
      console.error('Error parsing 5W1H response:', error);
      return this.getDefaultFiveWOneH();
    }
  }

  parseMCQResponse(content) {
    try {
      const cleanedContent = geminiService.cleanMarkdown(content);
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        if (parsed.mcq && Array.isArray(parsed.mcq)) {
          return parsed;
        }
      }
      
      return this.getDefaultMCQ();
    } catch (error) {
      console.error('Error parsing MCQ response:', error);
      return this.getDefaultMCQ();
    }
  }

  parseShortPromptsResponse(content) {
    try {
      const cleanedContent = geminiService.cleanMarkdown(content);
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        if (parsed.short_prompts && Array.isArray(parsed.short_prompts)) {
          return parsed;
        }
      }
      
      return this.getDefaultShortPrompts();
    } catch (error) {
      console.error('Error parsing short prompts response:', error);
      return this.getDefaultShortPrompts();
    }
  }

  // Default fallback data
  getDefaultConcepts() {
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
      reading_tips: [
        "Đọc lướt tiêu đề và phần kết luận trước",
        "Tập trung vào các từ khóa quan trọng",
        "Ghi chú những điểm chính khi đọc"
      ],
      preview_questions: [
        {
          question: "Nội dung chính của bài viết là gì?",
          hint: "Tìm hiểu mục đích và ý nghĩa của bài viết"
        }
      ]
    };
  }

  getDefaultFiveWOneH() {
    return {
      fiveWoneH: [
        { type: "What", question: "Nội dung chính của bài viết là gì?" },
        { type: "Why", question: "Tại sao chủ đề này quan trọng?" },
        { type: "How", question: "Làm thế nào để áp dụng kiến thức này?" }
      ]
    };
  }

  getDefaultMCQ() {
    return {
      mcq: [
        {
          id: 1,
          question: "Câu hỏi trắc nghiệm mẫu",
          options: ["A. Đáp án A", "B. Đáp án B", "C. Đáp án C", "D. Đáp án D"],
          correct_index: 0,
          explanation: "Giải thích đáp án đúng"
        }
      ]
    };
  }

  getDefaultShortPrompts() {
    return {
      short_prompts: [
        "Tóm tắt nội dung chính của bài viết trong 2-3 câu",
        "Nêu những điểm quan trọng nhất bạn học được",
        "Áp dụng kiến thức này như thế nào trong thực tế?"
      ]
    };
  }

  // Grade student answer for short-answer questions
  async gradeShortAnswer(studentAnswer, referenceAnswer) {
    if (!geminiService.isApiKeyAvailable()) {
      console.warn('Gemini API key not found');
      return this.getDefaultGrading();
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

Context: "${referenceAnswer}"
Student answer: "${studentAnswer}"
Yêu cầu: đánh giá trung thực, dựa trên nội dung, không dài dòng.`;

      const response = await geminiService.generateContent(gradingPrompt);
      const gradingData = this.parseGradingResponse(response);
      
      return gradingData;
    } catch (error) {
      console.error('Error grading short answer:', error);
      return this.getDefaultGrading();
    }
  }

  parseGradingResponse(content) {
    try {
      const cleanedContent = geminiService.cleanMarkdown(content);
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        if (parsed.score_percent !== undefined && parsed.rating && parsed.feedback) {
          return parsed;
        }
      }
      
      return this.getDefaultGrading();
    } catch (error) {
      console.error('Error parsing grading response:', error);
      return this.getDefaultGrading();
    }
  }

  getDefaultGrading() {
    return {
      score_percent: 50,
      rating: "Fair",
      feedback: "Câu trả lời cần cải thiện thêm",
      model_answer: "Đáp án mẫu"
    };
  }
}

export default new StepByStepAnalysisService();
