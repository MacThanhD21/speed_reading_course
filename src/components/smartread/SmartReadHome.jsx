import React from 'react';
import { motion } from 'framer-motion';
import { FaFile, FaLink, FaUpload, FaHistory, FaCog, FaRocket } from 'react-icons/fa';

const SmartReadHome = ({ onNavigate }) => {
  const features = [
    {
      icon: <FaRocket className="text-4xl text-red-600" />,
      title: "Demo",
      description: "Xem demo và thông tin về SmartRead",
      action: () => onNavigate('demo')
    },
    {
      icon: <FaFile className="text-4xl text-blue-600" />,
      title: "Dán văn bản",
      description: "Dán nội dung bài đọc để đo tốc độ đọc",
      action: () => onNavigate('paste-text')
    },
    {
      icon: <FaLink className="text-4xl text-green-600" />,
      title: "Nhập URL",
      description: "Nhập link bài viết để tự động trích xuất nội dung",
      action: () => onNavigate('paste-url')
    },
    {
      icon: <FaUpload className="text-4xl text-purple-600" />,
      title: "Tải file",
      description: "Tải lên file văn bản để đọc",
      action: () => onNavigate('upload-file')
    },
    {
      icon: <FaHistory className="text-4xl text-orange-600" />,
      title: "Lịch sử",
      description: "Xem lại các phiên đọc trước đó",
      action: () => onNavigate('history')
    },
    {
      icon: <FaCog className="text-4xl text-gray-600" />,
      title: "Cài đặt",
      description: "Tùy chỉnh giao diện và cài đặt",
      action: () => onNavigate('settings')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            SmartRead
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Đo tốc độ đọc thực tế và kiểm tra khả năng hiểu biết của bạn
          </p>
        </motion.div>

        {/* Quick Tip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg"
        >
          <p className="text-blue-800 font-medium">
            💡 <strong>Mẹo:</strong> Để có kết quả tốt nhất, hãy đọc ở nơi yên tĩnh và sử dụng tai nghe nếu cần thiết.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={feature.action}
            >
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Cách hoạt động
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Dán văn bản</h3>
              <p className="text-gray-600 text-sm">Dán nội dung bài đọc hoặc nhập URL</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Đọc và đo tốc độ</h3>
              <p className="text-gray-600 text-sm">Đọc văn bản và theo dõi tốc độ WPM trực tiếp</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Kiểm tra hiểu biết</h3>
              <p className="text-gray-600 text-sm">Làm bài kiểm tra tự động để đánh giá khả năng hiểu</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SmartReadHome;
