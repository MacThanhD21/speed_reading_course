import mongoose from 'mongoose';
import ReadingSession from '../models/ReadingSession.js';
import QuizResult from '../models/QuizResult.js';
import User from '../models/User.js';
import geminiPoolManager from '../utils/geminiPoolManager.js';
import { geminiQueue } from '../utils/requestQueue.js';

// Pool manager will initialize lazily when first used

// ===== Gemini helpers for quiz generation (server-side) =====
// Deprecated: Use geminiPoolManager instead
const getGeminiApiKeys = () => {
  // Lazy initialization will happen automatically when accessing keys
  if (!geminiPoolManager.initialized) {
    geminiPoolManager.initialize();
  }
  return geminiPoolManager.keys;
};

const geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const callGemini = async (prompt, apiKey) => {
  // Execute through queue to limit concurrent requests
  return await geminiQueue.enqueue(async () => {
    const res = await fetch(`${geminiEndpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4000,
          topP: 0.8,
          topK: 40,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      const error = new Error(`Gemini API Error ${res.status}: ${text}`);
      error.statusCode = res.status;
      throw error;
    }

    const data = await res.json();
    const part = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!part) throw new Error('Invalid response format from Gemini API');
    return part;
  });
};

const createQuizPrompt = (textId, textContent, n = 12) => {
  return `Bạn là một AI tạo đề trắc nghiệm cho bài đọc.

Đầu vào: textId="${textId}", textContent="${(textContent || '').substring(0, 2000)}" (một đoạn văn ~300-500 từ).

Yêu cầu tạo quiz:
- Trả về JSON hợp lệ duy nhất, không thêm chú thích.
- Tạo ${n} câu hỏi trắc nghiệm (MCQ) với n trong [10,15].
- Mỗi câu gồm: qid (chuỗi), type="mcq", prompt (tiếng Việt), options (mảng 4 phương án chữ A,B,C,D), correct (A/B/C/D), explanation (ngắn).
- Kèm theo meta: textId, quizId, generatedAt (ISO8601).

Ví dụ output JSON:
{
  "quizId":"quiz_xyz",
  "textId":"${textId}",
  "generatedAt":"${new Date().toISOString()}",
  "questions":[
    {"qid":"q1","type":"mcq","prompt":"...","options":["A ...","B ...","C ...","D ..."],"correct":"B","explanation":"..."}
  ]
}

QUAN TRỌNG: Chỉ trả về JSON, không thêm text giải thích bên ngoài.`;
};

const parseQuizJSON = (text) => {
  if (!text || typeof text !== 'string') return null;
  let cleaned = text
    .replace(/^\uFEFF/, '')
    .replace(/```json[\s\S]*?```/gi, m => m.replace(/```json|```/gi, ''))
    .replace(/```[\s\S]*?```/g, m => m.replace(/```/g, ''))
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();
  const s = cleaned.indexOf('{');
  const e = cleaned.lastIndexOf('}');
  if (s >= 0 && e > s) cleaned = cleaned.slice(s, e + 1);
  cleaned = cleaned.replace(/,\s*(\}|\])/g, '$1');
  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0].replace(/,\s*(\}|\])/g, '$1')); } catch {
        return null;
      }
    }
    return null;
  }
};

// @desc    Create a new reading session
// @route   POST /api/smartread/sessions
// @access  Private
export const createReadingSession = async (req, res) => {
  try {
    const { content, readingStats } = req.body;

    if (!content || !content.text || !readingStats) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin',
      });
    }

    const session = await ReadingSession.create({
      user: req.user._id,
      content: {
        title: content.title || 'Văn bản đã dán',
        text: content.text,
        wordCount: content.wordCount || content.text.trim().split(/\s+/).length,
        source: content.source || 'pasted',
      },
      readingStats: {
        wpm: readingStats.wpm,
        duration: readingStats.duration,
        startTime: readingStats.startTime ? new Date(readingStats.startTime) : new Date(),
        endTime: readingStats.endTime ? new Date(readingStats.endTime) : new Date(),
      },
      status: 'completed',
    });

    // Populate user info
    await session.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Đã lưu phiên đọc thành công',
      data: session,
    });
  } catch (error) {
    console.error('Create reading session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi tạo phiên đọc',
    });
  }
};

// @desc    Save quiz result
// @route   POST /api/smartread/quiz-results
// @access  Private
export const saveQuizResult = async (req, res) => {
  try {
    const { readingSessionId, quizType, results, metrics, answers, feedback } = req.body;

    if (!readingSessionId || !results || !metrics) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin',
      });
    }

    // Verify reading session belongs to user
    const session = await ReadingSession.findOne({
      _id: readingSessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiên đọc',
      });
    }

    // Calculate RCI if user has previous results
    let rci = null;
    const previousResults = await QuizResult.find({
      user: req.user._id,
      'metrics.rei': { $exists: true, $ne: null },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('metrics.rei');

    if (previousResults.length >= 3) {
      const reiValues = previousResults
        .map((r) => r.metrics?.rei)
        .filter((rei) => rei != null && !isNaN(rei) && rei > 0);
      
      if (reiValues.length >= 3) {
        const maxRei = Math.max(...reiValues);
        const minRei = Math.min(...reiValues);
        const avgRei = reiValues.reduce((a, b) => a + b, 0) / reiValues.length;
        if (avgRei > 0) {
          const variation = ((maxRei - minRei) / avgRei) * 100;
          rci = Math.max(0, Math.min(100, 100 - Math.min(variation, 100))); // RCI is inverse of variation
        }
      }
    }

    // Create quiz result
    const quizResult = await QuizResult.create({
      user: req.user._id,
      readingSession: readingSessionId,
      quizType: quizType || 'mixed',
      results: {
        correctCount: results.correctCount,
        totalQuestions: results.totalQuestions,
        comprehensionPercent: results.comprehensionPercent,
      },
      metrics: {
        wpm: metrics.wpm,
        rei: metrics.rei,
        rci: rci,
      },
      answers: answers || [],
      feedback: feedback || '',
    });

    // Update reading session with quiz result
    session.quizResult = quizResult._id;
    session.status = 'completed';
    await session.save();

    // Populate data
    await quizResult.populate('user', 'name email');
    await quizResult.populate('readingSession');

    res.status(201).json({
      success: true,
      message: 'Đã lưu kết quả quiz thành công',
      data: quizResult,
    });
  } catch (error) {
    console.error('Save quiz result error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lưu kết quả quiz',
    });
  }
};

// @desc    Get user's reading history
// @route   GET /api/smartread/sessions
// @access  Private
export const getUserReadingHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sessions = await ReadingSession.find({ user: req.user._id })
      .populate('quizResult')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ReadingSession.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get reading history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy lịch sử đọc',
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/smartread/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total sessions
    const totalSessions = await ReadingSession.countDocuments({ user: userId });

    // Get average WPM
    const avgWpmResult = await ReadingSession.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avgWpm: { $avg: '$readingStats.wpm' } } },
    ]);

    // Get average comprehension
    const avgComprehensionResult = await QuizResult.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avgComprehension: { $avg: '$results.comprehensionPercent' } } },
    ]);

    // Get average REI
    const avgReiResult = await QuizResult.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avgRei: { $avg: '$metrics.rei' } } },
    ]);

    // Get best scores
    const bestWpm = await ReadingSession.findOne({ user: userId })
      .sort({ 'readingStats.wpm': -1 })
      .select('readingStats.wpm createdAt');

    const bestRei = await QuizResult.findOne({ user: userId })
      .sort({ 'metrics.rei': -1 })
      .select('metrics.rei createdAt');

    res.json({
      success: true,
      data: {
        totalSessions,
        avgWpm: avgWpmResult[0]?.avgWpm || 0,
        avgComprehension: avgComprehensionResult[0]?.avgComprehension || 0,
        avgRei: avgReiResult[0]?.avgRei || 0,
        bestWpm: bestWpm?.readingStats.wpm || 0,
        bestRei: bestRei?.metrics.rei || 0,
        lastActivity: await ReadingSession.findOne({ user: userId })
          .sort({ createdAt: -1 })
          .select('createdAt'),
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy thống kê',
    });
  }
};

// ===== Additional AI utilities (tips, 5W1H, MCQ) =====
const callGeminiJson = async (prompt, maxRetries = 5) => {
  let lastError = null;
  const triedKeys = new Set();
  
  // Try up to maxRetries with different keys from pool
  // maxRetries should be at least equal to number of keys
  const actualMaxRetries = Math.max(maxRetries, geminiPoolManager.keys.length);
  
  for (let attempt = 0; attempt < actualMaxRetries; attempt++) {
    const key = geminiPoolManager.getNextKey();
    
    // If we've tried all keys and still failing, try again (in case rate limits cleared)
    if (triedKeys.size >= geminiPoolManager.keys.length && attempt >= geminiPoolManager.keys.length) {
      // Reset tried keys to allow retry
      if (triedKeys.size === geminiPoolManager.keys.length) {
        triedKeys.clear();
      }
    }
    triedKeys.add(key);
    
    try {
      const txt = await callGemini(prompt, key);
      // Record success
      geminiPoolManager.recordSuccess(key);
      return txt;
    } catch (e) {
      lastError = e;
      
      // Record error and check if rate limited
      geminiPoolManager.recordError(key, e);
      
      // If rate limited (429), mark and wait
      if (e.statusCode === 429) {
        const retryAfter = e.message.match(/retry.*?(\d+)/i)?.[1] || 60;
        geminiPoolManager.markRateLimited(key, parseInt(retryAfter, 10));
        
        // If this is not the last attempt, wait before trying next key
        if (attempt < actualMaxRetries - 1) {
          const waitTime = Math.min(1000 * (attempt + 1), 5000); // Max 5 seconds wait
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
      
      // Continue to next key
      continue;
    }
  }
  
  throw lastError || new Error('All Gemini keys failed');
};

const buildFiveWOneHPrompt = (title, text) => {
  const t = (text || '').substring(0, 3000);
  return `Bạn là một giáo viên chuyên nghiệp người Việt Nam. Hãy tạo các câu hỏi tự luận đơn giản theo phương pháp 5W1H bằng TIẾNG VIỆT dựa trên TIÊU ĐỀ và NỘI DUNG thực tế của bài viết sau:

**TIÊU ĐỀ:** ${title || 'Bài viết'}

**Nội dung bài viết:**
${t}

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
11. Trả về dưới dạng JSON object với format:
{
  "questions": [
    {
      "id": 1,
      "question": "Câu hỏi về nội dung thực tế bằng tiếng Việt",
      "type": "what|who|when|where|why|how",
      "expectedLength": "Ngắn|Trung bình|Dài",
      "keyPoints": ["Điểm chính 1 từ nội dung", "Điểm chính 2 từ nội dung", "Điểm chính 3 từ nội dung"]
    }
  ]
}

**QUAN TRỌNG:** 
- TẤT CẢ câu hỏi, gợi ý và điểm chính phải bằng TIẾNG VIỆT
- Câu hỏi phải NGẮN GỌN, ĐƠN GIẢN, liên quan TRỰC TIẾP đến nội dung
- MỖI CÂU HỎI PHẢI KHÁC NHAU HOÀN TOÀN, KHÔNG TRÙNG LẶP
- Câu hỏi phải khai thác thông tin CỤ THỂ từ nội dung bài viết, không phải template
- KHÔNG yêu cầu suy luận, phân tích sâu hay kiến thức bên ngoài
- Mỗi câu hỏi phải có keyPoints CỤ THỂ từ nội dung để đánh giá câu trả lời
- Chỉ trả về JSON object, không có text thêm.`;
};

const buildTipsPrompt = (readingData, content) => {
  const { finalWPM = 0, wordsRead = 0, elapsedTime = 0, averageWPM = 0 } = readingData || {};
  const snippet = (content?.content || content || '').substring(0, 1200);
  return `Bạn là huấn luyện viên kỹ năng đọc. Dựa trên dữ liệu đọc:
- Tốc độ cuối: ${finalWPM} wpm, Trung bình: ${averageWPM} wpm
- Từ đã đọc: ${wordsRead}, Thời gian: ${elapsedTime}s
Hãy đề xuất 5 mẹo cụ thể để cải thiện tốc độ và hiểu bài. Trả về JSON hợp lệ:
{
  "tips": ["...", "...", "...", "...", "..."]
}
Ngắn gọn, tiếng Việt, phù hợp với trình độ hiện tại.
Ngữ cảnh bài đọc: ${snippet}`;
};

const parseSimpleJson = (text) => {
  if (!text || typeof text !== 'string') return null;
  let cleaned = text
    .replace(/^\uFEFF/, '')
    .replace(/```json[\s\S]*?```/gi, m => m.replace(/```json|```/gi, ''))
    .replace(/```[\s\S]*?```/g, m => m.replace(/```/g, ''))
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();
  const s = cleaned.indexOf('{');
  const e = cleaned.lastIndexOf('}');
  if (s >= 0 && e > s) cleaned = cleaned.slice(s, e + 1);
  cleaned = cleaned.replace(/,\s*(\}|\])/g, '$1');
  try { return JSON.parse(cleaned); } catch { return null; }
};

// @desc    Generate 5W1H
// @route   POST /api/smartread/fivewoneh
// @access  Private
export const generateFiveWOneH = async (req, res) => {
  try {
    const { title, text } = req.body || {};
    const prompt = buildFiveWOneHPrompt(title, text);
    const txt = await callGeminiJson(prompt);
    const data = parseSimpleJson(txt);
    if (!data?.questions || !Array.isArray(data.questions)) {
      return res.status(500).json({ success: false, message: 'Invalid 5W1H format' });
    }
    
    // Normalize questions to ensure all required fields
    const normalizedQuestions = data.questions.map((q, idx) => ({
      id: q.id || idx + 1,
      question: q.question || '',
      type: (q.type || 'what').toLowerCase(),
      expectedLength: q.expectedLength || 'Trung bình',
      keyPoints: Array.isArray(q.keyPoints) && q.keyPoints.length > 0 
        ? q.keyPoints 
        : ['Nội dung chính từ bài viết', 'Chi tiết quan trọng', 'Thông tin liên quan']
    }));
    
    return res.json({ success: true, questions: normalizedQuestions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Generate reading tips
// @route   POST /api/smartread/reading-tips
// @access  Private
export const generateReadingTips = async (req, res) => {
  try {
    const { readingData, content } = req.body || {};
    const prompt = buildTipsPrompt(readingData, content);
    const txt = await callGeminiJson(prompt);
    const data = parseSimpleJson(txt);
    if (!data?.tips) return res.status(500).json({ success: false, message: 'Invalid tips format' });
    return res.json({ success: true, ...data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

const buildComprehensivePrompt = (content, readingData) => {
  const title = content?.title || 'Bài viết';
  const textContent = content?.content || content || '';
  const readingProgress = readingData?.progress || 'start';
  const readingSpeed = readingData?.speed || 'normal';
  
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
      "question": "Câu hỏi định hướng bằng tiếng Việt"
    }
  ]
}

**HƯỚNG DẪN CHI TIẾT:**
- Phần conceptsAndTerms: Bao gồm cả khái niệm chuyên ngành và thuật ngữ khó trong cùng một mục (tối thiểu 3-5 items)
- Phần statistics: Tìm KIẾM TẤT CẢ các số liệu trong bài viết (số lượng, phần trăm, năm tháng, tiền tệ, đo lường, v.v.) - QUAN TRỌNG: Phải có ít nhất 3-5 số liệu
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
- Chỉ trả về JSON object thuần túy, bắt đầu bằng { và kết thúc bằng }`;
};

// @desc    Generate comprehensive learning data (concepts, statistics, preview questions)
// @route   POST /api/smartread/comprehensive-learning
// @access  Private
export const generateComprehensiveLearning = async (req, res) => {
  try {
    const { content, readingData } = req.body || {};
    if (!content) {
      return res.status(400).json({ success: false, message: 'Missing content' });
    }

    const prompt = buildComprehensivePrompt(content, readingData);
    const txt = await callGeminiJson(prompt);
    const data = parseSimpleJson(txt);
    
    if (!data || (!data.conceptsAndTerms && !data.statistics && !data.previewQuestions)) {
      return res.status(500).json({ success: false, message: 'Invalid comprehensive learning format' });
    }
    
    // Normalize data to ensure all fields are arrays
    const normalized = {
      conceptsAndTerms: Array.isArray(data.conceptsAndTerms) && data.conceptsAndTerms.length > 0
        ? data.conceptsAndTerms
        : [],
      statistics: Array.isArray(data.statistics) && data.statistics.length > 0
        ? data.statistics
        : [],
      previewQuestions: Array.isArray(data.previewQuestions) && data.previewQuestions.length > 0
        ? data.previewQuestions
        : []
    };
    
    return res.json({ success: true, ...normalized });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

const buildEvaluationPrompt = (questions, answers, content) => {
  const title = content?.title || 'Bài viết';
  const textContent = content?.content || content || '';
  const maxContentLength = 8000;
  const truncatedContent = textContent.length > maxContentLength 
    ? textContent.substring(0, maxContentLength) + '...' 
    : textContent;
  
  const qaPairs = questions.map((q, index) => {
    const answer = answers[q.id] || answers[String(q.id)] || 'Không có câu trả lời';
    const keyPoints = Array.isArray(q.keyPoints) ? q.keyPoints.join(', ') : (q.keyPoints || 'Nội dung chính từ bài viết');
    return `Câu hỏi ${index + 1} (${q.type || 'What'}): ${q.question || ''}
Câu trả lời: ${answer}
Điểm chính cần có: ${keyPoints}`;
  }).join('\n\n');
  
  return `Bạn là một giáo viên chuyên nghiệp người Việt Nam với kinh nghiệm đánh giá bài tập tự luận. Hãy đánh giá câu trả lời tự luận của học sinh dựa trên nội dung bài viết sau:

**Tiêu đề bài viết:** ${title}

**Nội dung bài viết:**
${truncatedContent}

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
};

// @desc    Evaluate essay answers (5W1H) using Gemini AI
// @route   POST /api/smartread/evaluate-essay
// @access  Private
export const evaluateEssayAnswers = async (req, res) => {
  try {
    const { questions, answers, content } = req.body || {};
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing or invalid questions' });
    }
    
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, message: 'Missing or invalid answers' });
    }
    
    if (!content) {
      return res.status(400).json({ success: false, message: 'Missing content' });
    }

    const prompt = buildEvaluationPrompt(questions, answers, content);
    const txt = await callGeminiJson(prompt);
    const data = parseSimpleJson(txt);
    
    if (!data || !data.evaluations || !Array.isArray(data.evaluations)) {
      return res.status(500).json({ success: false, message: 'Invalid evaluation format' });
    }
    
    // Normalize evaluation data
    const normalized = {
      overallScore: typeof data.overallScore === 'number' ? data.overallScore : 0,
      totalQuestions: data.totalQuestions || questions.length,
      evaluations: data.evaluations.map((evalItem, idx) => ({
        questionId: evalItem.questionId || questions[idx]?.id || idx + 1,
        question: evalItem.question || questions[idx]?.question || '',
        answer: evalItem.answer || answers[questions[idx]?.id] || answers[String(questions[idx]?.id)] || '',
        score: Math.max(0, Math.min(10, typeof evalItem.score === 'number' ? evalItem.score : 0)),
        maxScore: evalItem.maxScore || 10,
        feedback: evalItem.feedback || 'Nhận xét về câu trả lời',
        evidence: {
          correctPoints: Array.isArray(evalItem.evidence?.correctPoints) ? evalItem.evidence.correctPoints : [],
          missingPoints: Array.isArray(evalItem.evidence?.missingPoints) ? evalItem.evidence.missingPoints : [],
          incorrectPoints: Array.isArray(evalItem.evidence?.incorrectPoints) ? evalItem.evidence.incorrectPoints : [],
          quotes: Array.isArray(evalItem.evidence?.quotes) ? evalItem.evidence.quotes : []
        },
        strengths: Array.isArray(evalItem.strengths) ? evalItem.strengths : [],
        improvements: Array.isArray(evalItem.improvements) ? evalItem.improvements : [],
        accuracy: evalItem.accuracy || 'Cần cải thiện',
        completeness: evalItem.completeness || 'Thiếu sót',
        quality: evalItem.quality || 'Cần cải thiện'
      })),
      summary: {
        overallFeedback: data.summary?.overallFeedback || 'Nhận xét tổng quan về bài làm',
        strengths: Array.isArray(data.summary?.strengths) ? data.summary.strengths : [],
        improvements: Array.isArray(data.summary?.improvements) ? data.summary.improvements : [],
        recommendations: Array.isArray(data.summary?.recommendations) ? data.summary.recommendations : [],
        nextSteps: Array.isArray(data.summary?.nextSteps) ? data.summary.nextSteps : []
      }
    };
    
    return res.json({ success: true, ...normalized });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
// @desc    Generate quiz using Gemini (server-side)
// @route   POST /api/smartread/generate-quiz
// @access  Private
export const generateQuiz = async (req, res) => {
  try {
    const { textId, textContent, n = 12 } = req.body;
    if (!textId || !textContent) {
      return res.status(400).json({ success: false, message: 'Missing textId or textContent' });
    }

    const count = Math.min(Math.max(parseInt(n) || 12, 10), 15);
    const prompt = createQuizPrompt(textId, textContent, count);

    // Use callGeminiJson which handles key rotation and queue
    const responseText = await callGeminiJson(prompt);
    const quizData = parseQuizJSON(responseText);
    if (!quizData || !quizData.questions) {
      throw new Error('Invalid quiz format from Gemini');
    }

    const quiz = {
      success: true,
      quizId: quizData.quizId || `quiz_${Date.now()}`,
      textId,
      generatedAt: quizData.generatedAt || new Date().toISOString(),
      questions: quizData.questions.map((q, idx) => ({
        qid: q.qid || `q${idx + 1}`,
        type: q.type || 'mcq',
        prompt: q.prompt || '',
        options: q.options || [],
        correct: q.correct || 'A',
        explanation: q.explanation || '',
      })),
    };
    return res.status(200).json(quiz);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get Gemini Pool Manager statistics
// @route   GET /api/smartread/pool-stats
// @access  Private
export const getGeminiPoolStats = async (req, res) => {
  try {
    const poolStats = geminiPoolManager.getStats();
    const queueStats = geminiQueue.getStats();
    
    return res.json({
      success: true,
      pool: poolStats,
      queue: queueStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get single reading session
// @route   GET /api/smartread/sessions/:id
// @access  Private
export const getReadingSession = async (req, res) => {
  try {
    const session = await ReadingSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('quizResult');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiên đọc',
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Get reading session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server',
    });
  }
};

