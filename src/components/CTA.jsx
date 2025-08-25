import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { HiCheck, HiPhone, HiMail, HiChat } from 'react-icons/hi'

const CTA = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', phone: '', message: '' })
    }, 3000)
  }

  return (
    <section id="cta" className="section-padding bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <div className="container-custom">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Sẵn sàng bứt phá tốc độ đọc?
          </h2>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
            Tham gia cùng 500+ học viên đã thành công và trở thành người đọc nhanh chuyên nghiệp
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-3xl shadow-2xl p-2 md:p-4 border border-gray-100">
              <div className="rounded-2xl overflow-hidden">
                <iframe
                  src="https://docs.google.com/forms/d/e/1FAIpQLSdpYzk8_dOww9Cr5BL8lGb7hQTDV5dBnKf3q2XFC4hKapiuhA/viewform?embedded=true"
                  width="70%"
                  height="640"
                  frameBorder="0"
                  marginHeight="0"
                  marginWidth="0"
                  title="Đăng ký khóa học Đọc Nhanh"
                  className="w-full"
                >
                  Đang tải…
                </iframe>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default CTA
