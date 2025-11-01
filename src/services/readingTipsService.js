import geminiService from './geminiService';
import logger from '../utils/logger.js';

class ReadingTipsService {
  constructor() {
    this.geminiService = geminiService;
  }

  // Tạo câu hỏi 5W1H cho phần học tập
  async generate5W1HQuestions(content) {
    try {
      logger.info('READING_TIPS', 'Generating 5W1H questions for learning', {
        contentLength: content?.content?.length || content?.length || 0,
        hasTitle: !!content?.title,
        title: content?.title,
        contentType: typeof content,
        contentKeys: content ? Object.keys(content) : []
      });
      
      const prompt = this.create5W1HPrompt(content);
      const response = await this.geminiService.generateContent(prompt, {
        temperature: 0.3,
        maxOutputTokens: 1500
      });
      
      if (!response || typeof response !== 'string') {
        logger.warn('READING_TIPS', 'No valid response from Gemini API for 5W1H, using fallback questions');
        return this.generateLocal5W1HQuestions(content);
      }
      
      const questions = this.parse5W1HResponse(response, content);
      logger.info('READING_TIPS', 'Generated 5W1H questions successfully', {
        questionCount: questions?.length || 0,
        questionTypes: questions?.map(q => q.type) || []
      });
      
      return questions;
    } catch (error) {
      logger.error('READING_TIPS', 'Error generating 5W1H questions', {
        error: error.message,
        errorType: error.constructor.name
      });
      
      return this.generateLocal5W1HQuestions(content);
    }
  }

  // Tạo prompt cho 5W1H questions
  create5W1HPrompt(content) {
    const title = content.title || 'Bài viết';
    const textContent = content.content || content;
    
    // Lấy một đoạn ngắn từ nội dung để AI hiểu context
    const contentPreview = typeof textContent === 'string' 
      ? textContent.substring(0, 1000).trim() 
      : '';
    
    return `Bạn là một giáo viên chuyên nghiệp người Việt Nam. Hãy tạo các câu hỏi tự luận đơn giản theo phương pháp 5W1H bằng TIẾNG VIỆT dựa trên TIÊU ĐỀ và NỘI DUNG thực tế của bài viết sau:

**TIÊU ĐỀ:** ${title}

**Nội dung bài viết:**
${contentPreview || textContent}

**YÊU CẦU QUAN TRỌNG:**
1. ĐỌC KỸ NỘI DUNG trước khi tạo câu hỏi. Câu hỏi phải PHÙ HỢP với nội dung thực tế, KHÔNG dùng template chung chung.
2. Tạo 5-7 câu hỏi TRỌNG TÂM dưới dạng tự luận đơn giản theo phương pháp 5W1H bằng TIẾNG VIỆT
3. Câu hỏi phải khai thác thông tin CỤ THỂ từ nội dung bài viết, không phải câu hỏi chung chung
4. Nếu bài viết KHÔNG đề cập đến "thị trường", "kinh doanh", "tài chính" → KHÔNG tạo câu hỏi về thị trường
5. Nếu bài viết KHÔNG có nhân vật cụ thể → KHÔNG tạo câu hỏi "Who"
6. Nếu bài viết KHÔNG có địa điểm cụ thể → KHÔNG tạo câu hỏi "Where"  
7. Nếu bài viết KHÔNG có thời gian cụ thể → KHÔNG tạo câu hỏi "When"
8. MỖI CÂU HỎI PHẢI KHÁC NHAU, KHÔNG TRÙNG LẶP (không có 2 câu hỏi giống nhau)
9. Câu hỏi phải đơn giản, dễ hiểu, không phức tạp
10. Sử dụng từ ngữ tiếng Việt tự nhiên và dễ hiểu
11. Trả về dưới dạng JSON array với format:
[
  {
    "id": 1,
    "question": "Câu hỏi về nội dung thực tế bằng tiếng Việt",
    "type": "what|who|when|where|why|how",
    "expectedLength": "Ngắn|Trung bình|Dài",
    "keyPoints": ["Điểm chính 1 từ nội dung", "Điểm chính 2 từ nội dung", "Điểm chính 3 từ nội dung"]
  }
]

**VÍ DỤ PHÙ HỢP:**
- Nếu bài về sao chổi/thiên văn: "Sao chổi 3I/ATLAS là gì?", "Tại sao sao chổi này lại quan trọng?", "Ai đã nghiên cứu về sao chổi này?"
- Nếu bài về công nghệ: "Công nghệ này hoạt động như thế nào?", "Tại sao công nghệ này quan trọng?"
- Nếu bài về khoa học: "Phát hiện này có ý nghĩa gì?", "Bằng chứng nào được đề cập?"

**VÍ DỤ KHÔNG PHÙ HỢP (KHÔNG DÙNG):**
- "Điều này có ý nghĩa gì đối với thị trường?" (nếu bài KHÔNG nói về thị trường)
- Câu hỏi chung chung không liên quan đến nội dung
- Câu hỏi trùng lặp nhau

**QUAN TRỌNG:** 
- TẤT CẢ câu hỏi, gợi ý và điểm chính phải bằng TIẾNG VIỆT
- Câu hỏi phải NGẮN GỌN, ĐƠN GIẢN, liên quan TRỰC TIẾP đến nội dung
- MỖI CÂU HỎI PHẢI KHÁC NHAU HOÀN TOÀN, KHÔNG TRÙNG LẶP
- Câu hỏi phải khai thác thông tin CỤ THỂ từ nội dung bài viết, không phải template
- KHÔNG yêu cầu suy luận, phân tích sâu hay kiến thức bên ngoài
- Mỗi câu hỏi phải có keyPoints CỤ THỂ từ nội dung để đánh giá câu trả lời
- Chỉ trả về JSON array, không có text thêm.`;
  }

  // Parse response từ API
  parse5W1HResponse(response, content) {
    try {
      logger.debug('READING_TIPS', 'Parsing 5W1H response', {
        responseLength: response?.length || 0,
        responseType: typeof response
      });
      
      if (!response || typeof response !== 'string') {
        logger.warn('READING_TIPS', 'Invalid or missing 5W1H response, using fallback questions');
        return this.generateLocal5W1HQuestions(content);
      }
      
      // Clean response - xử lý markdown đúng cách
      let cleanedResponse = response.trim();
      
      // Remove markdown code blocks - xử lý tất cả các trường hợp
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .replace(/^`json\s*/i, '')  // Thêm case này
        .replace(/^`\s*/i, '')     // Thêm case này
        .replace(/`\s*$/i, '')     // Thêm case này
        .replace(/^json\s*/i, '')
        .replace(/^JSON\s*/i, '')
        .trim();
      
      // Xử lý thêm các trường hợp đặc biệt
      if (cleanedResponse.startsWith('`')) {
        cleanedResponse = cleanedResponse.substring(1);
      }
      if (cleanedResponse.endsWith('`')) {
        cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 1);
      }
      
      logger.debug('READING_TIPS', 'Cleaned response', {
        originalLength: response.length,
        cleanedLength: cleanedResponse.length,
        originalStart: response.substring(0, 50),
        cleanedStart: cleanedResponse.substring(0, 50)
      });
      
      // Try to parse JSON
      let questions = null;
      try {
        questions = JSON.parse(cleanedResponse);
        logger.info('READING_TIPS', 'Direct 5W1H JSON parse successful', {
          questionsCount: questions?.length || 0,
          firstQuestion: questions?.[0],
          firstQuestionKeyPoints: questions?.[0]?.keyPoints
        });
      } catch (e) {
        logger.warn('READING_TIPS', 'Direct 5W1H JSON parse failed, trying extraction...', {
          error: e.message,
          cleanedResponseStart: cleanedResponse.substring(0, 100)
        });
        
        // Extract JSON array
        const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
          let extractedJson = jsonMatch[0];
          
          // Fix JSON issues
          const fixedJson = extractedJson
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/,\s*,/g, ',')
            .replace(/{\s*,/g, '{')
            .replace(/\[\s*,/g, '[')
            .replace(/,\s*}/g, '}')
            .replace(/,\s*\]/g, ']')
            .replace(/}\s*{/g, '},{')
            .replace(/\\"/g, '"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
          
          try {
            questions = JSON.parse(fixedJson);
            logger.debug('READING_TIPS', '5W1H JSON extraction and fix successful');
          } catch (fixError) {
            logger.debug('READING_TIPS', '5W1H JSON fix failed');
          }
        }
      }
      
      // Validate and return questions
      if (questions && Array.isArray(questions) && questions.length > 0) {
        logger.info('READING_TIPS', 'Raw questions from API', {
          totalQuestions: questions.length,
          questions: questions.map(q => ({
            id: q.id,
            type: q.type,
            question: q.question?.substring(0, 50) + '...',
            hasHint: !!q.hint,
            keyPoints: q.keyPoints,
            keyPointsLength: q.keyPoints?.length || 0
          }))
        });
        
        const validQuestions = questions.filter(q => q.question && q.type);
        logger.info('READING_TIPS', `Parsed ${validQuestions.length} valid 5W1H questions`, {
          totalQuestions: questions.length,
          validQuestions: validQuestions.length,
          questionTypes: validQuestions.map(q => q.type),
          firstQuestion: validQuestions[0]?.question,
          firstQuestionKeyPoints: validQuestions[0]?.keyPoints,
          allKeyPoints: validQuestions.map(q => ({ id: q.id, keyPoints: q.keyPoints }))
        });
        return this.normalizeAndSanitizeQuestions(this.validateAndFixQuestions(validQuestions, content?.title, content));
      }
      
      // Fallback parsing
      logger.error('READING_TIPS', 'Using fallback 5W1H parsing - THIS SHOULD NOT HAPPEN WITH VALID API RESPONSE!', {
        responsePreview: response.substring(0, 200) + '...',
        cleanedResponsePreview: cleanedResponse.substring(0, 200) + '...'
      });
      const lines = response.split('\n').filter(line => line.trim());
      const fallbackQuestions = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('?') && line.length > 10) {
          const type = this.detectQuestionType(line);
          fallbackQuestions.push({
            question: line.replace(/^\d+\.\s*/, '').trim(),
            type: type,
            expectedLength: 'Trung bình',
            keyPoints: [],
            learningPoint: this.generateLearningPoint(line)
          });
        }
      }
      
      return this.normalizeAndSanitizeQuestions(this.validateAndFixQuestions(fallbackQuestions.slice(0, 8), content?.title, content));
    } catch (error) {
      logger.error('READING_TIPS', 'Error parsing 5W1H response', {
        error: error.message,
        errorType: error.constructor.name
      });
      return this.generateLocal5W1HQuestions(content);
    }
  }

  // Loại bỏ câu hỏi trùng lặp
  removeDuplicateQuestions(questions) {
    if (!Array.isArray(questions)) return questions;
    
    const uniqueQuestions = [];
    const seenQuestions = new Set();
    
    for (const question of questions) {
      if (!question.question) continue;
      
      const normalizedQuestion = question.question
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!seenQuestions.has(normalizedQuestion)) {
        seenQuestions.add(normalizedQuestion);
        uniqueQuestions.push(question);
      }
    }
    
    logger.info('READING_TIPS', 'Removed duplicate questions', {
      originalCount: questions.length,
      uniqueCount: uniqueQuestions.length,
      removedCount: questions.length - uniqueQuestions.length
    });
    
    return uniqueQuestions;
  }

  // Chuẩn hóa mảng câu hỏi
  normalizeAndSanitizeQuestions(questions) {
    if (!Array.isArray(questions)) return [];
    
    logger.debug('READING_TIPS', 'Starting normalizeAndSanitizeQuestions', {
      inputCount: questions.length,
      inputQuestions: questions.map(q => ({ id: q.id, type: q.type, question: q.question?.substring(0, 30) + '...' }))
    });
    
    // Tạm thời tắt removeDuplicateQuestions để hiển thị tất cả câu hỏi
    // const uniqueQuestions = this.removeDuplicateQuestions(questions);
    
    logger.debug('READING_TIPS', 'Skipping duplicate removal', {
      originalCount: questions.length
    });
    
    const processedQuestions = questions.map((q, idx) => {
      const safe = { ...q };
      safe.id = (q && typeof q.id === 'number') ? q.id : (idx + 1);
      // Tạm thời tắt sanitizeQuestionText để debug
      safe.question = String(q.question || '');
      safe.type = q.type || this.detectQuestionType(safe.question);
      if (!safe.expectedLength) safe.expectedLength = 'Trung bình';
      // Giữ nguyên keyPoints từ API, chỉ đảm bảo là array
      safe.keyPoints = Array.isArray(q.keyPoints) ? q.keyPoints : [];
      // Loại bỏ hint để tiết kiệm băng thông
      delete safe.hint;
      return safe;
    });
    
    logger.debug('READING_TIPS', 'After processing', {
      processedCount: processedQuestions.length,
      processedQuestions: processedQuestions.map(q => ({ 
        id: q.id, 
        type: q.type, 
        question: q.question?.substring(0, 30) + '...',
        keyPoints: q.keyPoints,
        keyPointsLength: q.keyPoints?.length || 0
      }))
    });
    
    // Loại bỏ các câu hỏi rỗng hoặc không hợp lệ
    const validQuestions = processedQuestions.filter(q => {
      const isValid = q.question && q.question.trim().length > 0;
      if (!isValid) {
        logger.warn('READING_TIPS', 'Removing invalid question', {
          id: q.id,
          type: q.type,
          question: q.question,
          questionLength: q.question?.length || 0
        });
      }
      return isValid;
    });
    
    logger.info('READING_TIPS', 'Filtered invalid questions', {
      originalCount: processedQuestions.length,
      validCount: validQuestions.length,
      removedCount: processedQuestions.length - validQuestions.length,
      finalQuestions: validQuestions.map(q => ({ id: q.id, type: q.type, question: q.question?.substring(0, 30) + '...' }))
    });
    
    return validQuestions;
  }

  // Làm sạch chuỗi câu hỏi
  sanitizeQuestionText(text) {
    if (!text) return '';
    let s = String(text).trim();
    
    // Loại bỏ các trường hợp lỗi parsing
    if (s.includes('hint":') || s.includes('hint"')) {
      logger.warn('READING_TIPS', 'Detected malformed question text', {
        originalText: s
      });
      return '';
    }
    
    // Loại bỏ tiền tố kiểu JSON
    s = s.replace(/^"?question"?\s*:\s*/i, '');
    s = s.replace(/^"?hint"?\s*:\s*/i, '');
    s = s.replace(/^['"“”`\s]+/, '').replace(/[,'"“”`\s]+$/,'');
    s = s.replace(/^"/, '').replace(/"$/, '');
    s = s.replace(/\s+/g, ' ').trim();
    
    // Kiểm tra nếu câu hỏi quá ngắn hoặc không hợp lệ
    if (s.length < 3 || s.includes('":') || (s.includes('"') && s.length < 10)) {
      logger.warn('READING_TIPS', 'Question too short or malformed', {
        question: s,
        length: s.length
      });
      return '';
    }
    
    return s;
  }

  // Detect loại câu hỏi
  detectQuestionType(question) {
    const lowerQuestion = question.toLowerCase();
    
    // WHAT - Tìm hiểu về gì, cái gì, điều gì
    if (lowerQuestion.includes('gì') || lowerQuestion.includes('cái gì') || lowerQuestion.includes('điều gì') || lowerQuestion.includes('what')) return 'what';
    
    // WHO - Ai, những ai, người nào
    if (lowerQuestion.includes('ai') || lowerQuestion.includes('những ai') || lowerQuestion.includes('người nào') || lowerQuestion.includes('who')) return 'who';
    
    // WHEN - Khi nào, lúc nào, thời điểm nào
    if (lowerQuestion.includes('khi nào') || lowerQuestion.includes('lúc nào') || lowerQuestion.includes('thời điểm nào') || lowerQuestion.includes('when')) return 'when';
    
    // WHERE - Ở đâu, nơi nào, địa điểm nào
    if (lowerQuestion.includes('ở đâu') || lowerQuestion.includes('nơi nào') || lowerQuestion.includes('địa điểm nào') || lowerQuestion.includes('where')) return 'where';
    
    // WHY - Tại sao, vì sao, lý do gì
    if (lowerQuestion.includes('tại sao') || lowerQuestion.includes('vì sao') || lowerQuestion.includes('lý do gì') || lowerQuestion.includes('why')) return 'why';
    
    // HOW - Như thế nào, cách nào, phương pháp gì
    if (lowerQuestion.includes('như thế nào') || lowerQuestion.includes('cách nào') || lowerQuestion.includes('phương pháp gì') || lowerQuestion.includes('how')) return 'how';
    
    return 'what'; // Default fallback
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
    const title = content?.title || 'Bài viết';
    
    logger.debug('READING_TIPS', 'Generating fallback questions', {
      hasTitle: !!content?.title,
      title: title
    });
    
    return [
        {
          id: 1,
        question: "Tại sao sự kiện này lại quan trọng?",
        type: "why",
        expectedLength: "Trung bình",
        keyPoints: ["Nêu nguyên nhân chính", "Giải thích ý nghĩa", "Liên hệ với thực tế"]
        },
        {
          id: 2,
        question: "Sự kiện này xảy ra khi nào?",
        type: "when",
          expectedLength: "Trung bình",
        keyPoints: ["Xác định thời gian cụ thể", "Giải thích ý nghĩa thời gian", "Nêu bối cảnh"]
        },
        {
          id: 3,
        question: "Những ai liên quan đến sự kiện này?",
        type: "who",
          expectedLength: "Trung bình",
        keyPoints: ["Liệt kê nhân vật/tổ chức liên quan", "Mô tả vai trò", "Nêu tầm quan trọng"]
        },
        {
          id: 4,
        question: "Những địa điểm nào liên quan đến sự kiện này?",
          type: "where",
          expectedLength: "Trung bình",
        keyPoints: ["Liệt kê địa điểm liên quan", "Giải thích tầm quan trọng", "Mô tả đặc điểm"]
        },
        {
          id: 5,
        question: "Cách thức hoạt động được mô tả như thế nào?",
        type: "how",
        expectedLength: "Trung bình",
        keyPoints: ["Mô tả quy trình", "Giải thích từng bước", "Nêu đặc điểm chính"]
        },
        {
          id: 6,
        question: "Điều này có ý nghĩa gì đối với thị trường?",
        type: "what",
        expectedLength: "Trung bình",
        keyPoints: ["Phân tích tác động", "Giải thích ý nghĩa", "Dự đoán xu hướng"]
      }
    ];
  }

  // Validate và sửa câu hỏi
  validateAndFixQuestions(questions, title, content) {
    if (!Array.isArray(questions)) return questions;
    
    logger.debug('READING_TIPS', 'Validating questions', {
      questionCount: questions.length,
      title: title
    });
    
    const contentText = typeof content === 'string' 
      ? content.toLowerCase() 
      : (content?.content || '').toLowerCase();
    
    // Kiểm tra xem nội dung có đề cập đến thị trường không
    const hasMarketContent = contentText.includes('thị trường') || 
                            contentText.includes('kinh doanh') || 
                            contentText.includes('tài chính') ||
                            contentText.includes('đầu tư') ||
                            contentText.includes('chứng khoán');
    
    // Lọc và sửa câu hỏi
    const validatedQuestions = [];
    const seenQuestions = new Set();
    
    for (const question of questions) {
      if (!question.question || typeof question.question !== 'string') continue;
      
      const qText = question.question.toLowerCase().trim();
      
      // 1. Loại bỏ câu hỏi về "thị trường" nếu nội dung không đề cập
      if (!hasMarketContent && (
        qText.includes('thị trường') || 
        qText.includes('ý nghĩa gì đối với thị trường') ||
        qText.includes('tác động đến thị trường')
      )) {
        logger.warn('READING_TIPS', 'Removing market-related question (not in content)', {
          question: question.question,
          hasMarketContent
        });
        continue;
      }
      
      // 2. Loại bỏ câu hỏi trùng lặp
      const normalizedQ = qText
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (seenQuestions.has(normalizedQ)) {
        logger.warn('READING_TIPS', 'Removing duplicate question', {
          question: question.question
        });
        continue;
      }
      seenQuestions.add(normalizedQ);
      
      // 3. Loại bỏ câu hỏi về "văn bản đã dán"
      if (qText.includes('dán') || 
          qText.includes('việc dán') ||
          qText.includes('văn bản được dán') ||
          qText.includes('văn bản đã dán')) {
        logger.warn('READING_TIPS', 'Detected invalid question, skipping...', {
          originalQuestion: question.question
        });
        continue;
      }
      
      validatedQuestions.push(question);
    }
    
    logger.info('READING_TIPS', 'Questions validation complete', {
      originalCount: questions.length,
      validatedCount: validatedQuestions.length,
      removedCount: questions.length - validatedQuestions.length
    });
    
    return validatedQuestions;
  }

  // Tạo câu hỏi từ tiêu đề
  generateQuestionFromTitle(type, title) {
    switch(type) {
      case 'what':
        return "Điều này có ý nghĩa gì đối với thị trường?";
      case 'who':
        return "Những ai liên quan đến sự kiện này?";
      case 'when':
        return "Sự kiện này xảy ra khi nào?";
      case 'where':
        return "Những địa điểm nào liên quan đến sự kiện này?";
      case 'why':
        return "Tại sao sự kiện này lại quan trọng?";
      case 'how':
        return "Cách thức hoạt động được mô tả như thế nào?";
      default:
        return "Điều này có ý nghĩa gì đối với thị trường?";
    }
  }

  // Đánh giá câu trả lời tự luận 5W1H
  async evaluateEssayAnswers(questions, answers, content) {
    try {
      logger.info('READING_TIPS', 'Evaluating essay answers', {
        questionCount: questions.length,
        answerCount: Object.keys(answers).length
      });
      
      const prompt = this.createEvaluationPrompt(questions, answers, content);
      const response = await this.geminiService.generateContent(prompt, {
        temperature: 0.3,
        maxOutputTokens: 4000
      });
      
      const evaluation = this.parseEvaluationResponse(response);
      logger.info('READING_TIPS', 'Generated evaluation successfully', {
        overallScore: evaluation.overallScore,
        totalQuestions: evaluation.totalQuestions
      });
      
      return evaluation;
    } catch (error) {
      logger.error('READING_TIPS', 'Error evaluating essay answers', {
        error: error.message,
        errorType: error.constructor.name
      });
      return this.generateLocalEvaluation(questions, answers);
    }
  }

  // Tạo prompt để đánh giá câu trả lời
  createEvaluationPrompt(questions, answers, content) {
    const title = content.title || 'Bài viết';
    const textContent = content.content || content;
    
    const qaPairs = questions.map((q, index) => {
      const answer = answers[q.id] || 'Không có câu trả lời';
      return `Câu hỏi ${index + 1} (${q.type}): ${q.question}
Câu trả lời: ${answer}
Điểm chính cần có: ${q.keyPoints.join(', ')}`;
    }).join('\n\n');
    
    return `Bạn là một giáo viên chuyên nghiệp người Việt Nam với kinh nghiệm đánh giá bài tập tự luận. Hãy đánh giá câu trả lời tự luận của học sinh dựa trên nội dung bài viết sau:

**Tiêu đề bài viết:** ${title}

**Nội dung bài viết:**
${textContent}

**Câu hỏi và câu trả lời cần đánh giá:**
${qaPairs}

**YÊU CẦU ĐÁNH GIÁ CHI TIẾT:**

1. **Đánh giá độ chính xác:** Kiểm tra từng thông tin trong câu trả lời có đúng với nội dung bài viết không
2. **Đánh giá độ đầy đủ:** Xem học sinh có trả lời đủ các điểm chính cần có không
3. **Đánh giá chất lượng:** Phân tích cách trình bày, logic và sự mạch lạc
4. **Đưa ra dẫn chứng cụ thể:** Trích dẫn chính xác từ bài viết để chứng minh đánh giá
5. **Gợi ý cải thiện:** Đưa ra lời khuyên cụ thể để học sinh cải thiện

**FORMAT JSON CHI TIẾT:**
{
  "overallScore": 8.5,
  "totalQuestions": ${questions.length},
  "evaluations": [
    {
      "questionId": 1,
      "question": "Câu hỏi",
      "answer": "Câu trả lời của học sinh",
      "score": 8,
      "maxScore": 10,
      "feedback": "Nhận xét chi tiết về câu trả lời",
      "evidence": {
        "correctPoints": ["Điểm đúng 1 với dẫn chứng từ bài viết", "Điểm đúng 2 với dẫn chứng từ bài viết"],
        "missingPoints": ["Điểm thiếu 1", "Điểm thiếu 2"],
        "incorrectPoints": ["Điểm sai 1 với giải thích", "Điểm sai 2 với giải thích"],
        "quotes": ["Trích dẫn cụ thể từ bài viết để chứng minh", "Trích dẫn khác từ bài viết"]
      },
      "strengths": ["Điểm mạnh cụ thể với ví dụ", "Điểm mạnh khác với ví dụ"],
      "improvements": ["Cần cải thiện cụ thể với hướng dẫn", "Cần cải thiện khác với hướng dẫn"],
      "accuracy": "Chính xác|Khá chính xác|Cần cải thiện",
      "completeness": "Đầy đủ|Khá đầy đủ|Thiếu sót",
      "quality": "Tốt|Khá|Cần cải thiện"
    }
  ],
  "summary": {
    "overallFeedback": "Nhận xét tổng quan chi tiết về toàn bộ bài làm",
    "strengths": ["Điểm mạnh chung với ví dụ cụ thể"],
    "improvements": ["Cần cải thiện chung với hướng dẫn cụ thể"],
    "recommendations": ["Khuyến nghị học tập cụ thể", "Gợi ý phương pháp học"],
    "nextSteps": ["Bước tiếp theo để cải thiện", "Bài tập bổ sung nên làm"]
  }
}

**HƯỚNG DẪN ĐÁNH GIÁ:**

**Về Evidence (Dẫn chứng):**
- correctPoints: Liệt kê các điểm đúng trong câu trả lời kèm dẫn chứng cụ thể từ bài viết
- missingPoints: Các điểm quan trọng học sinh chưa đề cập đến
- incorrectPoints: Các điểm sai trong câu trả lời với giải thích tại sao sai
- quotes: Trích dẫn chính xác từ bài viết để chứng minh đánh giá

**Về Scoring (Chấm điểm):**
- 9-10: Xuất sắc - Trả lời đầy đủ, chính xác, có dẫn chứng cụ thể
- 7-8: Tốt - Trả lời khá đầy đủ và chính xác, có một số dẫn chứng
- 5-6: Trung bình - Trả lời cơ bản đúng nhưng thiếu chi tiết hoặc có một số sai sót
- 3-4: Yếu - Trả lời không đầy đủ hoặc có nhiều sai sót
- 0-2: Rất yếu - Trả lời sai hoặc không liên quan đến câu hỏi

**QUAN TRỌNG:**
- TẤT CẢ đánh giá phải bằng TIẾNG VIỆT
- Phải có dẫn chứng cụ thể từ bài viết cho mọi đánh giá
- Nhận xét phải chi tiết và hữu ích cho học sinh
- Điểm số phải công bằng và khách quan
- Chỉ trả về JSON object, không có text thêm.`;
  }

  // Parse response đánh giá
  parseEvaluationResponse(response) {
    try {
      let cleanedResponse = response.trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .replace(/^json\s*/i, '')
        .replace(/^JSON\s*/i, '')
        .trim();
      
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.warn('READING_TIPS', 'No JSON found in evaluation response');
        return this.generateLocalEvaluation();
      }
      
      const data = JSON.parse(jsonMatch[0]);
      
      if (!data || typeof data !== 'object') {
        logger.warn('READING_TIPS', 'Invalid evaluation JSON structure');
        return this.generateLocalEvaluation();
      }
      
      return data;
      
    } catch (error) {
      logger.error('READING_TIPS', 'Error parsing evaluation response', {
        error: error.message,
        errorType: error.constructor.name
      });
      return this.generateLocalEvaluation();
    }
  }

  // Fallback: Generate local evaluation
  generateLocalEvaluation(questions = [], answers = {}) {
    const evaluations = questions.map((q, index) => ({
      questionId: q.id,
      question: q.question,
      answer: answers[q.id] || 'Không có câu trả lời',
      score: Math.floor(Math.random() * 3) + 7,
      maxScore: 10,
      feedback: 'Câu trả lời khá tốt, thể hiện sự hiểu biết về nội dung bài viết.',
      evidence: {
        correctPoints: ['Đã nêu được nội dung chính của bài viết', 'Trình bày có logic và mạch lạc'],
        missingPoints: ['Có thể bổ sung thêm chi tiết cụ thể', 'Nên đưa ra ví dụ minh họa'],
        incorrectPoints: [],
        quotes: ['"Nội dung chính được đề cập trong bài viết"', '"Thông tin quan trọng được trình bày rõ ràng"']
      },
      strengths: ['Hiểu được nội dung chính', 'Trình bày rõ ràng và có cấu trúc'],
      improvements: ['Cần chi tiết hơn với dẫn chứng cụ thể', 'Cần ví dụ minh họa để làm rõ ý'],
      accuracy: 'Khá chính xác',
      completeness: 'Khá đầy đủ',
      quality: 'Khá'
    }));
    
    const totalScore = evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
    const averageScore = evaluations.length > 0 ? totalScore / evaluations.length : 0;
    
    return {
      overallScore: Math.round(averageScore * 10) / 10,
      totalQuestions: questions.length,
      evaluations,
      summary: {
        overallFeedback: 'Bạn đã hiểu khá tốt nội dung bài viết. Hãy tiếp tục phát triển kỹ năng phân tích và trình bày với dẫn chứng cụ thể hơn.',
        strengths: ['Hiểu được nội dung chính', 'Trình bày có logic và cấu trúc'],
        improvements: ['Cần chi tiết hơn với dẫn chứng từ bài viết', 'Cần liên hệ thực tế và ví dụ cụ thể'],
        recommendations: ['Đọc kỹ hơn để nắm bắt chi tiết', 'Tập viết nhiều hơn với dẫn chứng', 'Tham khảo thêm tài liệu liên quan'],
        nextSteps: ['Luyện tập trả lời câu hỏi với dẫn chứng cụ thể', 'Đọc thêm bài viết tương tự để mở rộng kiến thức']
      }
    };
  }

  // Tạo tất cả thông tin học tập trong một lần gọi API
  async generateComprehensiveLearningData(content, readingData = {}) {
    try {
      logger.info('READING_TIPS', 'Generating comprehensive learning data', {
        contentLength: content?.content?.length || content?.length || 0,
        hasTitle: !!content?.title,
        readingProgress: readingData.progress || 'start'
      });
      
      const prompt = this.createComprehensivePrompt(content, readingData);
      const response = await this.geminiService.generateContent(prompt, {
        temperature: 0.7,
        maxOutputTokens: 3000
      });
      
      if (!response) {
        logger.warn('READING_TIPS', 'No response received from AI. Using fallback data.');
        return this.generateFallbackComprehensiveData(content, readingData);
      }
      
      const data = this.parseComprehensiveResponse(response);
      logger.info('READING_TIPS', 'Generated comprehensive learning data successfully', {
        conceptsCount: data.conceptsAndTerms?.length || 0,
        statisticsCount: data.statistics?.length || 0,
        questionsCount: data.previewQuestions?.length || 0
      });
      
      return data;
    } catch (error) {
      logger.error('READING_TIPS', 'Error generating comprehensive learning data', {
        error: error.message,
        errorType: error.constructor.name
      });
      
      return this.generateFallbackComprehensiveData(content, readingData);
    }
  }

  // Tạo prompt tổng hợp cho tất cả thông tin học tập
  createComprehensivePrompt(content, readingData) {
    const title = content.title || 'Bài viết';
    const textContent = content.content || content;
    const readingProgress = readingData.progress || 'start';
    const readingSpeed = readingData.speed || 'normal';
    
    const maxContentLength = 8000;
    const truncatedContent = textContent.length > maxContentLength 
      ? textContent.substring(0, maxContentLength) + '...' 
      : textContent;
    
    return `Bạn là một chuyên gia giáo dục và sư phạm người Việt Nam. Hãy phân tích bài viết sau và tạo tất cả thông tin học tập cần thiết bằng TIẾNG VIỆT.

**NHIỆM VỤ QUAN TRỌNG:** Tìm và phân tích TẤT CẢ các số liệu trong bài viết một cách chi tiết và đầy đủ nhất.

**Tiêu đề:** ${title}

**Nội dung:**
${truncatedContent}

**Thông tin đọc hiện tại:**
- Tiến độ: ${readingProgress}
- Tốc độ: ${readingSpeed}

**Yêu cầu:** Tạo một JSON object đơn giản với chỉ 3 phần sau:

{
  "conceptsAndTerms": [
    {
      "term": "Khái niệm hoặc thuật ngữ",
      "definition": "Định nghĩa dễ hiểu bằng tiếng Việt",
      "example": "Ví dụ cụ thể",
      "type": "khái niệm" hoặc "thuật ngữ"
    }
  ],
  "statistics": [
    {
      "data": "Số liệu cụ thể",
      "unit": "Đơn vị đo lường",
      "significance": "Ý nghĩa và tầm quan trọng của số liệu",
      "context": "Bối cảnh xuất hiện số liệu",
      "memoryTip": "Mẹo nhớ số liệu này"
    }
  ],
  "previewQuestions": [
    {
      "question": "Câu hỏi định hướng bằng tiếng Việt",
    }
  ]
}

**HƯỚNG DẪN CHI TIẾT:**
- Phần conceptsAndTerms: Bao gồm cả khái niệm chuyên ngành và thuật ngữ khó trong cùng một mục
- Phần statistics: Tìm KIẾM TẤT CẢ các số liệu trong bài viết (số lượng, phần trăm, thời gian, tiền tệ, v.v.) - QUAN TRỌNG: Phải có ít nhất 3-5 số liệu
- Phần previewQuestions: Tạo 3-5 câu hỏi định hướng để người đọc tập trung vào nội dung quan trọng
- Mỗi phần có 3-8 items tùy theo độ phong phú của nội dung bài viết
- Tập trung vào thông tin quan trọng nhất và dễ hiểu nhất

**QUAN TRỌNG VỀ STATISTICS:**
- Tìm TẤT CẢ số liệu có trong bài: số lượng người, phần trăm, năm tháng, tiền tệ, đo lường, v.v.
- Nếu không có số liệu cụ thể, tạo số liệu ước tính hợp lý dựa trên nội dung
- Mỗi số liệu phải có ý nghĩa và bối cảnh rõ ràng
- Phải có ít nhất 3 số liệu trong phần statistics

**QUAN TRỌNG:** 
- TẤT CẢ nội dung phải bằng TIẾNG VIỆT
- Phần statistics: Tìm KIẾM TẤT CẢ số liệu có trong bài, không bỏ sót
- Mỗi phần có 3-8 items tùy theo độ phong phú của nội dung
- Tập trung vào thông tin quan trọng nhất
- JSON PHẢI hợp lệ: không có trailing commas, escape special characters
- KHÔNG thêm prefix như json, JSON, markdown code blocks vào đầu response
- KHÔNG thêm suffix như markdown code blocks vào cuối response
- Chỉ trả về JSON object thuần túy, bắt đầu bằng { và kết thúc bằng }
- Đảm bảo tất cả strings được escape đúng cách`;
  }

  // Parse response tổng hợp
  parseComprehensiveResponse(response) {
    try {
      let cleanedResponse = response.trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .replace(/^json\s*/i, '')
        .replace(/^JSON\s*/i, '')
        .replace(/^`json\s*/i, '')
        .replace(/`\s*$/i, '')
        .trim();
      
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.warn('READING_TIPS', 'No JSON found in response, using fallback data');
        return this.generateLocalComprehensiveData();
      }
      
      let jsonString = jsonMatch[0];
      
      // Fix common JSON issues
      jsonString = jsonString
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\\"/g, '"')
        .replace(/"\s*:\s*"/g, '": "')
        .replace(/"\s*,\s*"/g, '", "')
        .replace(/\[\s*/g, '[')
        .replace(/\s*\]/g, ']')
        .replace(/{\s*/g, '{')
        .replace(/\s*}/g, '}')
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/,\s*,/g, ',')
        .replace(/{\s*,/g, '{')
        .replace(/,\s*}/g, '}')
        .replace(/\[\s*,/g, '[')
        .replace(/,\s*\]/g, ']');
      
      let data;
      try {
        data = JSON.parse(jsonString);
      } catch (parseError) {
        logger.warn('READING_TIPS', 'JSON parse failed, trying partial parsing');
        
        try {
          const conceptsMatch = jsonString.match(/"conceptsAndTerms"\s*:\s*\[([\s\S]*?)\]/);
          const statsMatch = jsonString.match(/"statistics"\s*:\s*\[([\s\S]*?)\]/);
          const questionsMatch = jsonString.match(/"previewQuestions"\s*:\s*\[([\s\S]*?)\]/);
          
          data = {
            conceptsAndTerms: conceptsMatch ? JSON.parse(`[${conceptsMatch[1]}]`) : [],
            statistics: statsMatch ? JSON.parse(`[${statsMatch[1]}]`) : [],
            previewQuestions: questionsMatch ? JSON.parse(`[${questionsMatch[1]}]`) : []
          };
          
          logger.debug('READING_TIPS', 'Partial parsing successful');
        } catch (partialParseError) {
          logger.error('READING_TIPS', 'Partial parsing also failed');
          throw parseError;
        }
      }
      
      if (!data || typeof data !== 'object') {
        logger.warn('READING_TIPS', 'Invalid JSON structure, using fallback data');
        return this.generateLocalComprehensiveData();
      }
      
      return {
        readingTips: this.getFixedReadingTips(),
        conceptsAndTerms: Array.isArray(data.conceptsAndTerms) && data.conceptsAndTerms.length > 0 ? data.conceptsAndTerms : this.generateLocalComprehensiveData().conceptsAndTerms,
        statistics: Array.isArray(data.statistics) && data.statistics.length > 0 ? data.statistics : this.generateLocalComprehensiveData().statistics,
        previewQuestions: Array.isArray(data.previewQuestions) && data.previewQuestions.length > 0 ? data.previewQuestions : this.generateLocalComprehensiveData().previewQuestions
      };
      
    } catch (error) {
      logger.error('READING_TIPS', 'Error parsing comprehensive response', {
        error: error.message,
        errorType: error.constructor.name
      });
      
      return this.generateLocalComprehensiveData();
    }
  }

  // Mẹo đọc fix cứng
  getFixedReadingTips() {
    return [
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
      },
      {
        id: 4,
        title: "Đặt câu hỏi trong khi đọc",
        description: "Tự đặt câu hỏi về nội dung để tăng khả năng hiểu và ghi nhớ",
        icon: "❓"
      },
      {
        id: 5,
        title: "Tóm tắt sau khi đọc",
        description: "Dành vài phút để tóm tắt lại những gì đã đọc để củng cố kiến thức",
        icon: "✍️"
      }
    ];
  }

  // Fallback: Generate local comprehensive data
  generateFallbackComprehensiveData(content, readingData = {}) {
    logger.info('READING_TIPS', 'Generating fallback comprehensive data');
    
        return {
          readingTips: this.getFixedReadingTips(),
      conceptsAndTerms: [
        {
          term: "Khái niệm chính",
          definition: "Định nghĩa khái niệm quan trọng trong bài viết",
          example: "Ví dụ minh họa",
          type: "khái niệm"
        },
        {
          term: "Thuật ngữ khó",
          definition: "Giải thích thuật ngữ một cách đơn giản",
          example: "Ví dụ cụ thể",
          type: "thuật ngữ"
        }
      ],
      statistics: [
        {
          data: "100",
          unit: "người",
          significance: "Số lượng người tham gia sự kiện quan trọng",
          context: "Được đề cập trong đoạn đầu bài viết",
          memoryTip: "Nhớ số 100 như một trăm điểm hoàn hảo"
        },
        {
          data: "15%",
          unit: "phần trăm",
          significance: "Tỷ lệ tăng trưởng đáng kể",
          context: "Thống kê trong phần phân tích",
          memoryTip: "15% = 3/20, dễ nhớ như 15 phút"
        },
        {
          data: "2024",
          unit: "năm",
          significance: "Năm quan trọng trong lịch sử",
          context: "Được nhắc đến nhiều lần trong bài",
          memoryTip: "2024 = 20 + 24 = 44, số may mắn"
        }
      ],
      previewQuestions: [
        {
          question: "Câu hỏi định hướng đọc",
        }
      ]
    };
  }

  // Fallback: Generate local comprehensive data (alias for compatibility)
  generateLocalComprehensiveData(content, readingData) {
    return this.generateFallbackComprehensiveData(content, readingData);
  }
}

// Export singleton instance
export const readingTipsService = new ReadingTipsService();
export default readingTipsService;