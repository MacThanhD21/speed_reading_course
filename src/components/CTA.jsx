import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { HiCheck, HiPhone, HiMail, HiChat } from 'react-icons/hi'
import { FaMapMarkerAlt } from 'react-icons/fa'
import apiService from '../services/apiService'

// Message templates
const MESSAGE_TEMPLATES = [
  {
    id: 1,
    text: 'Tôi muốn tìm hiểu về khóa học đọc nhanh',
    icon: '📚'
  },
  {
    id: 2,
    text: 'Tôi cần tư vấn về khóa học và chương trình học',
    icon: '💬'
  },
  {
    id: 3,
    text: 'Tôi muốn đăng ký tham gia khóa học',
    icon: '🎯'
  },
  {
    id: 4,
    text: 'Tôi có câu hỏi về thời gian học và học phí',
    icon: '💰'
  },
  {
    id: 5,
    text: 'Tôi muốn biết thêm về phương pháp giảng dạy',
    icon: '✨'
  }
];

// Phone validation for Vietnamese numbers
const validateVietnamesePhone = (phone) => {
  if (!phone) return { isValid: true, error: '' };
  
  const cleaned = phone.replace(/[\s\-\.]/g, '');
  const phoneRegex = /^(0[3|5|7|8|9][0-9]{8}|01[2|6|8|9][0-9]{8}|02[0-9]{9})$/;
  
  if (!phoneRegex.test(cleaned)) {
    return { 
      isValid: false, 
      error: 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10-11 chữ số)' 
    };
  }
  
  return { isValid: true, error: '' };
};

const CTA = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    })
    
    setError('') // Clear error on change
    
    // Validate phone in real-time
    if (name === 'phone') {
      const validation = validateVietnamesePhone(value);
      setPhoneError(validation.error);
    }
  }

  const handleTemplateClick = (templateText) => {
    setFormData({
      ...formData,
      message: templateText
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      await apiService.createContact({
        ...formData,
        source: 'homepage'
      })
      
      setIsSubmitted(true)
      setFormData({ name: '', email: '', phone: '', address: '', message: '' })
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="cta" className="section-padding bg-gradient-to-br from-[#1A66CC] to-[#1555B0] text-white">
      <div className="container-custom">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Sẵn sàng bứt phá tốc độ đọc?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Tham gia cùng 500+ học viên đã thành công và trở thành người đọc nhanh chuyên nghiệp
          </p>
          {/* Trust badges in CTA */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-blue-100">
            <span className="flex items-center gap-1">
              <span>✅</span> Đảm bảo hoàn tiền
            </span>
            <span className="flex items-center gap-1">
              <span>✅</span> Chứng chỉ uy tín
            </span>
            <span className="flex items-center gap-1">
              <span>✅</span> 98% thành công
            </span>
          </div>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Cảm ơn bạn đã liên hệ!
                  </h3>
                  <p className="text-gray-600">
                    Chúng tôi sẽ phản hồi bạn sớm nhất có thể.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-900 placeholder:text-gray-400 bg-white"
                      placeholder="Nhập họ và tên của bạn"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-900 placeholder:text-gray-400 bg-white"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-900 placeholder:text-gray-400 bg-white ${
                        phoneError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                      }`}
                      placeholder="0901 234 567"
                    />
                    {phoneError && (
                      <p className="mt-1 text-xs text-red-600">{phoneError}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ (Tùy chọn)
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-900 placeholder:text-gray-400 bg-white"
                        placeholder="Nhập địa chỉ của bạn (ví dụ: Hải Phòng, Hà Nội)"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Tin nhắn
                    </label>
                    
                    {/* Message Templates */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      {MESSAGE_TEMPLATES.map((template) => (
                        <motion.button
                          key={template.id}
                          type="button"
                          onClick={() => handleTemplateClick(template.text)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                            formData.message === template.text
                              ? 'bg-[#1A66CC] text-white border-[#1A66CC]'
                              : 'bg-gray-50 text-gray-700 border-gray-300 hover:border-[#1A66CC] hover:text-[#1A66CC]'
                          }`}
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          <span className="mr-1">{template.icon}</span>
                          {template.text.length > 35 ? `${template.text.substring(0, 35)}...` : template.text}
                        </motion.button>
                      ))}
                    </div>
                    
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none text-gray-900 placeholder:text-gray-400 bg-white"
                      placeholder="Nhập tin nhắn của bạn hoặc chọn một mẫu ở trên..."
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1A66CC] hover:bg-[#1555B0] text-white font-semibold py-4 px-6 rounded-lg transition duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang gửi...
                      </>
                    ) : (
                      'Gửi thông tin'
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default CTA
