import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaBrain, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import questionGenerationService from '../../services/questionGenerationService';

const AITestComponent = () => {
  const [testContent, setTestContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const sampleContent = {
    title: "Trí tuệ nhân tạo trong giáo dục",
    content: `Trí tuệ nhân tạo (AI) đang cách mạng hóa ngành giáo dục với những ứng dụng đột phá. Từ việc cá nhân hóa học tập đến tự động hóa chấm điểm, AI mang lại nhiều lợi ích cho cả học sinh và giáo viên.

Các hệ thống AI có thể phân tích phong cách học tập của từng học sinh và điều chỉnh nội dung phù hợp. Ví dụ, một học sinh học tốt qua hình ảnh sẽ nhận được nhiều biểu đồ và sơ đồ hơn, trong khi học sinh thích âm thanh sẽ có nhiều bài giảng audio.

Ngoài ra, AI còn giúp giáo viên tiết kiệm thời gian bằng cách tự động chấm điểm bài tập và đưa ra phản hồi chi tiết. Điều này cho phép giáo viên tập trung vào việc giảng dạy và hỗ trợ học sinh tốt hơn.

Tuy nhiên, việc áp dụng AI trong giáo dục cũng đặt ra những thách thức về quyền riêng tư và đạo đức. Cần có các quy định chặt chẽ để đảm bảo dữ liệu học sinh được bảo vệ và AI được sử dụng một cách có trách nhiệm.`
  };

  const testAI = async () => {
    setIsGenerating(true);
    setError(null);
    setResults(null);

    try {
      const content = testContent ? { content: testContent } : sampleContent;
      const questions = await questionGenerationService.generateQuestions(content);
      
      if (questions && questions.length > 0) {
        setResults({
          success: true,
          questions: questions,
          count: questions.length,
          source: 'AI Generated'
        });
      } else {
        setError('Không thể tạo câu hỏi từ AI. Vui lòng kiểm tra API key.');
      }
    } catch (err) {
      setError(`Lỗi: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const testLocal = () => {
    setIsGenerating(true);
    setError(null);
    setResults(null);

    try {
      const content = testContent ? { content: testContent } : sampleContent;
      
      // Simulate local generation
      setTimeout(() => {
        const localQuestions = [
          {
            id: 1,
            type: '5W1H',
            category: 'What',
            question: 'Trí tuệ nhân tạo đang làm gì trong giáo dục?',
            options: ['Cách mạng hóa ngành giáo dục', 'Thay thế giáo viên', 'Tự động hóa hoàn toàn', 'Giảm chất lượng học tập'],
            correctAnswer: 0,
            explanation: 'AI đang cách mạng hóa giáo dục với nhiều ứng dụng đột phá.'
          },
          {
            id: 2,
            type: 'MCQ',
            category: 'General',
            question: 'AI có thể làm gì để cá nhân hóa học tập?',
            options: ['Phân tích phong cách học tập', 'Thay thế giáo viên', 'Tự động chấm điểm', 'Tất cả các đáp án trên'],
            correctAnswer: 0,
            explanation: 'AI phân tích phong cách học tập để điều chỉnh nội dung phù hợp.'
          }
        ];
        
        setResults({
          success: true,
          questions: localQuestions,
          count: localQuestions.length,
          source: 'Local Generation'
        });
        setIsGenerating(false);
      }, 1000);
    } catch (err) {
      setError(`Lỗi: ${err.message}`);
      setIsGenerating(false);
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
            <FaRobot className="text-blue-600" />
            AI Question Generation Test
          </h1>
          <p className="text-gray-600">
            Test chức năng tạo câu hỏi bằng AI (ChatGPT/Gemini) và so sánh với local generation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaBrain className="text-purple-600" />
              Test Content
            </h2>
            
            <textarea
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              placeholder="Nhập nội dung bài viết để test AI (hoặc để trống để dùng sample)..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            
            <div className="flex gap-3">
              <button
                onClick={testAI}
                disabled={isGenerating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Testing AI...
                  </>
                ) : (
                  <>
                    <FaRobot />
                    Test AI
                  </>
                )}
              </button>
              
              <button
                onClick={testLocal}
                disabled={isGenerating}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Test Local
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-green-600" />
              Results
            </h2>
            
            {isGenerating && (
              <div className="text-center py-8">
                <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Đang tạo câu hỏi...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-red-800">
                  <FaExclamationTriangle />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-700 mt-2">{error}</p>
              </div>
            )}
            
            {results && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <FaCheckCircle />
                    <span className="font-medium">Success!</span>
                  </div>
                  <p className="text-green-700">
                    Generated {results.count} questions using {results.source}
                  </p>
                </div>
                
                <div className="space-y-3">
                  {results.questions.slice(0, 3).map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {question.type}
                        </span>
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {question.category}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                      <div className="text-sm text-gray-600">
                        <p className="mb-1">Options:</p>
                        <ul className="list-disc list-inside ml-4">
                          {question.options.map((option, optIndex) => (
                            <li key={optIndex} className={optIndex === question.correctAnswer ? 'text-green-600 font-medium' : ''}>
                              {option}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-xs text-gray-500">{question.explanation}</p>
                      </div>
                    </div>
                  ))}
                  
                  {results.questions.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      ... và {results.questions.length - 3} câu hỏi khác
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* API Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4">API Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${import.meta.env.VITE_OPENAI_API_KEY ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                OpenAI API: {import.meta.env.VITE_OPENAI_API_KEY ? 'Configured' : 'Not configured'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${import.meta.env.VITE_GEMINI_API_KEY ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                Gemini API: {import.meta.env.VITE_GEMINI_API_KEY ? 'Configured' : 'Not configured'}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Để cấu hình API keys, tạo file .env với VITE_OPENAI_API_KEY hoặc VITE_GEMINI_API_KEY
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AITestComponent;
