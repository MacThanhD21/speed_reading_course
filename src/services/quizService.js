/**
 * Quiz Service - Service để tạo và chấm quiz
 * 
 * - Generate Quiz: Gọi trực tiếp Gemini API qua geminiService
 * - Grade Quiz: Sử dụng local grading (so sánh trực tiếp, không cần AI)
 */

import logger from '../utils/logger.js';
import geminiService from './geminiService.js';

class QuizService {
  constructor() {
    // Quiz service gọi trực tiếp Gemini API qua geminiService
    // Không sử dụng proxy/serverless functions nữa
  }

  /**
   * Tạo quiz prompt cho Gemini
   */
  createQuizPrompt(textId, textContent, n = 12) {
    return `Bạn là một AI tạo đề trắc nghiệm cho bài đọc. 

Đầu vào: textId="${textId}", textContent="${textContent.substring(0, 2000)}" (một đoạn văn ~300-500 từ).

Yêu cầu tạo quiz:

- Trả về JSON hợp lệ duy nhất, không thêm chú thích.

- Tạo ${n} câu hỏi trắc nghiệm (MCQ) với n trong [10,15].

- Mỗi câu gồm: qid (chuỗi), type="mcq", prompt (tiếng Việt, ngắn gọn), options (mảng 4 phương án chữ A,B,C,D), correct (chữ A/B/C/D), explanation (1 câu ngắn giải thích đáp án đúng).

- Tỉ lệ câu: ~70% nhận biết (fact), ~30% suy luận/ý chính.

- Tránh câu quá mẹo; đảm bảo mỗi câu có một đáp án rõ ràng.

- Kèm theo meta: textId, quizId, generatedAt (ISO8601).

Ví dụ output JSON:

{
  "quizId":"quiz_xyz",
  "textId":"${textId}",
  "generatedAt":"${new Date().toISOString()}",
  "questions":[
    {"qid":"q1","type":"mcq","prompt":"...","options":["A ...","B ...","C ...","D ..."],"correct":"B","explanation":"..."},
    ...
  ]
}

QUAN TRỌNG: Chỉ trả về JSON, không thêm text giải thích bên ngoài.`;
  }

  /**
   * Parse JSON từ Gemini response
   */
  parseQuizJSON(text) {
    if (!text || typeof text !== 'string') return null;

    // 1) Clean common wrappers and noise
    let cleaned = text
      .replace(/^\uFEFF/, '') // BOM
      .replace(/```json[\s\S]*?```/gi, (m) => m.replace(/```json|```/gi, '')) // strip fenced json
      .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, '')) // strip generic fences
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .trim();

    // 2) Keep only the largest JSON object substring
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      cleaned = cleaned.slice(start, end + 1);
    }

    // 3) Remove trailing commas before } or ] that break strict JSON
    cleaned = cleaned.replace(/,\s*(\}|\])/g, '$1');

    // 4) Attempt parse
    try {
      return JSON.parse(cleaned);
    } catch (primaryError) {
      logger.error('QUIZ_SERVICE', 'JSON parse error', { error: primaryError.message });

      // 5) Last-resort: try to match a JSON object by regex and parse
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const attempt = jsonMatch[0].replace(/,\s*(\}|\])/g, '$1');
          return JSON.parse(attempt);
        } catch (secondaryError) {
          logger.error('QUIZ_SERVICE', 'JSON parse fallback failed', { error: secondaryError.message });
        }
      }
    }

    return null;
  }

  /**
   * Tạo quiz từ textContent - Gọi trực tiếp Gemini API
   * @param {string} textId - ID của text
   * @param {string} textContent - Nội dung text (300-500 từ)
   * @param {number} n - Số câu hỏi (10-15, mặc định 12)
   * @returns {Promise<Object>} Quiz object với questions array
   */
  async generateQuiz(textId, textContent, n = 12) {
    try {
      logger.info('QUIZ_SERVICE', 'Generating quiz via Gemini API', { textId, n });
      
      // Gọi trực tiếp Gemini API
      const prompt = this.createQuizPrompt(textId, textContent, n);
      const responseText = await geminiService.generateContent(prompt, {
        temperature: 0.2,
        maxOutputTokens: 4000
      });
      
      const quizData = this.parseQuizJSON(responseText);
      
      if (!quizData || !quizData.questions) {
        throw new Error('Invalid quiz format from Gemini API');
      }

      // Đảm bảo có đủ fields
      const quiz = {
        quizId: quizData.quizId || `quiz_${Date.now()}`,
        textId: textId,
        generatedAt: quizData.generatedAt || new Date().toISOString(),
        questions: quizData.questions.map((q, idx) => ({
          qid: q.qid || `q${idx + 1}`,
          type: q.type || 'mcq',
          prompt: q.prompt || '',
          options: q.options || [],
          correct: q.correct || 'A',
          explanation: q.explanation || ''
        }))
      };

      logger.info('QUIZ_SERVICE', 'Quiz generated successfully', { 
        quizId: quiz.quizId, 
        questionCount: quiz.questions.length 
      });

      return quiz;
      
    } catch (error) {
      logger.error('QUIZ_SERVICE', 'Failed to generate quiz', { 
        textId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Chấm quiz local - So sánh trực tiếp câu trả lời với đáp án
   */
  gradeQuizLocal(sessionId, quiz, answers, wpm) {
    const totalQuestions = quiz.questions?.length || 0;
    let correctCount = 0;
    
    const perQuestion = quiz.questions?.map((q, idx) => {
      const userAnswer = answers.find(a => a.qid === q.qid)?.answer || '';
      const isCorrect = userAnswer.toUpperCase() === q.correct.toUpperCase();
      
      if (isCorrect) correctCount++;
      
      return {
        qid: q.qid || `q${idx + 1}`,
        userAnswer: userAnswer,
        correct: q.correct,
        isCorrect: isCorrect,
        explanation: q.explanation || ''
      };
    }) || [];
    
    const comprehensionPercent = totalQuestions > 0 
      ? parseFloat((correctCount / totalQuestions * 100).toFixed(1))
      : 0;
    
    const rei = parseFloat((wpm * (comprehensionPercent / 100)).toFixed(1));
    
    // Generate simple feedback
    let feedback = '';
    if (comprehensionPercent >= 90) {
      feedback = 'Xuất sắc! Bạn hiểu rất tốt nội dung bài đọc.';
    } else if (comprehensionPercent >= 75) {
      feedback = 'Tốt! Bạn đã nắm được phần lớn nội dung.';
    } else if (comprehensionPercent >= 60) {
      feedback = 'Khá tốt, nhưng bạn cần chú ý hơn đến các chi tiết quan trọng.';
    } else {
      feedback = 'Bạn cần đọc kỹ lại và chú ý đến các ý chính của bài viết.';
    }
    
    return {
      sessionId,
      correctCount,
      totalQuestions,
      comprehensionPercent,
      wpm,
      rei,
      perQuestion,
      feedback
    };
  }

  /**
   * Chấm quiz - Sử dụng local grading (không cần AI)
   * @param {string} sessionId - Session ID
   * @param {Object} quiz - Quiz object (từ generateQuiz)
   * @param {Array} answers - Array of {qid, answer}
   * @param {number} wpm - Words per minute
   * @returns {Promise<Object>} Grade result với comprehensionPercent, REI, etc.
   */
  async gradeQuiz(sessionId, quiz, answers, wpm) {
    try {
      logger.info('QUIZ_SERVICE', 'Grading quiz locally', { sessionId, wpm });
      
      // Chấm quiz local (so sánh trực tiếp)
      const result = this.gradeQuizLocal(sessionId, quiz, answers, wpm);
      
      logger.info('QUIZ_SERVICE', 'Quiz graded successfully', { 
        sessionId,
        correctCount: result.correctCount,
        comprehensionPercent: result.comprehensionPercent,
        rei: result.rei
      });
      
      return result;
      
    } catch (error) {
      logger.error('QUIZ_SERVICE', 'Failed to grade quiz', { 
        sessionId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Tính RCI (Reading Consistency Index) từ lịch sử REI
   * @param {Array<number>} reiHistory - Mảng các giá trị REI gần nhất
   * @returns {Object} { rci, isStable, stabilityPercent }
   */
  calculateRCI(reiHistory) {
    if (!reiHistory || reiHistory.length < 3) {
      return {
        rci: null,
        isStable: false,
        stabilityPercent: null,
        message: 'Cần ít nhất 3 lần đọc để tính RCI'
      };
    }

    const recent = reiHistory.slice(-5); // Lấy 5 giá trị gần nhất
    const max = Math.max(...recent);
    const min = Math.min(...recent);
    const avg = recent.reduce((sum, val) => sum + val, 0) / recent.length;

    // Tính sai số phần trăm
    const stabilityPercent = avg > 0 
      ? parseFloat(((max - min) / avg * 100).toFixed(1))
      : 100;

    // RCI ổn định nếu sai số <= 15%
    const isStable = stabilityPercent <= 15;

    return {
      rci: stabilityPercent,
      isStable,
      stabilityPercent,
      message: isStable 
        ? 'Độ ổn định tốt! Bạn đang đọc nhất quán.'
        : `Độ ổn định: ${stabilityPercent}%. Cần cải thiện tính nhất quán.`
    };
  }

  /**
   * Lưu kết quả quiz vào localStorage
   * @param {string} textId - Text ID
   * @param {Object} result - Grade result
   */
  saveQuizResult(textId, result) {
    try {
      const key = `quiz_results_${textId}`;
      const history = this.getQuizHistory(textId);
      
      history.push({
        ...result,
        timestamp: new Date().toISOString()
      });

      // Giữ tối đa 10 kết quả gần nhất
      const limitedHistory = history.slice(-10);
      
      localStorage.setItem(key, JSON.stringify(limitedHistory));
      
      logger.debug('QUIZ_SERVICE', 'Quiz result saved', { textId });
    } catch (error) {
      logger.error('QUIZ_SERVICE', 'Failed to save quiz result', { error: error.message });
    }
  }

  /**
   * Lấy lịch sử quiz từ localStorage
   * @param {string} textId - Text ID
   * @returns {Array} History array
   */
  getQuizHistory(textId) {
    try {
      const key = `quiz_results_${textId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('QUIZ_SERVICE', 'Failed to get quiz history', { error: error.message });
      return [];
    }
  }

  /**
   * Lấy lịch sử REI để tính RCI
   * @param {string} textId - Text ID (optional, nếu null thì lấy tất cả)
   * @returns {Array<number>} Array of REI values
   */
  getREIHistory(textId = null) {
    try {
      if (textId) {
        const history = this.getQuizHistory(textId);
        return history.map(h => h.rei || 0).filter(rei => rei > 0);
      }

      // Lấy tất cả REI từ tất cả textIds
      const allREI = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('quiz_results_')) {
          const history = this.getQuizHistory(key.replace('quiz_results_', ''));
          allREI.push(...history.map(h => h.rei || 0).filter(rei => rei > 0));
        }
      }
      return allREI;
    } catch (error) {
      logger.error('QUIZ_SERVICE', 'Failed to get REI history', { error: error.message });
      return [];
    }
  }
}

export default new QuizService();

