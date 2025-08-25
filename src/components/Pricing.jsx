import React from 'react'
import { motion } from 'framer-motion'
import { HiCheck, HiStar, HiClock, HiBookOpen, HiGift } from 'react-icons/hi'

const Pricing = () => {
  const features = [
    "6 buổi học online hoặc offline",
    "Mỗi buổi 30 phút",
    "Giáo viên chuyên môn cao",
    "Bài tập thực hành trong buổi",
    "Theo dõi WPM trực tiếp",
    "Hỗ trợ sau khóa học",
    "Chứng chỉ hoàn thành",
    "Cộng đồng học viên hỗ trợ"
  ]

  const scrollToCTA = () => {
    // Add a small delay to ensure CTA component is fully rendered
    setTimeout(() => {
      const element = document.getElementById('cta')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      } else {
        // Fallback: scroll to bottom if element not found
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        })
      }
    }, 100)
  }

  return (
    <section id="pricing" className="section-padding bg-white">
      <div className="container-custom">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Học phí & Ưu đãi
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Đầu tư một lần, sở hữu kỹ năng đọc nhanh suốt đời
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Main Pricing Card */}
          <motion.div 
            className="relative bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-accent-500 text-white px-6 py-2 rounded-full font-semibold flex items-center space-x-2">
                <HiStar className="w-5 h-5" />
                <span>Khóa học bán chạy nhất</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Khoá học Kỹ Thuật Đọc Nhanh
              </h3>
              <p className="text-xl text-primary-100 mb-6">
                Trọn bộ 6 buổi học với giáo viên chuyên môn
              </p>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-4 mb-2">
                <span className="text-4xl md:text-5xl font-bold">1.200.000</span>
                <span className="text-xl text-primary-100">VNĐ</span>
              </div>
              <p className="text-primary-100">
                <span className="line-through text-lg">1.500.000 VNĐ</span>
                <span className="ml-2 text-accent-300 font-semibold">Tiết kiệm 300.000 VNĐ</span>
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <HiCheck className="w-5 h-5 text-accent-300 flex-shrink-0" />
                  <span className="text-primary-100">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <button
                onClick={scrollToCTA}
                className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Đăng ký ngay hôm nay
              </button>
              <p className="text-primary-100 text-sm mt-3">
                ⚡ Số lượng có hạn - Ưu đãi chỉ dành cho 50 học viên đầu tiên
              </p>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div 
            className="mt-12 grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiClock className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Linh hoạt thời gian</h4>
              <p className="text-gray-600">Học theo lịch trình phù hợp với bạn</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiStar className="w-8 h-8 text-accent-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Coach 1-1 tận tâm</h4>
              <p className="text-gray-600">Theo sát tiến độ, chỉnh kỹ thuật trực tiếp</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiClock className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Lịch học linh hoạt</h4>
              <p className="text-gray-600">Tuỳ chọn giờ học phù hợp thời gian của bạn</p>
            </div>
          </motion.div>

          {/* Guarantee */}
          <motion.div 
            className="mt-12 text-center bg-gray-50 rounded-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h4 className="text-2xl font-bold text-gray-900 mb-4">
              Cam kết hoàn tiền 100%
            </h4>
            <p className="text-gray-600 mb-6">
              Nếu sau 2 buổi học đầu tiên bạn không hài lòng, chúng tôi sẽ hoàn tiền 100% mà không cần lý do
            </p>
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <HiCheck className="w-5 h-5" />
              <span className="font-semibold">Cam kết chất lượng - An tâm học tập</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Pricing
