/**
 * Vercel Serverless Function - Generate Quiz via Gemini API
 * POST /api/proxy/generate-quiz
 * 
 * Request body: { textId, textContent, n }
 * Response: { quizId, textId, questions, generatedAt }
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
        temperature: 0.2, // Thấp để output ổn định
        maxOutputTokens: 4000,
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

// Prompt tạo quiz (theo yêu cầu)
function createQuizPrompt(textId, textContent, n = 12) {
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

export default async function handler(req, res) {
  // Chỉ cho phép POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { textId, textContent, n = 12 } = req.body;

    // Validate input
    if (!textId || !textContent) {
      return res.status(400).json({ 
        error: 'Missing required fields: textId and textContent are required' 
      });
    }

    // Validate n
    const questionCount = Math.min(Math.max(parseInt(n) || 12, 10), 15);

    // Tạo prompt
    const prompt = createQuizPrompt(textId, textContent, questionCount);

    // Thử các API keys
    const apiKeys = getApiKeys();
    let lastError = null;

    for (const apiKey of apiKeys) {
      try {
        // Gọi Gemini
        const responseText = await callGemini(prompt, apiKey.trim());
        
        // Parse JSON
        const quizData = parseJSONResponse(responseText);
        
        if (!quizData || !quizData.questions) {
          throw new Error('Invalid quiz format from Gemini');
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

        return res.status(200).json(quiz);
        
      } catch (error) {
        console.error(`Error with API key: ${error.message}`);
        lastError = error;
        
        // Nếu là lỗi quota/rate limit, thử key tiếp theo
        if (error.message.includes('429') || error.message.includes('quota')) {
          continue;
        }
        
        // Nếu là lỗi khác, thử key tiếp theo nhưng log lại
        continue;
      }
    }

    // Nếu tất cả keys đều fail
    return res.status(500).json({ 
      error: 'All API keys failed',
      details: lastError?.message || 'Unknown error'
    });

  } catch (error) {
    console.error('Generate quiz error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

