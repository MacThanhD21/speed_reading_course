import React from 'react'
import { motion } from 'framer-motion'
import { HiHand, HiSearch, HiCube } from 'react-icons/hi'

const Solution = () => {
  const techniques = [
    {
      icon: HiHand,
      title: "Hand Pacing",
      subtitle: "Tập trung mắt, tránh mất dòng",
      description: "Sử dụng ngón tay hoặc bút để dẫn mắt theo dòng chữ, giúp tăng tốc độ đọc và duy trì sự tập trung.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: HiSearch,
      title: "Skimming & Scanning & Previewing",
      subtitle: "Lướt nhanh, quét ý chính",
      description: "Học cách đọc lướt để nắm bắt ý chính, quét nhanh để tìm thông tin cụ thể, và xem trước để hiểu cấu trúc.",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: HiCube,
      title: "Chunking",
      subtitle: "Đọc theo cụm từ, tăng tốc độ và ghi nhớ",
      description: "Thay vì đọc từng từ riêng lẻ, học cách đọc theo nhóm từ có ý nghĩa, giúp tăng tốc độ và cải thiện khả năng ghi nhớ.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    }
  ]

  return (
    <section id="solution" className="section-padding gradient-bg">
      <div className="container-custom">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Giải pháp hoàn hảo cho bạn
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khoá học áp dụng <span className="font-semibold text-primary-600">3 kỹ thuật cốt lõi</span> giúp bạn bứt phá tốc độ đọc
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {techniques.map((technique, index) => (
            <motion.div
              key={index}
              className={`${technique.bgColor} rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 card-hover`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              {/* Icon with gradient background */}
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${technique.color} flex items-center justify-center shadow-lg`}>
                <technique.icon className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {technique.title}
              </h3>
              
              <p className="text-lg font-semibold text-primary-600 mb-4">
                {technique.subtitle}
              </p>
              
              <p className="text-gray-600 leading-relaxed">
                {technique.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div 
          className="text-center bg-white rounded-2xl p-8 md:p-12 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Tại sao 3 kỹ thuật này lại hiệu quả?
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 font-bold text-lg">1</span>
              </div>
              <p className="text-gray-600 font-medium">Được nghiên cứu khoa học</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-accent-600 font-bold text-lg">2</span>
              </div>
              <p className="text-gray-600 font-medium">Áp dụng ngay lập tức</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 font-bold text-lg">3</span>
              </div>
              <p className="text-gray-600 font-medium">Kết quả rõ rệt</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-accent-600 font-bold text-lg">4</span>
              </div>
              <p className="text-gray-600 font-medium">Duy trì lâu dài</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Solution
