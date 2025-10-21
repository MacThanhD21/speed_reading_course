import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
const GeminiTestComponent = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [testContent, setTestContent] = useState('');
  const VITE_GEMINI_API_KEY = 'AIzaSyD91zxz4hBwMWN73Mz-oTp--ltAYevKcy8';
  const testGeminiAPI = async () => {
    setIsTesting(true);
    setError(null);
    setResult(null);

    try {
      const apiKey = VITE_GEMINI_API_KEY;
      console.log('API Key:', apiKey);
      if (!apiKey) {
        throw new Error('Gemini API key not found in environment variables');
      }

      console.log('Testing Gemini API with key:', apiKey.substring(0, 10) + '...');

          const promptText = testContent.trim() || `Trí tuệ nhân tạo (AI) đang cách mạng hóa ngành giáo dục với những ứng dụng đột phá. Từ việc cá nhân hóa học tập đến tự động hóa chấm điểm, AI mang lại nhiều lợi ích cho cả học sinh và giáo viên.

Các hệ thống AI có thể phân tích phong cách học tập của từng học sinh và điều chỉnh nội dung phù hợp. Ví dụ, một học sinh học tốt qua hình ảnh sẽ nhận được nhiều biểu đồ và sơ đồ hơn, trong khi học sinh thích âm thanh sẽ có nhiều bài giảng audio.

Ngoài ra, AI còn giúp giáo viên tiết kiệm thời gian bằng cách tự động chấm điểm bài tập và đưa ra phản hồi chi tiết. Điều này cho phép giáo viên tập trung vào việc giảng dạy và hỗ trợ học sinh tốt hơn.

Tuy nhiên, việc áp dụng AI trong giáo dục cũng đặt ra những thách thức về quyền riêng tư và đạo đức. Cần có các quy định chặt chẽ để đảm bảo dữ liệu học sinh được bảo vệ và AI được sử dụng một cách có trách nhiệm.`;

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Dựa trên nội dung bài viết sau, hãy tạo 3 câu hỏi trắc nghiệm với 4 lựa chọn mỗi câu để kiểm tra hiểu biết:

Nội dung bài viết:
${promptText}

Yêu cầu:
1. Tạo 3 câu hỏi trắc nghiệm
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
}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Gemini API response:', data);

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedText = data.candidates[0].content.parts[0].text;
        
        // Try to parse JSON from response
        try {
          const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            setResult({
              success: true,
              rawResponse: generatedText,
              parsedData: parsed,
              questions: parsed.questions || []
            });
          } else {
            setResult({
              success: true,
              rawResponse: generatedText,
              parsedData: null,
              questions: []
            });
          }
        } catch (parseError) {
          setResult({
            success: true,
            rawResponse: generatedText,
            parsedData: null,
            questions: [],
            parseError: parseError.message
          });
        }
      } else {
        throw new Error('Invalid response format from Gemini API');
      }

    } catch (err) {
      console.error('Gemini API test error:', err);
      setError(err.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <FaRobot className="text-purple-600" />
            Gemini API Test
          </h1>
          <p className="text-gray-600">
            Test kết nối và chức năng của Gemini API
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaRobot className="text-purple-600" />
              Test Gemini API
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">API Key Status:</p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${import.meta.env.VITE_GEMINI_API_KEY ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">
                  {import.meta.env.VITE_GEMINI_API_KEY ? 
                    `Configured (${import.meta.env.VITE_GEMINI_API_KEY.substring(0, 10)}...)` : 
                    'Not configured'
                  }
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung bài viết để test:
              </label>
              <textarea
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                placeholder="Dán nội dung bài viết vào đây để Gemini tạo câu hỏi... (hoặc để trống để dùng sample)"
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {testContent.length} ký tự
              </p>
            </div>
            
            <button
              onClick={testGeminiAPI}
              disabled={isTesting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isTesting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Testing Gemini API...
                </>
              ) : (
                <>
                  <FaRobot />
                  Test Gemini API
                </>
              )}
            </button>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-green-600" />
              Test Results
            </h2>
            
            {isTesting && (
              <div className="text-center py-8">
                <FaSpinner className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
                <p className="text-gray-600">Đang test Gemini API...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-red-800">
                  <FaExclamationTriangle />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-700 mt-2 text-sm">{error}</p>
              </div>
            )}
            
            {result && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <FaCheckCircle />
                    <span className="font-medium">API Connection Successful!</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    Gemini API đã hoạt động thành công
                  </p>
                </div>
                
                {result.questions && result.questions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Câu hỏi được tạo ({result.questions.length} câu):
                    </h3>
                    <div className="space-y-4">
                      {result.questions.map((question, index) => (
                        <div key={question.id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-medium">
                              Câu {index + 1}
                            </span>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Đáp án: {String.fromCharCode(65 + question.correctAnswer)}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 mb-3">{question.question}</p>
                          <div className="text-sm text-gray-600">
                            <div className="grid grid-cols-1 gap-2">
                              {question.options?.map((option, optIndex) => (
                                <div key={optIndex} className={`p-2 rounded ${
                                  optIndex === question.correctAnswer 
                                    ? 'bg-green-100 border border-green-300 text-green-800 font-medium' 
                                    : 'bg-white border border-gray-200'
                                }`}>
                                  <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span> {option}
                                </div>
                              ))}
                            </div>
                            {question.explanation && (
                              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                                <p className="text-xs text-blue-800">
                                  <span className="font-medium">Giải thích:</span> {question.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    View Raw Response
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                    {result.rawResponse}
                  </pre>
                </details>
              </div>
            )}
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Hướng dẫn sử dụng</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. <strong>API Key đã được cấu hình:</strong> Gemini API key đã được thêm vào file .env</p>
            <p>2. <strong>Test kết nối:</strong> Nhấn nút "Test Gemini API" để kiểm tra</p>
            <p>3. <strong>Kết quả:</strong> Nếu thành công, bạn sẽ thấy câu hỏi được tạo tự động</p>
            <p>4. <strong>Sử dụng:</strong> Bây giờ có thể sử dụng AI Test trong SmartRead</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GeminiTestComponent;
