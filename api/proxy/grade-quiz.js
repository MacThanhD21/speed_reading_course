/**
 * Vercel Serverless Function - Grade Quiz via Gemini API
 * POST /api/proxy/grade-quiz
 * 
 * Request body: { sessionId, quiz, answers, wpm }
 * Response: { sessionId, correctCount, totalQuestions, comprehensionPercent, wpm, rei, perQuestion, feedback }
 */

// Lấy API keys từ environment variables hoặc fallback
const getApiKeys = () => {
  const envKeys = process.env.GEMINI_API_KEYS?.split(',') || [];
  const fallbackKeys = [
    "AIzaSyCT1FqXtbVLeqJj-7WYPGDVbTF9RSq7z90",
    "AIzaSyB25KpRF3v7vBOMDNaoRocYMA63zCohUAw",
    "AIzaSyC9ST6XCn2yTVwPBW5SV9GCZKDmOBajbls",
    "AIzaSyDW_ij25U5wFkYfgVa-D4jKcjE2MO-s_dU",
    "AIzaSyADhyG_AvMr4QIkTE9WPB4h42769BnnfLM"
  ];
  return envKeys.length > 0 ? envKeys : fallbackKeys;
};

// Helper để gọi Gemini API
async function callGemini(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1, // Rất thấp để output chính xác
        maxOutputTokens: 3000,
        topP: 0.8,
        topK: 40
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    return data.candidates[0].content.parts[0].text;
  }
  
  throw new Error('Invalid response format from Gemini API');
}

// Prompt chấm quiz (theo yêu cầu)
function createGradePrompt(sessionId, quiz, answers, wpm) {
  return `Bạn là một AI chấm bài trắc nghiệm. 

Đầu vào (JSON): {
  "sessionId":"${sessionId}",
  "quiz": ${JSON.stringify(quiz)},
  "answers": ${JSON.stringify(answers)},
  "wpm": ${wpm}
}

Yêu cầu:

- So sánh answers với quiz.questions[].correct.

- Tính correctCount, totalQuestions, comprehensionPercent = correctCount/totalQuestions*100 (làm tròn 1 chữ số thập phân).

- Tính REI = wpm * (comprehensionPercent / 100) (làm tròn 1 chữ số thập phân).

- Trả về **duy nhất** một JSON hợp lệ có cấu trúc:

{
  "sessionId":"${sessionId}",
  "correctCount": 9,
  "totalQuestions": 12,
  "comprehensionPercent": 75.0,
  "wpm": ${wpm},
  "rei": 157.5,
  "perQuestion":[
    {"qid":"q1","userAnswer":"A","correct":"B","isCorrect":false,"explanation":"..."},
    ...
  ],
  "feedback": "Xâu chuỗi feedback ngắn (1-2 câu) tùy mức hiểu"
}

- KHÔNG chèn văn bản giải thích ngoài JSON.

- Sử dụng explanation từ quiz.questions[].explanation cho mỗi câu.

QUAN TRỌNG: Chỉ trả về JSON, không thêm text giải thích bên ngoài.`;
}

// Parse JSON từ response
function parseJSONResponse(text) {
  // Xóa markdown code blocks nếu có
  let cleaned = text.trim();
  
  // Tìm JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('JSON parse error:', e);
    }
  }
  
  return null;
}

// Fallback: chấm local nếu Gemini fail
function gradeQuizLocal(sessionId, quiz, answers, wpm) {
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

export default async function handler(req, res) {
  // Chỉ cho phép POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, quiz, answers, wpm } = req.body;

    // Validate input
    if (!sessionId || !quiz || !answers || wpm === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: sessionId, quiz, answers, and wpm are required' 
      });
    }

    // Validate quiz structure
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      return res.status(400).json({ 
        error: 'Invalid quiz format: questions array is required' 
      });
    }

    // Tạo prompt
    const prompt = createGradePrompt(sessionId, quiz, answers, wpm);

    // Thử các API keys
    const apiKeys = getApiKeys();
    let lastError = null;

    for (const apiKey of apiKeys) {
      try {
        // Gọi Gemini
        const responseText = await callGemini(prompt, apiKey.trim());
        
        // Parse JSON
        const result = parseJSONResponse(responseText);
        
        if (result && result.correctCount !== undefined) {
          // Validate và format result
          const gradeResult = {
            sessionId: result.sessionId || sessionId,
            correctCount: result.correctCount || 0,
            totalQuestions: result.totalQuestions || quiz.questions.length,
            comprehensionPercent: parseFloat((result.comprehensionPercent || 0).toFixed(1)),
            wpm: result.wpm || wpm,
            rei: parseFloat((result.rei || 0).toFixed(1)),
            perQuestion: result.perQuestion || [],
            feedback: result.feedback || ''
          };

          return res.status(200).json(gradeResult);
        }
        
        // Nếu parse không thành công, fallback
        throw new Error('Invalid grade format from Gemini');
        
      } catch (error) {
        console.error(`Error with API key: ${error.message}`);
        lastError = error;
        
        // Nếu là lỗi quota/rate limit, thử key tiếp theo
        if (error.message.includes('429') || error.message.includes('quota')) {
          continue;
        }
        
        // Nếu là lỗi khác, thử key tiếp theo
        continue;
      }
    }

    // Fallback: chấm local nếu tất cả keys đều fail
    console.warn('All API keys failed, using local grading');
    const localResult = gradeQuizLocal(sessionId, quiz, answers, wpm);
    return res.status(200).json(localResult);

  } catch (error) {
    console.error('Grade quiz error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

