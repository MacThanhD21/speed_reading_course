import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrophy, 
  FaClock, 
  FaBook, 
  FaChartLine, 
  FaRedo, 
  FaGraduationCap,
  FaTimes,
  FaCheckCircle,
  FaStar,
  FaQuestionCircle
} from 'react-icons/fa';

const ReadingCompletionPopup = ({ 
  isVisible, 
  onClose, 
  readingData, 
  onRetry, 
  onGoToLearningPanel,
  onTakeQuiz
}) => {
  if (!isVisible) return null;

  const { finalWPM, finalWPS, wordsRead, elapsedTime, averageWPM, averageWPS } = readingData || {};

  

  // Use finalWPM (accurate calculation) over averageWPM (smoothed)
  // finalWPM is calculated as: wordsRead / (elapsedTime / 60)
  const displayWPM = finalWPM || averageWPM || 0;

  // Calculate performance metrics
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Compact */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-4 sm:p-5 flex-shrink-0">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:text-gray-200 transition-colors z-10"
            >
              <FaTimes className="text-lg sm:text-xl" />
            </button>
            
            <div className="text-center pr-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="text-4xl sm:text-5xl mb-2"
              >
                🎉
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">Hoàn thành đọc!</h2>
              <p className="text-blue-100 text-sm">Chúc mừng bạn đã hoàn thành bài đọc</p>
            </div>
          </div>

          {/* Content - Scrollable if needed but optimized */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {/* Main Stats */}
            <div className="text-center mb-4">
              <div className="text-3xl sm:text-4xl font-bold text-gray-800 mb-1">
                {displayWPM} WPM
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 rounded-lg p-3 text-center"
              >
                <FaBook className="text-xl sm:text-2xl text-blue-600 mx-auto mb-1.5" />
                <div className="text-lg sm:text-xl font-bold text-gray-800">{wordsRead || 0}</div>
                <div className="text-xs sm:text-sm text-gray-600">Từ đã đọc</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-lg p-3 text-center"
              >
                <FaClock className="text-xl sm:text-2xl text-green-600 mx-auto mb-1.5" />
                <div className="text-lg sm:text-xl font-bold text-gray-800">{formatTime(elapsedTime || 0)}</div>
                <div className="text-xs sm:text-sm text-gray-600">Thời gian</div>
              </motion.div>
            </div>

            {/* Performance Insights - Compact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3 mb-4"
            >
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center text-sm sm:text-base">
                <FaChartLine className="mr-2 text-green-600 text-sm" />
                Phân tích hiệu suất
              </h3>
              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tốc độ trung bình:</span>
                  <span className="font-medium">{averageWPM || 0} WPM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Từ/giây trung bình:</span>
                  <span className="font-medium">{(averageWPS || 0).toFixed(1)} WPS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tốc độ cuối:</span>
                  <span className="font-medium">{finalWPM || 0} WPM</span>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons - Compact */}
            <div className="space-y-2">
              {onTakeQuiz && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={onTakeQuiz}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center"
                >
                  <FaQuestionCircle className="mr-2 sm:mr-3 text-lg sm:text-xl flex-shrink-0" />
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-sm sm:text-base">Làm bài kiểm tra trắc nghiệm</div>
                    <div className="text-xs sm:text-sm text-purple-100 font-normal">10-15 câu hỏi</div>
                  </div>
                </motion.button>
              )}

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                onClick={onGoToLearningPanel}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center"
              >
                <FaGraduationCap className="mr-2 sm:mr-3 text-lg sm:text-xl flex-shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <div className="text-sm sm:text-base">Chuyển sang Panel Học tập</div>
                  <div className="text-xs sm:text-sm text-blue-100 font-normal">Câu hỏi tự luận</div>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={onRetry}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center text-sm sm:text-base"
              >
                <FaRedo className="mr-2 sm:mr-3" />
                Thử lại bài đọc
              </motion.button>
            </div>

            {/* Motivational Message - Compact */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <FaStar className="text-yellow-500 text-lg mx-auto mb-1.5" />
              <p className="text-xs sm:text-sm text-gray-700">
                <strong>Lời khuyên:</strong> Tiếp tục luyện tập để cải thiện tốc độ đọc!
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReadingCompletionPopup;
