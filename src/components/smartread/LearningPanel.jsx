import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBook, FaLightbulb, FaQuestionCircle, FaEdit, FaCheck, 
  FaTimes, FaSpinner, FaEye, FaGraduationCap, FaRocket, FaClock, FaRedo, FaChartBar,
  FaTrophy, FaPaperPlane
} from 'react-icons/fa';
import stepByStepAnalysisService from '../../services/stepByStepAnalysisService';
import readingTipsService from '../../services/readingTipsService';
import logger from '../../utils/logger.js';

const LearningPanel = ({ title, content, isVisible, onClose, readingProgress = 'start', readingData = {}, fiveWOneHQuestions = [], isLoading5W1H = false }) => {
  // State for different phases
  const [conceptsData, setConceptsData] = useState(null);
  const [fiveWOneHData, setFiveWOneHData] = useState(null);
  
  // Reading tips state - khởi tạo với mẹo đọc fix cứng
  const [readingTips, setReadingTips] = useState(() => {
    // Import getFixedReadingTips từ readingTipsService
    return [
      {
        id: 1,
        title: "Đọc với tốc độ thoải mái",
        description: "Hãy đọc ở tốc độ bạn cảm thấy thoải mái và có thể hiểu nội dung một cách rõ ràng",
        icon: "🐌"
      },
      {
        id: 2,
        title: "Tập trung vào nội dung",
        description: "Loại bỏ các yếu tố gây phân tán và tập trung hoàn toàn vào bài đọc",
        icon: "🎯"
      },
      {
        id: 3,
        title: "Ghi chú những điểm quan trọng",
        description: "Đánh dấu hoặc ghi chú những thông tin quan trọng để dễ dàng ôn tập sau này",
        icon: "📝"
      },
      {
        id: 4,
        title: "Đặt câu hỏi trong khi đọc",
        description: "Tự đặt câu hỏi về nội dung để tăng khả năng hiểu và ghi nhớ",
        icon: "❓"
      },
      {
        id: 5,
        title: "Tóm tắt sau khi đọc",
        description: "Dành vài phút để tóm tắt lại những gì đã đọc để củng cố kiến thức",
        icon: "✍️"
      }
    ];
  });
  
  // Loading states for each phase
  const [isLoadingConcepts, setIsLoadingConcepts] = useState(false);
  const [isLoadingFiveWOneH, setIsLoadingFiveWOneH] = useState(false);
  
  // Comprehensive data loading state
  const [isLoadingComprehensive, setIsLoadingComprehensive] = useState(false);
  const [comprehensiveError, setComprehensiveError] = useState(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('reading_tips');
  const [fiveWOneHAnswers, setFiveWOneHAnswers] = useState({});
  const [fiveWOneHCompleted, setFiveWOneHCompleted] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Handle submit essay for evaluation
  const handleSubmitEssay = async () => {
    if (!fiveWOneHData || !fiveWOneHData.fiveWoneH) return;
    
    setIsEvaluating(true);
    
    try {
      logger.info('LEARNING_PANEL', 'Submitting essay for evaluation', {
        questionCount: fiveWOneHData.fiveWoneH.length,
        answerCount: Object.keys(fiveWOneHAnswers).length
      });
      
      const evaluation = await readingTipsService.evaluateEssayAnswers(
        fiveWOneHData.fiveWoneH,
        fiveWOneHAnswers,
        content
      );
      
      setEvaluationResults(evaluation);
      setFiveWOneHCompleted(true);
      
      logger.info('LEARNING_PANEL', 'Evaluation completed successfully', {
        overallScore: evaluation.overallScore,
        totalQuestions: evaluation.totalQuestions
      });
    } catch (error) {
      logger.error('LEARNING_PANEL', 'Error evaluating essay', {
        error: error.message,
        errorType: error.constructor.name
      });
      // Show error message to user
      alert('Có lỗi xảy ra khi đánh giá bài làm. Vui lòng thử lại sau.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Handle tab click with lazy loading
  const handleTabClick = (tabId) => {
    logger.debug('LEARNING_PANEL', `Tab clicked: ${tabId}`, {
      previousTab: activeTab,
      newTab: tabId
    });
    
    setActiveTab(tabId);
    
    // Load comprehensive data only when concepts_and_terms or statistics tab is clicked
    if ((tabId === 'concepts_and_terms' || tabId === 'statistics') && !conceptsData && !isLoadingComprehensive) {
      loadComprehensiveData();
    }
  };

  // Load comprehensive learning data (tất cả trong một lần gọi API)
  const loadComprehensiveData = async () => {
    if (!content) return;
    
    // Tránh gọi API nhiều lần
    if (isLoadingComprehensive) {
      logger.debug('LEARNING_PANEL', 'Already loading comprehensive data, skipping...');
      return;
    }
    
    // Nếu đã có data, không cần gọi lại
    if (conceptsData && conceptsData.statistics && conceptsData.statistics.length > 0) {
      logger.debug('LEARNING_PANEL', 'Comprehensive data already loaded, skipping...');
      return;
    }
    
    logger.info('LEARNING_PANEL', 'Loading comprehensive learning data', {
      contentLength: content?.content?.length || content?.length || 0,
      hasTitle: !!content?.title,
      readingProgress
    });
    
    setIsLoadingComprehensive(true);
    setComprehensiveError(null);
    
    try {
      const data = await readingTipsService.generateComprehensiveLearningData(content, readingData);
      
      // Set tất cả data từ một lần gọi API
      // Không ghi đè readingTips vì đã fix cứng
      setConceptsData({
        conceptsAndTerms: data.conceptsAndTerms || [],
        statistics: data.statistics || [],
        previewQuestions: data.previewQuestions || []
      });
    } catch (error) {
      logger.error('LEARNING_PANEL', 'Error loading comprehensive learning data', {
        error: error.message,
        errorType: error.constructor.name
      });
      
      // Hiển thị thông báo user-friendly
      if (error.message.includes('503')) {
        setComprehensiveError('Gemini API đang quá tải. Đang sử dụng dữ liệu mẫu...');
        logger.warn('LEARNING_PANEL', 'Gemini API overloaded, using fallback data');
      } else if (error.message.includes('500')) {
        setComprehensiveError('Lỗi server Gemini API. Đang sử dụng dữ liệu mẫu...');
        logger.warn('LEARNING_PANEL', 'Gemini API server error, using fallback data');
      } else if (error.message.includes('All API keys failed')) {
        setComprehensiveError('Tất cả API keys đã hết hạn. Đang sử dụng dữ liệu mẫu...');
        logger.warn('LEARNING_PANEL', 'All API keys exhausted, using fallback data');
      } else {
        setComprehensiveError('Không thể tải dữ liệu học tập. Đang sử dụng dữ liệu mẫu...');
        logger.warn('LEARNING_PANEL', 'Unknown error, using fallback data');
      }
      
      // Fallback to default data - chỉ set conceptsData, không ghi đè readingTips
      setConceptsData({
        conceptsAndTerms: [
          {
            term: "Khái niệm chính",
            definition: "Định nghĩa khái niệm quan trọng trong bài viết",
            example: "Ví dụ minh họa",
            type: "khái niệm"
          },
          {
            term: "Thuật ngữ khó",
            definition: "Giải thích thuật ngữ một cách đơn giản",
            example: "Ví dụ cụ thể",
            type: "thuật ngữ"
          }
        ],
        statistics: [
          {
            data: "100",
            unit: "người",
            significance: "Số lượng người tham gia sự kiện quan trọng",
            context: "Được đề cập trong đoạn đầu bài viết",
            memoryTip: "Nhớ số 100 như một trăm điểm hoàn hảo"
          },
          {
            data: "15%",
            unit: "phần trăm",
            significance: "Tỷ lệ tăng trưởng đáng kể",
            context: "Thống kê trong phần phân tích",
            memoryTip: "15% = 3/20, dễ nhớ như 15 phút"
          },
          {
            data: "2024",
            unit: "năm",
            significance: "Năm quan trọng trong lịch sử",
            context: "Được nhắc đến nhiều lần trong bài",
            memoryTip: "2024 = 20 + 24 = 44, số may mắn"
          }
        ],
        previewQuestions: [
          {
            question: "Câu hỏi định hướng đọc",
            hint: "Gợi ý tìm đáp án"
          },
          {
            question: "Câu hỏi về nội dung chính",
            hint: "Tập trung vào ý chính của bài viết"
          },
          {
            question: "Câu hỏi về số liệu quan trọng",
            hint: "Chú ý đến các con số được đề cập"
          }
        ]
      });
    } finally {
      setIsLoadingComprehensive(false);
    }
  };

  useEffect(() => {
    if (!isVisible || !content) return;
    // If incoming questions via props, prefer using them once
    if (fiveWOneHQuestions && fiveWOneHQuestions.length > 0) {
        setFiveWOneHData({ fiveWoneH: fiveWOneHQuestions });
      return;
    }
    // Prevent duplicate API calls: only load once per content
    if ((readingProgress === 'finished_reading' || readingProgress === 'in_progress') && !fiveWOneHData && !isLoadingFiveWOneH) {
        loadFiveWOneH();
      }
  }, [isVisible, content, readingProgress, fiveWOneHQuestions, isLoadingFiveWOneH]);

  // Load data when tab becomes active
  useEffect(() => {
    // CHỈ load data khi panel thực sự visible
    if (!isVisible) return;
    
    // Load comprehensive data for concepts_and_terms or statistics tabs
    if ((activeTab === 'concepts_and_terms' || activeTab === 'statistics') && !conceptsData && !isLoadingComprehensive) {
      loadComprehensiveData();
    }
  }, [activeTab, isVisible]);

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

  // Handle 5W1H answer
  const handleFiveWOneHAnswer = (questionId, answer) => {
    setFiveWOneHAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // 2️⃣ Load FiveWOneH - Gọi sau khi hoàn thành đọc
  const loadFiveWOneH = async () => {
    logger.info('LEARNING_PANEL', 'Loading 5W1H questions', {
      contentLength: content?.content?.length || content?.length || 0,
      hasTitle: !!content?.title
    });
    
    setIsLoadingFiveWOneH(true);
    try {
      const questions = await readingTipsService.generate5W1HQuestions({ title, content });
      setFiveWOneHData({ fiveWoneH: questions });
      
      logger.info('LEARNING_PANEL', '5W1H questions loaded successfully', {
        questionCount: questions?.length || 0,
        questionTypes: questions?.map(q => q.type) || []
      });
      
      // Không tự động chuyển tab, để người dùng tự chọn
    } catch (error) {
      logger.error('LEARNING_PANEL', 'Error loading 5W1H questions', {
        error: error.message,
        errorType: error.constructor.name
      });
    } finally {
      setIsLoadingFiveWOneH(false);
    }
  };

  // Xử lý khi hoàn thành 5W1H
  const handleFiveWOneHComplete = () => {
    setFiveWOneHCompleted(true);
    // Không tự động chuyển tab, để người dùng tự chọn
  };

  const tabs = [
    { 
      id: 'reading_tips', 
      label: 'Mẹo đọc', 
      icon: FaLightbulb, 
      isLoading: false, // Mẹo đọc fix cứng, không cần loading
      isAvailable: true
    },
    { 
      id: 'concepts_and_terms', 
      label: 'Khái niệm & Thuật ngữ', 
      icon: FaBook, 
      isLoading: isLoadingComprehensive,
      isAvailable: true
    },
    { 
      id: 'statistics', 
      label: 'Số liệu', 
      icon: FaChartBar, 
      isLoading: isLoadingComprehensive,
      isAvailable: true
    },
    { 
      id: 'fiveWoneH', 
      label: '5W1H', 
      icon: FaQuestionCircle, 
      isLoading: isLoading5W1H || isLoadingFiveWOneH,
      isAvailable: true // Luôn available, data sẽ được load khi cần
    },
  ];

  if (!isVisible) return null;

  return (
    <>
      {/* Custom scrollbar styles */}
      <style>{`
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
                onClick={() => handleTabClick(tab.id)}
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
    // Chỉ check conceptsData cho các tab cần thiết
    if (!conceptsData && (activeTab === 'concepts_and_terms' || activeTab === 'statistics')) {
      return null;
    }

    switch (activeTab) {
      case 'reading_tips':
        // Mẹo đọc đã fix cứng, không cần loading
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
                    <p className="text-gray-600 text-sm">Các gợi ý đọc hiệu quả được tối ưu hóa</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Compact Tips Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {readingTips.map((tip, index) => (
                <motion.div
                  key={`tip_${tip.id || index}`}
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
                      <p className="text-blue-700 text-xs">Mẹo đọc được tối ưu hóa cho hiệu quả tối đa</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-blue-700 text-xs">Phù hợp với mọi loại nội dung và tốc độ đọc</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-blue-700 text-xs">Được thiết kế dựa trên nghiên cứu khoa học</p>
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

      case 'concepts_and_terms':
        if (isLoadingComprehensive) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Đang tải khái niệm và thuật ngữ...</p>
              </div>
            </div>
          );
        }
        
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <FaBook className="mr-2 text-blue-600" />
              Khái niệm & Thuật ngữ
            </h3>
            <div className="grid gap-4">
              {conceptsData.conceptsAndTerms?.map((item, index) => (
                <motion.div
                  key={`concept_${item.term || index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-xl p-4 ${
                    item.type === 'khái niệm' 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-purple-50 border-purple-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`font-semibold text-lg ${
                      item.type === 'khái niệm' ? 'text-blue-800' : 'text-purple-800'
                    }`}>
                      {item.term}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.type === 'khái niệm' 
                        ? 'bg-blue-200 text-blue-800' 
                        : 'bg-purple-200 text-purple-800'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                    {item.definition}
                  </p>
                  
                  {item.example && (
                    <div className={`border rounded-lg p-3 ${
                      item.type === 'khái niệm' 
                        ? 'bg-white border-blue-100' 
                        : 'bg-white border-purple-100'
                    }`}>
                      <p className="text-xs text-gray-600">
                        <strong>Ví dụ:</strong> {item.example}
                    </p>
                  </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'statistics':
        if (isLoadingComprehensive) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FaSpinner className="text-4xl text-green-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Đang tải số liệu...</p>
              </div>
            </div>
          );
        }
        
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <FaChartBar className="mr-2 text-green-600" />
              Số liệu quan trọng
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {conceptsData.statistics?.map((stat, index) => (
                <motion.div
                  key={`stat_${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Header với số liệu chính */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-full p-2 mr-3">
                        <FaChartBar className="text-green-600 text-lg" />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-800 text-lg">
                          {stat.data}
                        </h4>
                        {stat.unit && (
                          <span className="text-green-600 text-sm font-medium">
                            {stat.unit}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bg-green-200 rounded-full px-3 py-1">
                      <span className="text-green-800 font-semibold text-sm">
                        #{index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Ý nghĩa */}
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Ý nghĩa
                    </h5>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {stat.significance}
                    </p>
                  </div>

                  {/* Bối cảnh */}
                  {stat.context && (
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Bối cảnh
                      </h5>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {stat.context}
                      </p>
                    </div>
                  )}

                  {/* So sánh */}
                  {stat.comparison && (
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        So sánh
                      </h5>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {stat.comparison}
                      </p>
                    </div>
                  )}

                  {/* Mẹo nhớ */}
                  <div className="bg-white border border-green-100 rounded-lg p-3">
                    <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      💡 Mẹo nhớ
                    </h5>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {stat.memoryTip}
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
                <p className="text-gray-600 text-sm">Đang tạo câu hỏi tự luận...</p>
              </div>
            </div>
          );
        }
        
        if (!fiveWOneHData) {
          return (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <FaClock className="text-3xl text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Hoàn thành phần đọc để mở khóa câu hỏi tự luận</p>
              </div>
            </div>
          );
        }

        // Nếu đã có kết quả đánh giá, hiển thị kết quả
        if (evaluationResults) {
          return (
            <div className="max-w-6xl mx-auto">
              {/* Header với animation */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h3 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                  <FaTrophy className="mr-3 text-yellow-500 text-4xl" />
                Kết quả đánh giá tự luận
              </h3>
                <p className="text-gray-600 text-lg">Đánh giá chi tiết bài làm của bạn</p>
              </motion.div>
              
              {/* Tổng điểm với design đẹp hơn */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 rounded-2xl p-8 mb-8 shadow-2xl"
              >
                <div className="text-center text-white">
                  <div className="text-6xl font-bold mb-4 drop-shadow-lg">
                    {evaluationResults.overallScore}/10
                  </div>
                  <p className="text-2xl font-semibold mb-2">Điểm tổng kết</p>
                  <div className="bg-white bg-opacity-20 rounded-full px-6 py-2 inline-block">
                    <p className="text-lg">
                    {evaluationResults.totalQuestions} câu hỏi đã được đánh giá
                  </p>
                </div>
              </div>
              </motion.div>

              {/* Nhận xét tổng quan với layout đẹp hơn */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white border-2 border-gray-100 rounded-2xl p-8 mb-8 shadow-lg"
              >
                <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="bg-blue-100 p-3 rounded-full mr-4">📝</span>
                  Nhận xét tổng quan
                </h4>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-lg text-gray-700 leading-relaxed">{evaluationResults.summary.overallFeedback}</p>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h5 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                      <span className="bg-green-500 text-white p-2 rounded-full mr-3">✅</span>
                      Điểm mạnh
                    </h5>
                    <ul className="space-y-3">
                      {evaluationResults.summary.strengths.map((strength, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="flex items-start"
                        >
                          <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">✓</span>
                          <span className="text-gray-700 text-lg">{strength}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                    <h5 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
                      <span className="bg-orange-500 text-white p-2 rounded-full mr-3">🔧</span>
                      Cần cải thiện
                    </h5>
                    <ul className="space-y-3">
                      {evaluationResults.summary.improvements.map((improvement, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="flex items-start"
                        >
                          <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">!</span>
                          <span className="text-gray-700 text-lg">{improvement}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations và Next Steps */}
                {(evaluationResults.summary.recommendations || evaluationResults.summary.nextSteps) && (
                  <div className="mt-8 grid lg:grid-cols-2 gap-6">
                    {evaluationResults.summary.recommendations && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                        <h5 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                          <span className="bg-blue-500 text-white p-2 rounded-full mr-3">💡</span>
                          Khuyến nghị học tập
                        </h5>
                        <ul className="space-y-2">
                          {evaluationResults.summary.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2">→</span>
                              <span className="text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
              </div>
                    )}
                    {evaluationResults.summary.nextSteps && (
                      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                        <h5 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                          <span className="bg-purple-500 text-white p-2 rounded-full mr-3">🎯</span>
                          Bước tiếp theo
                        </h5>
                        <ul className="space-y-2">
                          {evaluationResults.summary.nextSteps.map((step, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-purple-500 mr-2">→</span>
                              <span className="text-gray-700">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Chi tiết từng câu với design đẹp hơn */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-6"
              >
                <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="bg-gray-100 p-3 rounded-full mr-4">📋</span>
                  Chi tiết từng câu hỏi
                </h4>
                
                {evaluationResults.evaluations.map((evaluation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {/* Header câu hỏi */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center">
                        <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-lg font-bold mr-4">
                          Câu {index + 1}
                        </span>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            evaluation.score >= 8 ? 'bg-green-100 text-green-800' :
                            evaluation.score >= 6 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {evaluation.accuracy}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            evaluation.completeness === 'Đầy đủ' ? 'bg-green-100 text-green-800' :
                            evaluation.completeness === 'Khá đầy đủ' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {evaluation.completeness}
                          </span>
                          {evaluation.quality && (
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              evaluation.quality === 'Tốt' ? 'bg-green-100 text-green-800' :
                              evaluation.quality === 'Khá' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {evaluation.quality}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {evaluation.score}/{evaluation.maxScore}
                        </div>
                        <div className="text-sm text-gray-500">
                          Điểm số
                        </div>
                      </div>
                    </div>
                    
                    {/* Câu hỏi */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-6 mb-6">
                      <h5 className="text-lg font-semibold text-gray-800 mb-2">📝 Câu hỏi:</h5>
                      <p className="text-gray-700 text-lg">{evaluation.question}</p>
                  </div>
                    
                    {/* Câu trả lời */}
                    <div className="bg-gray-50 border-l-4 border-gray-400 rounded-r-xl p-6 mb-6">
                      <h5 className="text-lg font-semibold text-gray-800 mb-2">✍️ Câu trả lời của bạn:</h5>
                      <p className="text-gray-600 text-lg italic leading-relaxed">"{evaluation.answer}"</p>
                    </div>
                    
                    {/* Feedback */}
                    <div className="bg-green-50 border-l-4 border-green-500 rounded-r-xl p-6 mb-6">
                      <h5 className="text-lg font-semibold text-gray-800 mb-2">💬 Nhận xét:</h5>
                      <p className="text-gray-700 text-lg leading-relaxed">{evaluation.feedback}</p>
                    </div>

                    {/* Evidence nếu có */}
                    {evaluation.evidence && (
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {evaluation.evidence.correctPoints && evaluation.evidence.correctPoints.length > 0 && (
                          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                            <h5 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                              <span className="bg-green-500 text-white p-2 rounded-full mr-3">✅</span>
                              Điểm đúng
                            </h5>
                            <ul className="space-y-2">
                              {evaluation.evidence.correctPoints.map((point, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-green-500 mr-2 mt-1">✓</span>
                                  <span className="text-gray-700">{point}</span>
                                </li>
                              ))}
                            </ul>
              </div>
                        )}
                        
                        {evaluation.evidence.missingPoints && evaluation.evidence.missingPoints.length > 0 && (
                          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                            <h5 className="text-lg font-bold text-yellow-800 mb-4 flex items-center">
                              <span className="bg-yellow-500 text-white p-2 rounded-full mr-3">⚠️</span>
                              Điểm thiếu
                            </h5>
                            <ul className="space-y-2">
                              {evaluation.evidence.missingPoints.map((point, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-yellow-500 mr-2 mt-1">•</span>
                                  <span className="text-gray-700">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Strengths và Improvements */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {evaluation.strengths && evaluation.strengths.length > 0 && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                          <h5 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                            <span className="bg-green-500 text-white p-2 rounded-full mr-3">💪</span>
                            Điểm mạnh
                          </h5>
                          <ul className="space-y-2">
                            {evaluation.strengths.map((strength, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-green-500 mr-2 mt-1">→</span>
                                <span className="text-gray-700">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {evaluation.improvements && evaluation.improvements.length > 0 && (
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                          <h5 className="text-lg font-bold text-orange-800 mb-4 flex items-center">
                            <span className="bg-orange-500 text-white p-2 rounded-full mr-3">🔧</span>
                            Cần cải thiện
                          </h5>
                          <ul className="space-y-2">
                            {evaluation.improvements.map((improvement, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-orange-500 mr-2 mt-1">→</span>
                                <span className="text-gray-700">{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Nút làm lại với design đẹp hơn */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="text-center mt-12"
              >
                <button
                  onClick={() => {
                    setEvaluationResults(null);
                    setFiveWOneHAnswers({});
                    setFiveWOneHCompleted(false);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <FaRedo className="mr-3 text-xl" />
                  Làm lại bài tập
                </button>
              </motion.div>
            </div>
          );
        }

        // Hiển thị form tự luận
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaQuestionCircle className="mr-2 text-green-600" />
              Câu hỏi tự luận 5W1H
            </h3>
            
            <div className="space-y-6">
              {fiveWOneHData.fiveWoneH?.map((item, index) => (
                <motion.div
                  key={`q_${item.id || index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center mb-3">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold mr-3">
                      {item.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      Độ dài: {item.expectedLength}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-800 mb-2">
                    Câu {index + 1}: {sanitizeQuestion(item.question)}
                  </h4>
                  
                  {/* Ẩn hint để không hiển thị */}
                  {/* {item.hint && (
                    <p className="text-sm text-blue-600 mb-3 italic">
                      💡 {item.hint}
                    </p>
                  )} */}
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Câu trả lời của bạn:
                    </label>
                    <textarea
                      value={fiveWOneHAnswers[item.id] || ''}
                      onChange={(e) => setFiveWOneHAnswers(prev => ({
                        ...prev,
                        [item.id]: e.target.value
                      }))}
                      placeholder="Nhập câu trả lời chi tiết của bạn..."
                      className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {fiveWOneHAnswers[item.id]?.length || 0} ký tự
                    </div>
                  </div>
                  
                  {/* Luôn hiển thị keyPoints section để debug */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        📋 Điểm chính cần có:
                      </h5>
                    {item.keyPoints && item.keyPoints.length > 0 ? (
                      <ul className="text-xs text-gray-600 space-y-1">
                        {item.keyPoints.map((point, pointIndex) => (
                          <li key={pointIndex}>• {point}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-red-500 italic">
                        Debug: keyPoints = {JSON.stringify(item.keyPoints)} (length: {item.keyPoints?.length || 'undefined'})
                        <br />
                        Full item: {JSON.stringify(item, null, 2)}
                    </div>
                  )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Nút gửi đánh giá */}
            <div className="text-center mt-6">
              <button
                onClick={handleSubmitEssay}
                disabled={isEvaluating || Object.keys(fiveWOneHAnswers).length === 0}
                className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto ${
                  isEvaluating || Object.keys(fiveWOneHAnswers).length === 0
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isEvaluating ? (
                  <>
                    <FaSpinner className="mr-2 animate-spin" />
                    Đang đánh giá...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Gửi đánh giá
                  </>
                )}
              </button>
              
              {Object.keys(fiveWOneHAnswers).length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Vui lòng trả lời ít nhất một câu hỏi để gửi đánh giá
                </p>
              )}
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

      default:
        return null;
    }
  }

  function sanitizeQuestion(text) {
    if (!text) return '';
    let s = String(text).trim();
    s = s.replace(/^"?question"?\s*:\s*/i, '');
    s = s.replace(/^['"“”`\s]+/, '').replace(/[,'"“”`\s]+$/,'');
    s = s.replace(/^"/, '').replace(/"$/, '');
    s = s.replace(/\s+/g, ' ').trim();
    return s;
  }
};

export default LearningPanel;
