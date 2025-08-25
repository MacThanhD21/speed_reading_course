import React from 'react'
import { motion } from 'framer-motion'
import { HiStar } from 'react-icons/hi'

const Testimonials = () => {
  const testimonials = [
    {
      name: "Nguyễn Thị Anh",
      role: "Sinh viên Đại học",
      avatar: "👩‍🎓",
      quote: "Mình tăng tốc độ đọc từ 250 lên 800 từ/phút sau 6 tuần. Không còn nỗi ám ảnh đọc chậm khi ôn thi nữa!",
      rating: 5,
      improvement: "250 → 800 WPM"
    },
    {
      name: "Trần Văn Bình",
      role: "Nhân viên văn phòng",
      avatar: "👨‍💼",
      quote: "Trước đây mình mất cả ngày để đọc báo cáo. Giờ chỉ cần 2-3 tiếng là xong. Hiệu quả thật sự rõ rệt!",
      rating: 5,
      improvement: "200 → 750 WPM"
    },
    {
      name: "Lê Thị Cẩm",
      role: "Giáo viên",
      avatar: "👩‍🏫",
      quote: "Kỹ thuật đọc nhanh giúp mình xử lý tài liệu giảng dạy nhanh hơn nhiều. Học viên cũng thấy mình chuyên nghiệp hơn.",
      rating: 5,
      improvement: "300 → 900 WPM"
    }
  ]

  return (
    <section className="section-padding gradient-bg">
      <div className="container-custom">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Học viên nói gì về khóa học?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Những phản hồi chân thực từ học viên đã hoàn thành khóa học Kỹ Thuật Đọc Nhanh
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 card-hover"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Quote Icon */}
              <div className="text-4xl mb-4">💬</div>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <HiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 mb-6 italic leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Improvement */}
              <div className="bg-primary-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-primary-700 font-semibold text-center">
                  Tăng tốc độ: {testimonial.improvement}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Statistics */}
        <motion.div 
          className="bg-white rounded-2xl p-8 md:p-12 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            Thống kê thành công của khóa học
          </h3>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <p className="text-gray-600">Học viên đã tốt nghiệp</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-600 mb-2">98%</div>
              <p className="text-gray-600">Tỷ lệ thành công</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">4.9/5</div>
              <p className="text-gray-600">Đánh giá trung bình</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">5x</div>
              <p className="text-gray-600">Tăng tốc độ trung bình</p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-6 py-3 rounded-full mb-6">
            <HiStar className="w-5 h-5" />
            <span className="font-semibold">Tham gia cùng 500+ học viên đã thành công</span>
          </div>
          <p className="text-lg text-gray-600">
            Bạn cũng có thể trở thành một trong số họ!
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials
