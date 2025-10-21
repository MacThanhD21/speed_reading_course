import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaChartLine, FaBrain, FaCheckCircle } from 'react-icons/fa';

const SmartReadDemo = () => {
  const features = [
    {
      icon: <FaChartLine className="text-3xl text-blue-600" />,
      title: "Đo WPM Real-time",
      description: "Theo dõi tốc độ đọc trực tiếp với thuật toán scroll-based và smoothing",
      status: "✅ Hoàn thành"
    },
    {
      icon: <FaBrain className="text-3xl text-green-600" />,
      title: "Sinh câu hỏi tự động",
      description: "Tạo câu hỏi 5W1H và MCQ dựa trên nội dung bài đọc",
      status: "✅ Hoàn thành"
    },
    {
      icon: <FaCheckCircle className="text-3xl text-purple-600" />,
      title: "Chấm điểm thông minh",
      description: "Đánh giá hiểu biết và phát hiện fake speed",
      status: "✅ Hoàn thành"
    },
    {
      icon: <FaRocket className="text-3xl text-orange-600" />,
      title: "Giao diện thân thiện",
      description: "UI/UX được tối ưu với animations mượt mà",
      status: "✅ Hoàn thành"
    }
  ];

  const technicalSpecs = [
    {
      category: "Frontend",
      items: ["React 18", "React Router", "Framer Motion", "Tailwind CSS", "React Icons"]
    },
    {
      category: "Algorithms",
      items: ["Scroll-based WPM tracking", "Exponential moving average", "Semantic similarity scoring", "Fake speed detection"]
    },
    {
      category: "Features",
      items: ["Real-time WPM display", "5W1H question generation", "MCQ with distractors", "Comprehensive results analysis"]
    },
    {
      category: "Performance",
      items: ["Optimized scroll handling", "Memoized calculations", "Responsive design", "Smooth animations"]
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
            SmartRead Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tính năng đo tốc độ đọc thông minh đã được tích hợp thành công vào website speed reading
          </p>
        </motion.div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-green-100 border-l-4 border-green-500 p-6 mb-8 rounded-r-lg"
        >
          <div className="flex items-center">
            <FaCheckCircle className="text-green-600 text-2xl mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                Tích hợp thành công!
              </h3>
              <p className="text-green-700">
                SmartRead đã được tích hợp hoàn chỉnh vào website với đầy đủ tính năng theo yêu cầu.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-start">
                <div className="mr-4">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {feature.description}
                  </p>
                  <div className="text-sm font-medium text-green-600">
                    {feature.status}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Technical Specifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Thông số kỹ thuật
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technicalSpecs.map((spec, index) => (
              <div key={index} className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {spec.category}
                </h3>
                <ul className="space-y-2">
                  {spec.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-gray-600 bg-gray-50 rounded-lg py-2 px-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Usage Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Hướng dẫn sử dụng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Truy cập</h3>
              <p className="text-gray-600 text-sm">Nhấn nút "SmartRead" trên header</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Nhập nội dung</h3>
              <p className="text-gray-600 text-sm">Dán văn bản hoặc nhập URL</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Đọc và đo</h3>
              <p className="text-gray-600 text-sm">Theo dõi WPM real-time</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Kiểm tra</h3>
              <p className="text-gray-600 text-sm">Làm bài kiểm tra hiểu biết</p>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white text-center"
        >
          <h2 className="text-2xl font-bold mb-4">
            Sẵn sàng để test!
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            SmartRead đã được tích hợp hoàn chỉnh với đầy đủ tính năng theo yêu cầu. 
            Bạn có thể truy cập ngay để trải nghiệm tính năng đo tốc độ đọc thông minh.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/smartread"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Truy cập SmartRead
            </a>
            <a
              href="/"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Về trang chủ
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SmartReadDemo;
