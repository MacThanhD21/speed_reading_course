import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBook, FaLightbulb, FaQuestionCircle, FaEdit, FaCheck, 
  FaTimes, FaSpinner, FaEye, FaGraduationCap, FaRocket, FaClock, FaRedo
} from 'react-icons/fa';
import stepByStepAnalysisService from '../../services/stepByStepAnalysisService';
import readingTipsService from '../../services/readingTipsService';

const LearningPanel = ({ title, content, isVisible, onClose, readingProgress = 'start', readingData = {}, fiveWOneHQuestions = [], isLoading5W1H = false }) => {
  // State for different phases
  const [conceptsData, setConceptsData] = useState(null);
  const [fiveWOneHData, setFiveWOneHData] = useState(null);
  const [mcqData, setMcQData] = useState(null);
  const [shortPromptsData, setShortPromptsData] = useState(null);
  
  // Reading tips state
  const [readingTips, setReadingTips] = useState([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [tipsError, setTipsError] = useState(null);
  
  // Loading states for each phase
  const [isLoadingConcepts, setIsLoadingConcepts] = useState(false);
  const [isLoadingFiveWOneH, setIsLoadingFiveWOneH] = useState(false);
  const [isLoadingMCQ, setIsLoadingMCQ] = useState(false);
  const [isLoadingShortPrompts, setIsLoadingShortPrompts] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState('reading_tips');
  const [studentAnswers, setStudentAnswers] = useState({});
  const [gradingResults, setGradingResults] = useState({});
  const [fiveWOneHCompleted, setFiveWOneHCompleted] = useState(false);

  useEffect(() => {
    if (isVisible && content) {
      // Load reading tips immediately when panel opens
      if (readingTips.length === 0) {
        loadReadingTips();
      }
      
      // Load concepts immediately when panel opens
      if (!conceptsData) {
        loadConcepts();
      }
      
      // Use 5W1H questions from props if available
      if (fiveWOneHQuestions.length > 0) {
        setFiveWOneHData({ fiveWoneH: fiveWOneHQuestions });
        setActiveTab('fiveWoneH');
      } else if ((readingProgress === 'finished_reading' || readingProgress === 'in_progress') && !fiveWOneHData) {
        loadFiveWOneH();
      }
      
      if (readingProgress === 'finished_all' && !mcqData) {
        loadMCQ();
      }
      
      if (readingProgress === 'finished_all' && !shortPromptsData) {
        loadShortPrompts();
      }
    }
  }, [isVisible, content, readingProgress, readingData, fiveWOneHQuestions]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isVisible) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      // Re-enable body scroll
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isVisible]);

  // Load reading tips
  const loadReadingTips = async () => {
    if (!content) return;
    
    setTipsLoading(true);
    setTipsError(null);
    
    try {
      const tips = await readingTipsService.generateReadingTips(content, readingData);
      setReadingTips(tips);
    } catch (error) {
      console.error('Error loading reading tips:', error);
      setTipsError('Không thể tải mẹo đọc');
      // Fallback to default tips
      setReadingTips([
        {
          id: 1,
          title: "Đọc với tốc độ thoải mái",
          description: "Hãy đọc ở tốc độ bạn cảm thấy thoải mái và có thể hiểu nội dung",
          icon: "🐌"
        },
        {
          id: 2,
          title: "Tập trung vào nội dung",
          description: "Loại bỏ các yếu tố gây phân tán và tập trung vào bài đọc",
          icon: "🎯"
        },
        {
          id: 3,
          title: "Nhấn 'Hoàn thành' khi xong",
          description: "Đánh dấu hoàn thành khi bạn đã đọc và hiểu nội dung",
          icon: "✅"
        }
      ]);
    } finally {
      setTipsLoading(false);
    }
  };

  // 1️⃣ Load Concepts - Gọi khi mở Panel học tập
  const loadConcepts = async () => {
    setIsLoadingConcepts(true);
    try {
      const data = await stepByStepAnalysisService.getConcepts(title, content);
      setConceptsData(data);
    } catch (error) {
      console.error('Error loading concepts:', error);
    } finally {
      setIsLoadingConcepts(false);
    }
  };

  // 2️⃣ Load FiveWOneH - Gọi sau khi hoàn thành đọc
  const loadFiveWOneH = async () => {
    setIsLoadingFiveWOneH(true);
    try {
      const questions = await readingTipsService.generate5W1HQuestions(content);
      setFiveWOneHData({ fiveWoneH: questions });
      // Tự động chuyển sang tab 5W1H khi load xong
      setActiveTab('fiveWoneH');
    } catch (error) {
      console.error('Error loading 5W1H:', error);
    } finally {
      setIsLoadingFiveWOneH(false);
    }
  };

  // 3️⃣ Load MCQ - Gọi sau khi hoàn thành Quiz ABCD
  const loadMCQ = async () => {
    setIsLoadingMCQ(true);
    try {
      const data = await stepByStepAnalysisService.getMCQ(title, content);
      setMcQData(data);
      // Tự động chuyển sang tab MCQ khi load xong
      setActiveTab('mcq');
    } catch (error) {
      console.error('Error loading MCQ:', error);
    } finally {
      setIsLoadingMCQ(false);
    }
  };

  // 4️⃣ Load Short Prompts - Gọi sau khi làm xong quiz
  const loadShortPrompts = async () => {
    setIsLoadingShortPrompts(true);
    try {
      const data = await stepByStepAnalysisService.getShortPrompts(title, content);
      setShortPromptsData(data);
      // Tự động chuyển sang tab Short Prompts khi load xong
      setActiveTab('short_prompts');
    } catch (error) {
      console.error('Error loading short prompts:', error);
    } finally {
      setIsLoadingShortPrompts(false);
    }
  };

  const handleMCQAnswer = (questionId, selectedIndex) => {
    const question = mcqData?.mcq?.find(q => q.id === questionId);
    if (!question) return;

    const isCorrect = selectedIndex === question.correct_index;
    const result = {
      questionId,
      selectedIndex,
      isCorrect,
      explanation: question.explanation,
      correctIndex: question.correct_index
    };

    setGradingResults(prev => ({
      ...prev,
      [questionId]: result
    }));

    // Kiểm tra xem đã trả lời hết tất cả câu hỏi MCQ chưa
    setTimeout(() => {
      checkAndAutoTransitionToShortPrompts();
    }, 1000);
  };

  // Xử lý khi hoàn thành 5W1H
  const handleFiveWOneHComplete = () => {
    setFiveWOneHCompleted(true);
    // Tự động chuyển sang MCQ sau khi hoàn thành 5W1H
    if (!mcqData && !isLoadingMCQ) {
      loadMCQ();
    } else if (mcqData) {
      // Nếu đã có MCQ data, chuyển sang tab MCQ ngay
      setActiveTab('mcq');
    }
  };

  // Kiểm tra và tự động chuyển sang Short Prompts
  const checkAndAutoTransitionToShortPrompts = () => {
    if (!mcqData?.mcq) return;
    
    const totalQuestions = mcqData.mcq.length;
    const answeredQuestions = Object.keys(gradingResults).filter(key => 
      !key.startsWith('short_') && gradingResults[key]
    ).length;
    
    // Nếu đã trả lời hết tất cả câu hỏi MCQ và chưa có Short Prompts
    if (answeredQuestions >= totalQuestions && !shortPromptsData && !isLoadingShortPrompts) {
      console.log('All MCQ answered, loading short prompts...');
      loadShortPrompts();
    }
  };

  const handleShortAnswer = async (promptIndex, answer) => {
    if (!answer.trim()) return;

    const prompt = shortPromptsData?.short_prompts?.[promptIndex];
    const gradingResult = await stepByStepAnalysisService.gradeShortAnswer(answer, prompt);
    
    if (gradingResult) {
      setGradingResults(prev => ({
        ...prev,
        [`short_${promptIndex}`]: {
          answer,
          ...gradingResult
        }
      }));
    }
  };

  const tabs = [
    { 
      id: 'reading_tips', 
      label: 'Mẹo đọc', 
      icon: FaLightbulb, 
      isLoading: tipsLoading,
      isAvailable: true
    },
    { 
      id: 'concepts', 
      label: 'Khái niệm', 
      icon: FaBook, 
      isLoading: isLoadingConcepts,
      isAvailable: true
    },
    { 
      id: 'difficult_terms', 
      label: 'Thuật ngữ', 
      icon: FaEye, 
      isLoading: isLoadingConcepts,
      isAvailable: !!conceptsData
    },
    { 
      id: 'fiveWoneH', 
      label: '5W1H', 
      icon: FaQuestionCircle, 
      isLoading: isLoading5W1H || isLoadingFiveWOneH,
      isAvailable: !!fiveWOneHData || fiveWOneHQuestions.length > 0 || readingProgress === 'finished_reading' || readingProgress === 'in_progress'
    },
    { 
      id: 'mcq', 
      label: 'Trắc nghiệm', 
      icon: FaCheck, 
      isLoading: isLoadingMCQ,
      isAvailable: !!mcqData || readingProgress === 'finished_all'
    },
    { 
      id: 'short_prompts', 
      label: 'Tự luận', 
      icon: FaEdit, 
      isLoading: isLoadingShortPrompts,
      isAvailable: !!shortPromptsData || readingProgress === 'finished_all'
    }
  ];

  if (!isVisible) return null;

  return (
    <>
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .learning-panel-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .learning-panel-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .learning-panel-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .learning-panel-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <FaGraduationCap className="text-lg" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Panel Học Tập</h2>
                <p className="text-blue-100 text-xs">{title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 transition-all duration-200"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Compact Tab Navigation */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={!tab.isAvailable}
                className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap text-sm ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : tab.isAvailable
                    ? 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                {tab.isLoading ? (
                  <FaSpinner className="mr-1.5 animate-spin text-xs" />
                ) : (
                  <tab.icon className="mr-1.5 text-xs" />
                )}
                {tab.label}
                {!tab.isAvailable && !tab.isLoading && (
                  <FaClock className="ml-1.5 text-xs" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div 
          className="flex-1 overflow-y-auto learning-panel-scroll"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* Loading State */}
          {isLoadingConcepts && !conceptsData && activeTab !== 'reading_tips' && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Đang phân tích bài viết</h3>
                <p className="text-gray-600 text-sm">Tạo nội dung học tập thông minh...</p>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="p-4 max-w-4xl mx-auto">
            {renderTabContent()}
          </div>
        </div>
      </motion.div>
    </motion.div>
    </>
  );

  function renderTabContent() {
    if (!conceptsData && activeTab !== 'reading_tips') return null;

    switch (activeTab) {
      case 'reading_tips':
        if (tipsLoading) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FaSpinner className="animate-spin text-4xl text-yellow-600 mx-auto mb-4" />
                <p className="text-gray-600">Đang tạo mẹo đọc hiệu quả...</p>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {/* Compact Header Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-500 rounded-lg p-2">
                    <FaLightbulb className="text-lg text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Mẹo đọc hiệu quả</h3>
                    <p className="text-gray-600 text-sm">Các gợi ý được AI tạo ra dựa trên nội dung bài viết</p>
                  </div>
                </div>
                <button
                  onClick={loadReadingTips}
                  disabled={tipsLoading}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center shadow-md hover:shadow-lg disabled:opacity-50 text-sm"
                  title="Làm mới mẹo đọc"
                >
                  <FaRedo className="mr-1.5" />
                  Làm mới
                </button>
              </div>
              
              {tipsError && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                  <p className="text-red-700 font-medium text-sm">{tipsError}</p>
                </div>
              )}
            </div>
            
            {/* Compact Tips Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {readingTips.map((tip, index) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-yellow-300"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">{tip.icon}</div>
                    <h4 className="font-bold text-gray-800 mb-2">
                      {tip.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {tip.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Compact Info Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 rounded-lg p-2 flex-shrink-0">
                  <FaGraduationCap className="text-lg text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-800 mb-3">Lưu ý quan trọng</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-blue-700 text-xs">Mẹo đọc được tạo dựa trên nội dung bài viết hiện tại</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-blue-700 text-xs">Phù hợp với giai đoạn đọc và tốc độ hiện tại của bạn</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-blue-700 text-xs">Có thể làm mới để nhận mẹo mới phù hợp hơn</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-blue-700 text-xs">Áp dụng các mẹo này để cải thiện hiệu quả đọc</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'concepts':
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaBook className="mr-2 text-blue-600" />
              Khái niệm chuyên ngành
            </h3>
            <div className="grid gap-3">
              {conceptsData.concepts?.map((concept, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                >
                  <h4 className="font-semibold text-blue-800 mb-2">{concept.term}</h4>
                  <p className="text-gray-700 mb-2 text-sm">{concept.definition}</p>
                  <div className="bg-white border border-blue-100 rounded p-2">
                    <p className="text-xs text-gray-600">
                      <strong>Ví dụ:</strong> {concept.example}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'difficult_terms':
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaLightbulb className="mr-2 text-yellow-600" />
              Thuật ngữ khó
            </h3>
            <div className="grid gap-3">
              {conceptsData.difficult_terms?.map((term, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                >
                  <h4 className="font-semibold text-yellow-800 mb-2">{term.term}</h4>
                  <p className="text-gray-700 mb-2 text-sm">{term.explain}</p>
                  <div className="bg-white border border-yellow-100 rounded p-2">
                    <p className="text-xs text-gray-600">
                      <strong>Mẹo nhớ:</strong> {term.tip}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'fiveWoneH':
        if (isLoading5W1H || isLoadingFiveWOneH) {
          return (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <FaSpinner className="text-3xl text-green-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Đang tạo câu hỏi 5W1H...</p>
              </div>
            </div>
          );
        }
        
        if (!fiveWOneHData) {
          return (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <FaClock className="text-3xl text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Hoàn thành phần đọc để mở khóa câu hỏi 5W1H</p>
              </div>
            </div>
          );
        }

        return (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaQuestionCircle className="mr-2 text-green-600" />
              Câu hỏi 5W1H
            </h3>
            <div className="grid gap-3 mb-4">
              {fiveWOneHData.fiveWoneH?.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-3"
                >
                  <div className="flex items-center mb-2">
                    <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold mr-2">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-gray-700">{item.question}</p>
                </motion.div>
              ))}
            </div>
            
            {/* Compact Continue Button */}
            <div className="text-center">
              <button
                onClick={handleFiveWOneHComplete}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center mx-auto text-sm"
              >
                <FaCheck className="mr-1.5" />
                Tiếp tục sang Trắc nghiệm
              </button>
              <p className="text-xs text-gray-600 mt-2">
                Sau khi xem xong các câu hỏi định hướng, nhấn để tiếp tục làm bài trắc nghiệm
              </p>
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>💡 Mẹo:</strong> Các câu hỏi trên giúp bạn định hướng tìm ý chính trong bài. 
                  Sau khi suy nghĩ về các câu hỏi này, bạn sẽ làm bài trắc nghiệm để kiểm tra hiểu biết.
                </p>
              </div>
            </div>
          </div>
        );

      case 'mcq':
        if (isLoadingMCQ) {
          return (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <FaSpinner className="text-3xl text-purple-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Đang tạo câu hỏi trắc nghiệm...</p>
              </div>
            </div>
          );
        }
        
        if (!mcqData) {
          return (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <FaClock className="text-3xl text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Hoàn thành quiz để mở khóa câu hỏi trắc nghiệm</p>
              </div>
            </div>
          );
        }

        return (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaCheck className="mr-2 text-purple-600" />
              Câu hỏi trắc nghiệm
            </h3>
            <div className="space-y-4">
              {mcqData.mcq?.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                >
                  <h4 className="font-semibold text-purple-800 mb-3">
                    Câu {question.id}: {question.question}
                  </h4>
                  
                  <div className="space-y-2 mb-3">
                    {question.options.map((option, optionIndex) => {
                      const result = gradingResults[question.id];
                      const isSelected = result?.selectedIndex === optionIndex;
                      const isCorrect = optionIndex === question.correct_index;
                      const isWrong = isSelected && !isCorrect;
                      
                      return (
                        <button
                          key={optionIndex}
                          onClick={() => handleMCQAnswer(question.id, optionIndex)}
                          className={`w-full text-left p-2 rounded-lg border transition-colors text-sm ${
                            isCorrect && result
                              ? 'bg-green-100 border-green-300 text-green-800'
                              : isWrong
                              ? 'bg-red-100 border-red-300 text-red-800'
                              : isSelected
                              ? 'bg-blue-100 border-blue-300 text-blue-800'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {gradingResults[question.id] && (
                    <div className="bg-white border border-purple-100 rounded p-3">
                      <p className="text-xs text-gray-600">
                        <strong>Giải thích:</strong> {gradingResults[question.id].explanation}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Compact Continue Button */}
            <div className="text-center mt-4">
              <button
                onClick={() => {
                  if (!shortPromptsData && !isLoadingShortPrompts) {
                    loadShortPrompts();
                  } else if (shortPromptsData) {
                    setActiveTab('short_prompts');
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center mx-auto text-sm"
              >
                <FaEdit className="mr-1.5" />
                Tiếp tục sang Tự luận
              </button>
              <p className="text-xs text-gray-600 mt-2">
                Sau khi hoàn thành trắc nghiệm, nhấn để tiếp tục làm câu hỏi tự luận
              </p>
            </div>
          </div>
        );

      case 'short_prompts':
        if (isLoadingShortPrompts) {
          return (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <FaSpinner className="text-3xl text-orange-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Đang tạo câu hỏi tự luận...</p>
              </div>
            </div>
          );
        }
        
        if (!shortPromptsData) {
          return (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <FaClock className="text-3xl text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Hoàn thành tất cả để mở khóa câu hỏi tự luận</p>
              </div>
            </div>
          );
        }

        return (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaEdit className="mr-2 text-orange-600" />
              Câu hỏi tự luận
            </h3>
            <div className="space-y-4">
              {shortPromptsData.short_prompts?.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                >
                  <h4 className="font-semibold text-orange-800 mb-3">
                    Câu hỏi {index + 1}
                  </h4>
                  <p className="text-gray-700 mb-3 text-sm">{prompt}</p>
                  
                  <textarea
                    placeholder="Nhập câu trả lời của bạn..."
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none h-20 text-sm"
                    onChange={(e) => setStudentAnswers(prev => ({
                      ...prev,
                      [index]: e.target.value
                    }))}
                  />
                  
                  <button
                    onClick={() => handleShortAnswer(index, studentAnswers[index])}
                    disabled={!studentAnswers[index]?.trim()}
                    className="mt-2 bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Gửi để chấm điểm
                  </button>

                  {gradingResults[`short_${index}`] && (
                    <div className="mt-3 bg-white border border-orange-100 rounded p-3">
                      <div className="flex items-center mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          gradingResults[`short_${index}`].score_percent >= 80
                            ? 'bg-green-100 text-green-800'
                            : gradingResults[`short_${index}`].score_percent >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {gradingResults[`short_${index}`].score_percent}% - {gradingResults[`short_${index}`].rating}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        <strong>Phản hồi:</strong> {gradingResults[`short_${index}`].feedback}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Đáp án mẫu:</strong> {gradingResults[`short_${index}`].model_answer}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'reading_tips':
        return (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaEye className="mr-3 text-indigo-600" />
              Mẹo đọc hiệu quả
            </h3>
            <div className="space-y-4">
              {conceptsData.reading_tips?.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-indigo-50 border border-indigo-200 rounded-lg p-4"
                >
                  <div className="flex items-start">
                    <FaRocket className="text-indigo-600 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-gray-700">{tip}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  }
};

export default LearningPanel;
