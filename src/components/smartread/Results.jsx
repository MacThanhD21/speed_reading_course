import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaChartLine, FaLightbulb, FaRedo, FaHome, FaCheck, FaTimes, FaEye, FaRobot, FaSpinner } from 'react-icons/fa';
import recommendationService from '../../services/recommendationService';

const Results = ({ readingData, quizData, onRestart, onGoHome }) => {
  // Check if data exists, otherwise use defaults
  if (!readingData || !quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Không tìm thấy dữ liệu
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng quay lại và thực hiện lại bài đọc và quiz.
          </p>
          <button
            onClick={onRestart}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center mx-auto"
          >
            <FaRedo className="mr-2" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const { finalWPM, wordsRead, elapsedTime, averageWPM } = readingData;
  const { score, correctAnswers, totalQuestions, questions, answers } = quizData;
  
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [showDetailedQuiz, setShowDetailedQuiz] = useState(false);

  // Calculate consistency flag
  const isConsistent = !(finalWPM > 450 && score < 60);
  const consistencyMessage = isConsistent 
    ? "Tốc độ đọc và khả năng hiểu biết của bạn khá nhất quán!"
    : "Chúng tôi nhận thấy tốc độ đọc cao nhưng khả năng hiểu biết thấp. Hãy thử đọc chậm hơn và sử dụng kỹ thuật đọc có nhịp điệu.";

  // Calculate reading level
  const getReadingLevel = (wpm) => {
    if (wpm < 200) return { level: "Chậm", color: "text-red-600", bg: "bg-red-100" };
    if (wpm < 300) return { level: "Trung bình", color: "text-yellow-600", bg: "bg-yellow-100" };
    if (wpm < 400) return { level: "Nhanh", color: "text-green-600", bg: "bg-green-100" };
    return { level: "Rất nhanh", color: "text-blue-600", bg: "bg-blue-100" };
  };

  const readingLevel = getReadingLevel(finalWPM);

  // Calculate comprehension level
  const getComprehensionLevel = (score) => {
    if (score < 60) return { level: "Cần cải thiện", color: "text-red-600", bg: "bg-red-100" };
    if (score < 80) return { level: "Khá tốt", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { level: "Xuất sắc", color: "text-green-600", bg: "bg-green-100" };
  };

  const comprehensionLevel = getComprehensionLevel(score);

  // Generate AI recommendations
  const generateAIRecommendations = async () => {
    setIsGeneratingRecommendations(true);
    try {
      const content = JSON.parse(sessionStorage.getItem('smartread-content') || 'null');
      if (!content) {
        console.log('No content found in sessionStorage');
        return;
      }

      console.log('Generating AI recommendations...');
      const recommendations = await recommendationService.generateRecommendations(
        readingData, 
        quizData, 
        content
      );
      
      console.log('Generated recommendations:', recommendations);
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      // Fallback recommendations will be handled by the service
      setAiRecommendations({
        overview: "Dựa trên kết quả của bạn, chúng tôi đưa ra một số khuyến nghị cải thiện.",
        strengths: ["Tốc độ đọc ổn định", "Hoàn thành bài kiểm tra"],
        weaknesses: ["Cần cải thiện độ chính xác", "Tăng cường tập trung"],
        recommendations: ["Luyện tập đọc hàng ngày", "Sử dụng kỹ thuật đọc có nhịp điệu"],
        exercises: ["Đọc và tóm tắt", "Luyện tập với timer"]
      });
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  // Get detailed quiz analysis
  const getDetailedQuizAnalysis = () => {
    console.log('Quiz data:', quizData);
    console.log('Questions:', questions);
    console.log('Answers:', answers);
    
    if (!questions || !answers) {
      console.log('Missing questions or answers data');
      return null;
    }

    const analysis = questions.map((question, index) => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      return {
        questionNumber: index + 1,
        question: question.question,
        userAnswer: userAnswer !== undefined ? question.options[userAnswer] : 'Chưa trả lời',
        correctAnswer: question.options[question.correctAnswer],
        isCorrect,
        explanation: question.explanation || 'Không có giải thích'
      };
    });

    console.log('Analysis:', analysis);
    return analysis;
  };

  // Auto-generate recommendations on component mount
  useEffect(() => {
    generateAIRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <FaTrophy className="text-6xl text-yellow-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Kết quả phiên đọc
          </h1>
          <p className="text-gray-600">
            Đây là kết quả đánh giá tốc độ đọc và khả năng hiểu biết của bạn
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Main Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* WPM Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 text-center"
            >
              <FaChartLine className="text-3xl text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {finalWPM}
              </div>
              <div className="text-sm text-gray-500 mb-2">Từ/phút</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${readingLevel.bg} ${readingLevel.color}`}>
                {readingLevel.level}
              </div>
            </motion.div>

            {/* Comprehension Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 text-center"
            >
              <FaLightbulb className="text-3xl text-green-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {score}%
              </div>
              <div className="text-sm text-gray-500 mb-2">Hiểu biết</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${comprehensionLevel.bg} ${comprehensionLevel.color}`}>
                {comprehensionLevel.level}
              </div>
            </motion.div>

            {/* Words Read */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 text-center"
            >
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {wordsRead}
              </div>
              <div className="text-sm text-gray-500">Từ đã đọc</div>
            </motion.div>

            {/* Time Spent */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 text-center"
            >
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-500">Thời gian</div>
            </motion.div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Reading Analysis */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Phân tích tốc độ đọc
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tốc độ cuối:</span>
                  <span className="font-semibold">{finalWPM} WPM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tốc độ trung bình:</span>
                  <span className="font-semibold">{averageWPM} WPM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng từ đã đọc:</span>
                  <span className="font-semibold">{wordsRead} từ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Thời gian đọc:</span>
                  <span className="font-semibold">{Math.floor(elapsedTime / 60)} phút {elapsedTime % 60} giây</span>
                </div>
              </div>
            </motion.div>

            {/* Quiz Analysis */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Phân tích bài kiểm tra
                </h3>
                <button
                  onClick={() => setShowDetailedQuiz(!showDetailedQuiz)}
                  className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <FaEye className="mr-1" />
                  {showDetailedQuiz ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Điểm số:</span>
                  <span className="font-semibold">{score}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Câu đúng:</span>
                  <span className="font-semibold">{correctAnswers}/{totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mức độ hiểu biết:</span>
                  <span className={`font-semibold ${comprehensionLevel.color}`}>
                    {comprehensionLevel.level}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tỷ lệ thành công:</span>
                  <span className="font-semibold">{Math.round((correctAnswers / totalQuestions) * 100)}%</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Consistency Check */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`rounded-xl shadow-lg p-6 mb-8 ${
              isConsistent ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex items-start">
              <div className={`p-2 rounded-full mr-4 ${
                isConsistent ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                {isConsistent ? (
                  <FaCheck className="text-green-600" />
                ) : (
                  <FaLightbulb className="text-yellow-600" />
                )}
              </div>
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  isConsistent ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {isConsistent ? 'Đánh giá tích cực' : 'Cần cải thiện'}
                </h3>
                <p className={`${
                  isConsistent ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {consistencyMessage}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Detailed Quiz Analysis */}
          {showDetailedQuiz && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-8"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Chi tiết từng câu hỏi
              </h3>
              
              {getDetailedQuizAnalysis() ? (
                <div className="space-y-6">
                  {getDetailedQuizAnalysis().map((item, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    item.isCorrect 
                      ? 'bg-green-50 border-green-400' 
                      : 'bg-red-50 border-red-400'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-700 mr-2">
                          Câu {item.questionNumber}:
                        </span>
                        {item.isCorrect ? (
                          <FaCheck className="text-green-600 mr-2" />
                        ) : (
                          <FaTimes className="text-red-600 mr-2" />
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.isCorrect 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.isCorrect ? 'Đúng' : 'Sai'}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-gray-800 font-medium mb-2">
                        {item.question}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Đáp án của bạn:</span>
                        <p className={`mt-1 p-2 rounded ${
                          item.isCorrect 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.userAnswer}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Đáp án đúng:</span>
                        <p className="mt-1 p-2 rounded bg-blue-100 text-blue-800">
                          {item.correctAnswer}
                        </p>
                      </div>
                    </div>
                    
                    {item.explanation && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <span className="font-medium text-gray-600">Giải thích:</span>
                        <p className="mt-1 text-gray-700">{item.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaEye className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Không có dữ liệu chi tiết về câu hỏi
                  </p>
                  <p className="text-sm text-gray-500">
                    Dữ liệu quiz có thể chưa được lưu trữ đầy đủ hoặc đã bị mất.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* AI Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaRobot className="mr-2 text-blue-600" />
                Khuyến nghị AI cá nhân hóa
              </h3>
              {isGeneratingRecommendations && (
                <div className="flex items-center text-blue-600">
                  <FaSpinner className="animate-spin mr-2" />
                  Đang tạo khuyến nghị...
                </div>
              )}
            </div>
            
            {aiRecommendations ? (
              <div className="space-y-6">
                {/* Overview */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Đánh giá tổng quan</h4>
                  <p className="text-blue-700">{aiRecommendations.overview}</p>
                </div>
                
                {/* Strengths and Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Điểm mạnh</h4>
                    <ul className="text-green-700 space-y-1">
                      {aiRecommendations.strengths?.map((strength, index) => (
                        <li key={index}>• {strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Cần cải thiện</h4>
                    <ul className="text-yellow-700 space-y-1">
                      {aiRecommendations.weaknesses?.map((weakness, index) => (
                        <li key={index}>• {weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Recommendations */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Khuyến nghị cụ thể</h4>
                  <ul className="text-purple-700 space-y-1">
                    {aiRecommendations.recommendations?.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Exercises */}
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-indigo-800 mb-2">Bài tập luyện tập</h4>
                  <ul className="text-indigo-700 space-y-1">
                    {aiRecommendations.exercises?.map((exercise, index) => (
                      <li key={index}>• {exercise}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaRobot className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {isGeneratingRecommendations 
                    ? 'Đang phân tích kết quả và tạo khuyến nghị...' 
                    : 'Không thể tạo khuyến nghị AI. Vui lòng thử lại.'
                  }
                </p>
                {!isGeneratingRecommendations && (
                  <button
                    onClick={generateAIRecommendations}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Thử lại
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={onRestart}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <FaRedo className="mr-2" />
              Thử lại với văn bản khác
            </button>
            <button
              onClick={onGoHome}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <FaHome className="mr-2" />
              Về trang chủ
            </button>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default Results;
