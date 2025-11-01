import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaTrophy,
  FaChartLine,
  FaSpinner,
  FaArrowRight,
  FaArrowLeft,
  FaRedo
} from 'react-icons/fa';
import quizService from '../../services/quizService';
import logger from '../../utils/logger';

const QuizPanel = ({ 
  isVisible, 
  onClose, 
  textId, 
  textContent, 
  wpm = 0,
  onComplete 
}) => {
  // States
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timePerQuestion, setTimePerQuestion] = useState({});
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [sessionId] = useState(() => `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Track time per question
  useEffect(() => {
    if (quiz && !result) {
      const now = Date.now();
      setQuestionStartTime(now);
      
      return () => {
        if (questionStartTime && quiz?.questions?.[currentQuestionIndex]) {
          const qid = quiz.questions[currentQuestionIndex].qid;
          const timeSpent = Date.now() - questionStartTime;
          setTimePerQuestion(prev => ({
            ...prev,
            [qid]: timeSpent
          }));
        }
      };
    }
  }, [currentQuestionIndex, quiz, result, questionStartTime]);

  // Generate quiz khi component mount
  useEffect(() => {
    if (isVisible && !quiz && textId && textContent && !isLoading) {
      generateQuiz();
    }
  }, [isVisible, textId, textContent]);

  // Generate quiz
  const generateQuiz = useCallback(async () => {
    if (!textId || !textContent) return;

    setIsLoading(true);
    try {
      const quizData = await quizService.generateQuiz(textId, textContent, 12);
      setQuiz(quizData);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setResult(null);
      setTimePerQuestion({});
      
      logger.info('QUIZ_PANEL', 'Quiz generated', { 
        quizId: quizData.quizId, 
        questionCount: quizData.questions.length 
      });
    } catch (error) {
      logger.error('QUIZ_PANEL', 'Failed to generate quiz', { error: error.message });
      alert('Không thể tạo quiz. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }, [textId, textContent]);

  // Handle answer selection
  const handleAnswerSelect = (qid, answer) => {
    setAnswers(prev => ({
      ...prev,
      [qid]: answer
    }));
  };

  // Navigate questions
  const goToNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit quiz
  const handleSubmit = async () => {
    if (!quiz) return;

    // Validate: check if all questions answered
    const unanswered = quiz.questions.filter(q => !answers[q.qid]);
    if (unanswered.length > 0) {
      const confirm = window.confirm(
        `Bạn chưa trả lời ${unanswered.length} câu hỏi. Bạn có muốn nộp bài không?`
      );
      if (!confirm) return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert answers to array format
      const answersArray = Object.entries(answers).map(([qid, answer]) => ({
        qid,
        answer
      }));

      // Add unanswered questions with empty answer
      quiz.questions.forEach(q => {
        if (!answers[q.qid]) {
          answersArray.push({ qid: q.qid, answer: '' });
        }
      });

      // Grade quiz
      const gradeResult = await quizService.gradeQuiz(
        sessionId,
        quiz,
        answersArray,
        wpm
      );

      setResult(gradeResult);
      
      // Save result
      quizService.saveQuizResult(textId, gradeResult);

      // Calculate RCI if possible
      const reiHistory = quizService.getREIHistory(textId);
      if (reiHistory.length >= 3) {
        const rci = quizService.calculateRCI(reiHistory);
        gradeResult.rci = rci;
      }

      logger.info('QUIZ_PANEL', 'Quiz submitted', { 
        sessionId,
        comprehensionPercent: gradeResult.comprehensionPercent,
        rei: gradeResult.rei
      });

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(gradeResult);
      }
    } catch (error) {
      logger.error('QUIZ_PANEL', 'Failed to submit quiz', { error: error.message });
      alert('Không thể chấm bài. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset quiz
  const handleReset = () => {
    setQuiz(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
    setTimePerQuestion({});
    generateQuiz();
  };

  if (!isVisible) return null;

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const progress = quiz ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz?.questions?.length || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Bài kiểm tra hiểu biết</h2>
                {quiz && (
                  <p className="text-sm text-blue-100">
                    Câu {currentQuestionIndex + 1}/{totalQuestions} 
                    {answeredCount < totalQuestions && ` • Đã trả lời: ${answeredCount}/${totalQuestions}`}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors text-xl"
              >
                ×
              </button>
            </div>
            
            {/* Progress bar */}
            {quiz && (
              <div className="mt-3 h-2 bg-blue-300 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FaSpinner className="text-4xl text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Đang tạo câu hỏi...</p>
              </div>
            ) : result ? (
              // Result view
              <div className="space-y-6">
                {/* Summary */}
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="text-6xl mb-4"
                  >
                    {result.comprehensionPercent >= 90 ? '🎉' : 
                     result.comprehensionPercent >= 75 ? '👏' : 
                     result.comprehensionPercent >= 60 ? '👍' : '📚'}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Hoàn thành bài kiểm tra!
                  </h3>
                  <p className="text-gray-600">{result.feedback}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <FaChartLine className="text-2xl text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">
                      {result.comprehensionPercent}%
                    </div>
                    <div className="text-sm text-gray-600">Điểm hiểu</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <FaCheckCircle className="text-2xl text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">
                      {result.correctCount}/{result.totalQuestions}
                    </div>
                    <div className="text-sm text-gray-600">Câu đúng</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <FaTrophy className="text-2xl text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">
                      {result.rei.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">REI</div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <FaClock className="text-2xl text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">
                      {result.wpm}
                    </div>
                    <div className="text-sm text-gray-600">WPM</div>
                  </div>
                </div>

                {/* RCI if available */}
                {result.rci && (
                  <div className={`rounded-lg p-4 ${
                    result.rci.isStable ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-800">Độ ổn định (RCI)</div>
                        <div className="text-sm text-gray-600">{result.rci.message}</div>
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        {result.rci.stabilityPercent !== null ? `${result.rci.stabilityPercent}%` : 'N/A'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Per-question results */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Chi tiết từng câu:</h4>
                  {result.perQuestion.map((qResult, idx) => {
                    const question = quiz.questions.find(q => q.qid === qResult.qid);
                    return (
                      <div
                        key={qResult.qid}
                        className={`border rounded-lg p-4 ${
                          qResult.isCorrect 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {qResult.isCorrect ? (
                              <FaCheckCircle className="text-green-600" />
                            ) : (
                              <FaTimesCircle className="text-red-600" />
                            )}
                            <span className="font-semibold text-gray-800">
                              Câu {idx + 1}: {question?.prompt || ''}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 ml-7">
                          <div>
                            <strong>Đáp án của bạn:</strong> {qResult.userAnswer || '(Chưa trả lời)'}
                          </div>
                          {!qResult.isCorrect && (
                            <div>
                              <strong>Đáp án đúng:</strong> {qResult.correct}
                            </div>
                          )}
                          <div className="mt-1 text-gray-700">
                            <strong>Giải thích:</strong> {qResult.explanation || question?.explanation || ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : quiz ? (
              // Quiz view
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {currentQuestion?.prompt || ''}
                  </h3>
                  
                  <div className="space-y-3">
                    {currentQuestion?.options?.map((option, idx) => {
                      const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
                      const isSelected = answers[currentQuestion.qid] === optionLetter;
                      const isCorrect = optionLetter === currentQuestion.correct;
                      const showAnswer = result && result.perQuestion?.find(
                        q => q.qid === currentQuestion.qid
                      );

                      return (
                        <button
                          key={idx}
                          onClick={() => !result && handleAnswerSelect(currentQuestion.qid, optionLetter)}
                          disabled={!!result}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? result
                                ? isCorrect
                                  ? 'bg-green-100 border-green-500'
                                  : 'bg-red-100 border-red-500'
                                : 'bg-blue-100 border-blue-500'
                              : result && isCorrect
                                ? 'bg-green-50 border-green-300'
                                : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                          } ${result ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              isSelected
                                ? result
                                  ? isCorrect
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                                  : 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {optionLetter}
                            </div>
                            <div className="flex-1">{option}</div>
                            {result && isCorrect && (
                              <FaCheckCircle className="text-green-600 text-xl" />
                            )}
                            {result && isSelected && !isCorrect && (
                              <FaTimesCircle className="text-red-600 text-xl" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {result && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-gray-800 mb-1">Giải thích:</div>
                      <div className="text-gray-700">
                        {currentQuestion?.explanation || ''}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer with navigation */}
          {quiz && !result && (
            <div className="border-t p-4 bg-gray-50 flex items-center justify-between">
              <button
                onClick={goToPrevious}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <FaArrowLeft />
                Trước
              </button>

              <div className="flex gap-2">
                {Object.keys(answers).length === totalQuestions ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Đang chấm...
                      </>
                    ) : (
                      <>
                        Nộp bài
                        <FaTrophy />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Đang chấm...' : 'Nộp bài (chưa hoàn thành)'}
                  </button>
                )}
              </div>

              <button
                onClick={goToNext}
                disabled={currentQuestionIndex === quiz.questions.length - 1}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                Sau
                <FaArrowRight />
              </button>
            </div>
          )}

          {/* Footer with result actions */}
          {result && (
            <div className="border-t p-4 bg-gray-50 flex items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaRedo />
                Làm lại
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuizPanel;

