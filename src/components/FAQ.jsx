import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChevronDown, HiQuestionMarkCircle } from 'react-icons/hi'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "Khoá học này phù hợp với ai?",
      answer: "Khoá học phù hợp với tất cả mọi người từ 16 tuổi trở lên, đặc biệt là sinh viên, nhân viên văn phòng, giáo viên, nhà nghiên cứu và bất kỳ ai muốn cải thiện tốc độ đọc và hiệu quả học tập."
    },
    {
      question: "Nếu bận không theo đủ lịch thì sao?",
      answer: "Chúng tôi rất linh hoạt về thời gian. Bạn có thể sắp xếp lịch học phù hợp với lịch trình của mình. Nếu cần hoãn buổi học, chỉ cần thông báo trước 24h."
    },
    {
      question: "Cần chuẩn bị gì trước khi học?",
      answer: "Bạn chỉ cần chuẩn bị máy tính có kết nối internet, tai nghe và không gian yên tĩnh để học tập. Tất cả tài liệu và công cụ sẽ được cung cấp trong khóa học."
    },
    {
      question: "Khoá học có cam kết kết quả không?",
      answer: "Có! Chúng tôi cam kết 100% bạn sẽ tăng tốc độ đọc lên ít nhất 3 lần sau 6 buổi học. Nếu không đạt được mục tiêu, bạn sẽ được học lại miễn phí hoặc hoàn tiền."
    },
    {
      question: "Sau khóa học có cần luyện tập thêm không?",
      answer: "Để duy trì và phát triển kỹ năng, bạn nên luyện tập 15-20 phút mỗi ngày trong 2-3 tuần đầu. Sau đó, kỹ năng sẽ trở thành thói quen tự nhiên."
    },
    {
      question: "Có thể áp dụng cho việc đọc tiếng Anh không?",
      answer: "Hoàn toàn có thể! Các kỹ thuật đọc nhanh có thể áp dụng cho mọi ngôn ngữ. Nhiều học viên đã thành công áp dụng để đọc tài liệu tiếng Anh nhanh hơn."
    },
    {
      question: "Khoá học có cấp chứng chỉ không?",
      answer: "Có! Sau khi hoàn thành khóa học, bạn sẽ nhận được chứng chỉ hoàn thành có giá trị quốc tế, có thể sử dụng trong CV và hồ sơ xin việc."
    },
    {
      question: "Có hỗ trợ sau khóa học không?",
      answer: "Có! Bạn sẽ được hỗ trợ trong 3 tháng sau khóa học thông qua nhóm Facebook, email và hotline. Chúng tôi luôn sẵn sàng giải đáp thắc mắc của bạn."
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
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
            Câu hỏi thường gặp
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Những thắc mắc phổ biến về khóa học Kỹ Thuật Đọc Nhanh
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <button
                  className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-300 flex items-center justify-between"
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex items-center space-x-3">
                    <HiQuestionMarkCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <HiChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-4 bg-white border-t border-gray-200">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <motion.div 
          className="mt-16 text-center bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8 md:p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Vẫn còn thắc mắc?
          </h3>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Đội ngũ tư vấn của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 font-bold">📞</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Hotline</h4>
              <p className="text-primary-600 font-medium">0982316213</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-accent-600 font-bold">💬</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Zalo</h4>
              <p className="text-accent-600 font-medium">https://chat.zalo.me/0982316213</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">✉️</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
              <p className="text-green-600 font-medium">macthanhkmhd2003@gmail.com</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FAQ
