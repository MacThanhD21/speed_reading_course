import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiStar } from 'react-icons/hi'
import apiService from '../services/apiService'

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true)
        const response = await apiService.getTestimonials()
        if (response.success && response.data) {
          setTestimonials(response.data)
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err)
        setError('Không thể tải đánh giá')
        // Fallback to empty array, component will handle gracefully
        setTestimonials([])
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

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
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A66CC] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Học viên nói gì về khóa học?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Những phản hồi chân thực từ học viên đã hoàn thành khóa học Kỹ Thuật Đọc Nhanh
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A66CC]"></div>
            <p className="mt-4 text-gray-600">Đang tải đánh giá...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial._id || testimonial.id || index}
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
              {testimonial.improvement && (
                <div className="bg-primary-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-primary-700 font-semibold text-center">
                    Tăng tốc độ: {testimonial.improvement}
                  </p>
                </div>
              )}

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
        )}

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
