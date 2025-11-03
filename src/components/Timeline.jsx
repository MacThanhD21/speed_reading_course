import React from 'react'
import { motion } from 'framer-motion'
import { HiCheck, HiTrendingUp, HiStar, HiLightningBolt } from 'react-icons/hi'

const Timeline = () => {
  const sessions = [
    {
      session: "Buổi 1",
      title: "Loại bỏ thói quen xấu",
      description: "Nhận diện và loại bỏ những thói quen đọc chậm, học cách đặt mục tiêu rõ ràng.",
      target: "250 WPM",
      icon: HiCheck,
      color: "from-[#1A66CC] to-[#1555B0]"
    },
    {
      session: "Buổi 2",
      title: "Tăng tốc cơ bản",
      description: "Học kỹ thuật Hand Pacing cơ bản, thực hành với tài liệu đơn giản.",
      target: "400 WPM",
      icon: HiTrendingUp,
      color: "from-[#34D399] to-[#10B981]"
    },
    {
      session: "Buổi 3",
      title: "Trung cấp",
      description: "Áp dụng Skimming & Scanning, đọc hiểu nhanh các đoạn văn bản.",
      target: "600 WPM",
      icon: HiStar,
      color: "from-yellow-500 to-yellow-600"
    },
    {
      session: "Buổi 4",
      title: "Nâng cao",
      description: "Thành thạo kỹ thuật Chunking, đọc theo cụm từ có ý nghĩa.",
      target: "800 WPM",
      icon: HiLightningBolt,
      color: "from-orange-500 to-orange-600"
    },
    {
      session: "Buổi 5",
      title: "Ứng dụng thực tế",
      description: "Áp dụng vào tài liệu thực tế: sách, báo, email, báo cáo công việc.",
      target: "900 WPM",
      icon: HiCheck,
      color: "from-purple-500 to-purple-600"
    },
    {
      session: "Buổi 6",
      title: "Tổng kết & Cá nhân hoá",
      description: "Đánh giá kết quả, xây dựng routine đọc cá nhân lâu dài.",
      target: "1000+ WPM",
      icon: HiStar,
      color: "from-red-500 to-red-600"
    }
  ]

  return (
    <section id="timeline" className="section-padding bg-white">
      <div className="container-custom">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Chỉ với 6 buổi – Thay đổi thói quen đọc mãi mãi
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Lộ trình học được thiết kế khoa học, từ cơ bản đến nâng cao, giúp bạn đạt được mục tiêu một cách tự nhiên
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary-200 to-accent-200 z-0"></div>

          <div className="space-y-12">
            {sessions.map((session, index) => (
              <motion.div
                key={index}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } flex-col lg:space-x-8 space-y-4 lg:space-y-0`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Session Card */}
                <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'} text-center lg:text-left z-10`}>
                  <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 card-hover z-10">
                    <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${session.color} flex items-center justify-center shadow-lg`}>
                        <session.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{session.session}</h3>
                        <p className="text-sm text-gray-500">Mục tiêu: {session.target}</p>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 mb-3">
                      {session.title}
                    </h4>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {session.description}
                    </p>
                  </div>
                </div>

                {/* Timeline dot */}
                <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-4 border-primary-500 rounded-full shadow-lg z-0"></div>

                {/* Progress indicator */}
                <div className="lg:hidden w-full flex justify-center">
                  <div className="w-6 h-6 bg-primary-500 rounded-full shadow-lg"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <motion.div 
          className="mt-16 text-center bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8 md:p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Kết quả sau 6 buổi học
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">5x</div>
              <p className="text-gray-600">Tăng tốc độ đọc</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-600 mb-2">80%</div>
              <p className="text-gray-600">Tiết kiệm thời gian</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
              <p className="text-gray-600">Học viên hài lòng</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Timeline
