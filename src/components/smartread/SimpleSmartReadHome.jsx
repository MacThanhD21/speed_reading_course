import React from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaTachometerAlt, FaBrain, FaCheckCircle } from 'react-icons/fa';

const SimpleSmartReadHome = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <FaBook className="text-white text-3xl" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            SmartRead
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-4 leading-relaxed">
            Đo tốc độ đọc thực tế và đánh giá khả năng hiểu biết của bạn
          </p>
          <p className="text-gray-500 text-lg">
            Công cụ luyện tập đọc nhanh với AI hỗ trợ tạo câu hỏi tự động
          </p>
        </motion.div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-16"
        >
          <button
            onClick={() => onNavigate('paste-text')}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3"
          >
            <FaBook className="text-xl" />
            <span>Bắt đầu đọc ngay</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <FaTachometerAlt className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Đo tốc độ đọc</h3>
            <p className="text-gray-600 leading-relaxed">
              Theo dõi tốc độ đọc (WPM) theo thời gian thực khi bạn đọc văn bản
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <FaBrain className="text-purple-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">AI tự động tạo câu hỏi</h3>
            <p className="text-gray-600 leading-relaxed">
              Hệ thống tự động tạo câu hỏi 5W1H và trắc nghiệm để kiểm tra khả năng hiểu biết
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <FaCheckCircle className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Đánh giá toàn diện</h3>
            <p className="text-gray-600 leading-relaxed">
              Nhận điểm số REI và RCI để đánh giá hiệu quả đọc và độ ổn định của bạn
            </p>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-10 md:p-12 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Cách sử dụng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
                <span className="text-white font-bold text-2xl">1</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">Dán văn bản</h3>
              <p className="text-gray-600 leading-relaxed">
                Copy và dán nội dung bài đọc vào SmartRead
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
                <span className="text-white font-bold text-2xl">2</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">Đọc và đo tốc độ</h3>
              <p className="text-gray-600 leading-relaxed">
                Đọc văn bản và theo dõi tốc độ đọc trực tiếp
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">Làm bài kiểm tra</h3>
              <p className="text-gray-600 leading-relaxed">
                Trả lời câu hỏi để đánh giá khả năng hiểu biết
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SimpleSmartReadHome;
