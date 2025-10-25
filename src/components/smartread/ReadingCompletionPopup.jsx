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
  FaStar
} from 'react-icons/fa';

const ReadingCompletionPopup = ({ 
  isVisible, 
  onClose, 
  readingData, 
  onRetry, 
  onGoToLearningPanel 
}) => {
  if (!isVisible) return null;

  const { finalWPM, finalWPS, wordsRead, elapsedTime, averageWPM, averageWPS } = readingData || {};

  // Debug logging
  console.log('ReadingCompletionPopup Debug:', {
    finalWPM,
    averageWPM,
    wordsRead,
    elapsedTime
  });

  // Use the same WPM value for consistency
  const displayWPM = averageWPM || finalWPM || 0;

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
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
            
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Hoàn thành đọc!</h2>
              <p className="text-blue-100">Chúc mừng bạn đã hoàn thành bài đọc</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Main Stats */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {displayWPM} WPM
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 rounded-lg p-4 text-center"
              >
                <FaBook className="text-2xl text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-800">{wordsRead || 0}</div>
                <div className="text-sm text-gray-600">Từ đã đọc</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-lg p-4 text-center"
              >
                <FaClock className="text-2xl text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-800">{formatTime(elapsedTime || 0)}</div>
                <div className="text-sm text-gray-600">Thời gian</div>
              </motion.div>
            </div>

            {/* Performance Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6"
            >
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <FaChartLine className="mr-2 text-green-600" />
                Phân tích hiệu suất
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tốc độ trung bình:</span>
                  <span className="font-medium">{averageWPM || 0} WPM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Từ/giây trung bình:</span>
                  <span className="font-medium">{(averageWPS || 0).toFixed(1)} WPS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Từ/phút:</span>
                  <span className="font-medium">{Math.round((wordsRead || 0) / ((elapsedTime || 1) / 60))} WPM</span>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={onGoToLearningPanel}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                <FaGraduationCap className="mr-3 text-xl" />
                <div className="text-left">
                  <div>Chuyển sang Panel Học tập</div>
                  <div className="text-sm text-blue-100 font-normal">Trả lời câu hỏi tự luận</div>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={onRetry}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center"
              >
                <FaRedo className="mr-3" />
                Thử lại bài đọc
              </motion.button>
            </div>

            {/* Motivational Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <FaStar className="text-yellow-500 text-xl mx-auto mb-2" />
              <p className="text-sm text-gray-700">
                <strong>Lời khuyên:</strong> Hãy tiếp tục luyện tập để cải thiện tốc độ đọc và khả năng hiểu biết của bạn!
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReadingCompletionPopup;
