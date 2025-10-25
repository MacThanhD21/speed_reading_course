import React from 'react'
import { motion } from 'framer-motion'
import { HiClock, HiEye, HiLightBulb, HiExclamation } from 'react-icons/hi'

const PainPoints = () => {
  const painPoints = [
    {
      icon: HiClock,
      title: "Đọc chậm, không kịp deadline",
      description: "Bạn mất quá nhiều thời gian để đọc tài liệu, email, báo cáo và luôn cảm thấy áp lực về thời gian.",
      color: "text-red-500"
    },
    {
      icon: HiEye,
      title: "Dễ mất tập trung, đọc xong quên ngay",
      description: "Mắt bạn dễ bị phân tán, đọc xong một đoạn nhưng không nhớ gì, phải đọc lại nhiều lần.",
      color: "text-yellow-500"
    },
    {
      icon: HiLightBulb,
      title: "Không biết cách lọc thông tin quan trọng",
      description: "Bạn đọc tất cả mọi thứ như nhau, không biết đâu là điểm chính, đâu là chi tiết phụ.",
      color: "text-blue-500"
    }
  ]

  const scrollToSolution = () => {
    const element = document.getElementById('solution')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Bạn có đang gặp những vấn đề này?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Những khó khăn phổ biến khiến việc đọc trở nên chậm chạp và kém hiệu quả
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {painPoints.map((point, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300 card-hover"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center`}>
                <point.icon className={`w-8 h-8 ${point.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {point.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {point.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          className="text-center bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8 md:p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <HiExclamation className="w-16 h-16 text-accent-500 mx-auto mb-6" />
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Đừng lo lắng! Đã có giải pháp
          </h3>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Khoá học Kỹ Thuật Đọc Nhanh sẽ giúp bạn giải quyết tất cả những vấn đề trên một cách hiệu quả
          </p>
          <motion.button
            onClick={scrollToSolution}
            className="btn-primary text-lg px-8 py-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Khám phá giải pháp ngay
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default PainPoints
