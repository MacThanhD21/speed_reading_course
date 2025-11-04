import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  FaRedo,
  FaExclamationTriangle
} from 'react-icons/fa';
import quizService from '../../services/quizService';
import logger from '../../utils/logger';
import { useNotification } from '../../context/NotificationContext';
import ConfirmDialog from '../common/ConfirmDialog';

const QuizPanel = ({ 
  isVisible, 
  onClose, 
  textId, 
  textContent, 
  wpm = 0,
  onComplete,
  readingSessionId = null
}) => {
  // States
  const { showError } = useNotification();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timePerQuestion, setTimePerQuestion] = useState({});
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [sessionId] = useState(() => `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [unansweredCount, setUnansweredCount] = useState(0);
  
  // Anti-cheat states
  const [questionTimeLeft, setQuestionTimeLeft] = useState(30); // 30 seconds per question
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [warningCount, setWarningCount] = useState(0);
  const [isTabActive, setIsTabActive] = useState(true);
  const [timedOutQuestions, setTimedOutQuestions] = useState(new Set()); // Track questions that timed out
  const warningTimeoutRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const lastMousePositionRef = useRef({ x: 0, y: 0 });
  const isTimeUpRef = useRef(false); // Track if time is up to prevent double navigation

  // Meme warning messages (30+ funny troll messages)
  const MEME_WARNINGS = [
    "🚨 Đợi đã! Bạn đang đi đâu vậy? 🤔",
    "👀 Hmm... bạn đang làm gì ở đó? 😏",
    "🤨 Tôi thấy bạn rồi! Quay lại làm bài đi!",
    "💭 'Để tôi Google câu này...' - Không được đâu bạn ơi! 😂",
    "🎭 Diễn xuất hay lắm nhưng tôi biết bạn đang check GPT!",
    "🧠 Dùng não của bạn, không phải Google!",
    "🔍 Tìm kiếm gì vậy? Câu trả lời nằm trong bài đọc đó!",
    "😎 Bạn nghĩ bạn khôn hơn tôi sao? Tôi biết bạn đang làm gì!",
    "🎪 Có vẻ như bạn đang tìm kiếm 'đáp án' trên Google nhỉ?",
    "🤡 Bạn đang làm gì ở tab khác vậy? Quay lại thôi!",
    "🎯 Focus! Focus! Đừng phân tâm!",
    "💡 Gợi ý: Câu trả lời nằm trong đầu bạn, không phải ChatGPT!",
    "🚫 Không, không được check GPT đâu!",
    "👮‍♂️ Tôi là cảnh sát quiz đây! Quay lại làm bài ngay!",
    "🎭 Act tự nhiên thôi bạn, tôi biết bạn đang làm gì!",
    "🤖 'Hey ChatGPT...' - Nope! Không được!",
    "🕵️ Tôi phát hiện bạn rồi! Quay lại thôi!",
    "🎪 Cuộc sống không phải là Google, câu trả lời nằm trong bạn!",
    "😤 Bạn nghĩ tôi không biết bạn đang làm gì sao?",
    "🎬 Đây không phải phim, bạn không thể 'pause' để check đáp án!",
    "🧐 Bạn đang tìm kiếm điều gì? Tôi tò mò quá!",
    "🎯 Mục tiêu: Hoàn thành quiz mà không cần Google!",
    "🤔 Bạn đang nghĩ về điều gì ở tab khác vậy?",
    "🎨 Sáng tạo quá! Nhưng không được check đáp án đâu!",
    "🚀 Tập trung! Bạn gần đến đích rồi!",
    "🎭 Phim hay nhưng phải quay lại làm bài!",
    "🤖 AI không thể giúp bạn đâu, tự tin lên!",
    "💪 Bạn làm được mà! Không cần Google!",
    "🎯 Mục tiêu: Đạt điểm cao mà không cần cheat!",
    "😎 Cool! Nhưng quay lại làm bài đi!",
    "🎪 Bạn đang làm gì ở đó? Tò mò quá!",
    "🤡 Không được check đáp án! Tôi biết bạn đang làm gì!",
    "🎬 Đây là quiz, không phải game bạn có thể 'hack'!",
    "🔍 Tìm kiếm gì? Câu trả lời nằm trong bài đọc!",
    "💡 Insight: Bạn đã đọc bài rồi, tự tin vào bản thân đi!",
    "🎯 Focus! Bạn đang làm quiz chứ không phải lướt web!",
    "🚨 Cảnh báo: Tôi biết bạn đang làm gì!",
    "🎪 Show hay nhưng phải quay lại làm bài!",
    "🤖 ChatGPT không thể giúp bạn trong quiz này!",
    "💪 Bạn mạnh mẽ hơn bạn nghĩ! Không cần Google!",
    "🎭 Act tự nhiên! Tôi biết bạn đang check GPT! 😂",
    "🔍 Tìm kiếm gì? Tôi tò mò quá!",
    "🎯 Mục tiêu: Hoàn thành quiz một cách trung thực!",
    "🤔 Bạn đang nghĩ về điều gì? Quay lại làm bài!",
    "🎨 Sáng tạo nhưng không được check đáp án!",
    "🚀 Tập trung! Bạn gần đến đích rồi!",
    "🎪 Phim hay nhưng phải quay lại làm bài!",
    "🤖 AI không thể thay thế kiến thức của bạn!",
    "💪 Bạn làm được mà! Tin vào bản thân!",
    "🎯 Mục tiêu: Đạt điểm cao nhờ kiến thức thật!",
  ];

  // Get random warning message
  const getRandomWarning = () => {
    return MEME_WARNINGS[Math.floor(Math.random() * MEME_WARNINGS.length)];
  };

  // Format time display
  const formatTime = (seconds) => {
    return `${seconds.toString().padStart(2, '0')}`;
  };

  // Trigger warning
  const triggerWarning = useCallback(() => {
    if (showWarning) return; // Don't stack warnings
    
    const newCount = warningCount + 1;
    setWarningCount(newCount);
    setWarningMessage(getRandomWarning());
    setShowWarning(true);

    // Auto-hide after 3 seconds
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(false);
    }, 3000);

    // After 5 warnings, consider auto-submitting (optional)
    if (newCount >= 5) {
      logger.warn('QUIZ_PANEL', 'Multiple warnings detected', { count: newCount });
    }
  }, [showWarning, warningCount]);

  // Timer effect - Countdown 30s per question
  useEffect(() => {
    if (quiz && !result && !isLoading) {
      // Clear any existing timer first
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      
      // Check if current question has timed out
      const currentQuestion = quiz.questions[currentQuestionIndex];
      const currentQid = currentQuestion?.qid;
      
      if (currentQid && timedOutQuestions.has(currentQid)) {
        // Question already timed out, don't start timer
        setQuestionTimeLeft(0);
        isTimeUpRef.current = true;
        return;
      }
      
      // Reset timer and flags when question changes (only for non-timed-out questions)
      setQuestionTimeLeft(30);
      isTimeUpRef.current = false;
      
      // Start new timer only if question hasn't timed out
      // Store currentQid in a variable to avoid closure issues
      const qidForTimer = currentQid;
      const currentIndexForTimer = currentQuestionIndex;
      
      timerIntervalRef.current = setInterval(() => {
        setQuestionTimeLeft(prev => {
          if (prev <= 1 && !isTimeUpRef.current) {
            // Time's up! Mark as time up to prevent double trigger
            isTimeUpRef.current = true;
            
            // Clear interval immediately
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            
            // Mark this question as timed out
            if (qidForTimer) {
              setTimedOutQuestions(prev => new Set(prev).add(qidForTimer));
              
              // Remove answer if exists (question is blank by default)
              setAnswers(prev => {
                const newAnswers = { ...prev };
                delete newAnswers[qidForTimer];
                return newAnswers;
              });
            }
            
            // Auto move to next question if not last question
            if (quiz && currentIndexForTimer < quiz.questions.length - 1) {
              // Use setTimeout to ensure state updates are processed
              setTimeout(() => {
                setCurrentQuestionIndex(prev => {
                  // Double check to prevent jumping
                  if (prev < quiz.questions.length - 1) {
                    return prev + 1;
                  }
                  return prev;
                });
              }, 100);
            } else {
              // Last question - show warning
              triggerWarning();
              setQuestionTimeLeft(0);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [quiz, result, isLoading, currentQuestionIndex, triggerWarning, timedOutQuestions]);

  // Anti-cheat detection
  useEffect(() => {
    if (!quiz || result || isLoading) return;

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 || e.clientX <= 0 || 
          e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        triggerWarning();
      }
    };

    const handleMouseMove = (e) => {
      lastMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabActive(false);
        triggerWarning();
      } else {
        setIsTabActive(true);
      }
    };

    const handleBlur = () => {
      triggerWarning();
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerWarning();
      return false;
    };

    const handleKeyDown = (e) => {
      // Block common shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'f') {
          e.preventDefault();
          triggerWarning();
        }
      }
      // Block F12, Ctrl+Shift+I (DevTools)
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        triggerWarning();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [quiz, result, isLoading, triggerWarning]);

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
      setQuestionTimeLeft(30);
      setWarningCount(0);
      setShowWarning(false);
      setTimedOutQuestions(new Set()); // Reset timed out questions
      
      logger.info('QUIZ_PANEL', 'Quiz generated', { 
        quizId: quizData.quizId, 
        questionCount: quizData.questions.length 
      });
    } catch (error) {
      logger.error('QUIZ_PANEL', 'Failed to generate quiz', { error: error.message });
      showError('Không thể tạo quiz. Vui lòng thử lại sau.', 'Lỗi');
    } finally {
      setIsLoading(false);
    }
  }, [textId, textContent]);

  // Handle answer selection
  const handleAnswerSelect = (qid, answer) => {
    // Don't allow answer selection if question has timed out
    if (timedOutQuestions.has(qid)) {
      return;
    }
    setAnswers(prev => ({
      ...prev,
      [qid]: answer
    }));
  };

  // Navigate questions
  const goToNext = useCallback(() => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      // Check if next question has timed out
      const nextQuestionIndex = currentQuestionIndex + 1;
      const nextQuestion = quiz.questions[nextQuestionIndex];
      const nextQid = nextQuestion?.qid;
      
      // If next question timed out, set flag as true
      if (nextQid && timedOutQuestions.has(nextQid)) {
        isTimeUpRef.current = true;
      } else {
        isTimeUpRef.current = false;
      }
      
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [quiz, currentQuestionIndex, timedOutQuestions]);

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      // Check if previous question has timed out
      const prevQuestionIndex = currentQuestionIndex - 1;
      const prevQuestion = quiz?.questions?.[prevQuestionIndex];
      const prevQid = prevQuestion?.qid;
      
      // If previous question timed out, keep flag as true
      if (prevQid && timedOutQuestions.has(prevQid)) {
        isTimeUpRef.current = true;
      } else {
        isTimeUpRef.current = false;
      }
      
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit quiz
  const handleSubmit = async () => {
    if (!quiz) return;

    // Validate: check if all questions answered
    const unanswered = quiz.questions.filter(q => !answers[q.qid]);
    if (unanswered.length > 0) {
      setUnansweredCount(unanswered.length);
      setConfirmAction(() => () => {
        submitQuiz();
      });
      setIsConfirmDialogOpen(true);
      return;
    }
    
    submitQuiz();
  };

  const submitQuiz = async () => {

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
        // Pass full gradeResult with readingSessionId if available
        onComplete({
          ...gradeResult,
          readingSessionId: readingSessionId,
          quizType: 'mcq',
        });
      }
    } catch (error) {
      logger.error('QUIZ_PANEL', 'Failed to submit quiz', { error: error.message });
      showError('Không thể chấm bài. Vui lòng thử lại sau.', 'Lỗi');
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
    setQuestionTimeLeft(30);
    setWarningCount(0);
    setShowWarning(false);
    setTimedOutQuestions(new Set()); // Reset timed out questions
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    generateQuiz();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const progress = quiz ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz?.questions?.length || 0;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="quiz-panel-overlay"
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
          <div className="bg-gradient-to-r from-[#1A66CC] to-[#124A9D] p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">Bài kiểm tra hiểu biết</h2>
                  {quiz && !result && (
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
                      questionTimeLeft <= 10 
                        ? 'bg-red-600 bg-opacity-90 animate-pulse' 
                        : questionTimeLeft <= 15
                        ? 'bg-yellow-600 bg-opacity-70'
                        : 'bg-blue-600 bg-opacity-50'
                    }`}>
                      <FaClock className="text-sm" />
                      <span className={`text-sm font-mono font-bold ${
                        questionTimeLeft <= 10 ? 'text-white' : 'text-white'
                      }`}>
                        {formatTime(questionTimeLeft)}s
                      </span>
                    </div>
                  )}
                </div>
                {quiz && (
                  <p className="text-sm text-blue-50 mt-1">
                    Câu {currentQuestionIndex + 1}/{totalQuestions} 
                    {answeredCount < totalQuestions && ` • Đã trả lời: ${answeredCount}/${totalQuestions}`}
                    {warningCount > 0 && !result && (
                      <span className="ml-2 text-yellow-300">⚠️ Cảnh báo: {warningCount}</span>
                    )}
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
              <div className="mt-3 h-2 bg-blue-200 rounded-full overflow-hidden">
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
                <FaSpinner className="text-4xl text-[#1A66CC] animate-spin mb-4" />
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
                    <FaChartLine className="text-2xl text-[#1A66CC] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">
                      {result.comprehensionPercent}%
                    </div>
                    <div className="text-sm text-gray-600">Điểm hiểu</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <FaCheckCircle className="text-2xl text-[#34D399] mx-auto mb-2" />
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
                    // Ensure unique key - use idx as fallback if qid is missing/duplicate
                    const uniqueKey = qResult.qid || `q-${idx}`;
                    return (
                      <div
                        key={`result-${uniqueKey}-${idx}`}
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
                  
                  {/* Time out warning */}
                  {currentQuestion?.qid && timedOutQuestions.has(currentQuestion.qid) && (
                    <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700">
                        <FaTimesCircle className="text-xl" />
                        <span className="font-semibold">Đã hết thời gian cho câu hỏi này. Câu trả lời sẽ bỏ trống.</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {currentQuestion?.options?.map((option, idx) => {
                      const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
                      const isSelected = answers[currentQuestion.qid] === optionLetter;
                      const isCorrect = optionLetter === currentQuestion.correct;
                      const showAnswer = result && result.perQuestion?.find(
                        q => q.qid === currentQuestion.qid
                      );
                      const isTimedOut = currentQuestion?.qid && timedOutQuestions.has(currentQuestion.qid);
                      // Ensure unique key with question qid + option index
                      const uniqueKey = currentQuestion.qid ? `${currentQuestion.qid}-option-${idx}` : `q${currentQuestionIndex}-opt${idx}`;

                      return (
                        <button
                          key={uniqueKey}
                          onClick={() => !result && !isTimedOut && handleAnswerSelect(currentQuestion.qid, optionLetter)}
                          disabled={!!result || isTimedOut}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            isTimedOut
                              ? 'bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? result
                                ? isCorrect
                                  ? 'bg-green-100 border-green-500'
                                  : 'bg-red-100 border-red-500'
                                : 'bg-blue-100 border-[#1A66CC]'
                              : result && isCorrect
                                ? 'bg-green-50 border-green-300'
                                : 'bg-gray-50 border-gray-200 hover:border-[#1A66CC]'
                          } ${result || isTimedOut ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              isTimedOut
                                ? 'bg-gray-300 text-gray-500'
                                : isSelected
                                ? result
                                  ? isCorrect
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                                  : 'bg-[#1A66CC] text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {optionLetter}
                            </div>
                            <div className="flex-1">{option}</div>
                            {result && isCorrect && (
                              <FaCheckCircle className="text-[#34D399] text-xl" />
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
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
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
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#1A66CC] to-[#124A9D] text-white hover:from-[#1555B0] hover:to-[#0F3F87] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                className="px-6 py-2 rounded-lg bg-[#1A66CC] text-white hover:bg-[#1555B0] transition-colors flex items-center gap-2"
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

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => {
            setIsConfirmDialogOpen(false);
            setConfirmAction(null);
            setUnansweredCount(0);
          }}
          onConfirm={() => {
            if (confirmAction) {
              confirmAction();
            }
          }}
          title="Xác nhận nộp bài"
          message={`Bạn chưa trả lời ${unansweredCount} câu hỏi. Bạn có muốn nộp bài không?`}
          confirmText="Nộp bài"
          cancelText="Hủy"
          type="warning"
        />

        {/* Anti-cheat Warning Popup */}
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-4 rounded-2xl shadow-2xl max-w-md w-full mx-4 border-4 border-white"
              style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
            >
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    <FaExclamationTriangle className="text-3xl text-yellow-500" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-800">Cảnh báo!</h3>
                </div>
                <p className="text-gray-700 text-lg font-semibold mb-4">
                  {warningMessage}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>⚠️ Quay lại làm bài ngay!</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {formatTime(questionTimeLeft)}s
                  </span>
                </div>
                {warningCount >= 3 && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-semibold">
                      ⚠️ Bạn đã nhận {warningCount} cảnh báo! Tiếp tục có thể bị tự động nộp bài.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuizPanel;

