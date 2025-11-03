import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaGift, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import apiService from '../../services/apiService';

const ExitIntentPopup = ({ onClose, onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Detect mouse leaving viewport (exit intent)
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !isSubmitted) {
        // Mouse moved to top of screen (likely closing tab)
        // Don't show popup immediately, wait a bit
        setTimeout(() => {
          // Only show if user hasn't submitted form
          if (!localStorage.getItem('exitIntentShown')) {
            // This will be handled by parent component
          }
        }, 100);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [isSubmitted]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await apiService.createContact({
        ...formData,
        source: 'exit_intent_popup',
        message: 'Đăng ký từ Exit Intent Popup'
      });

      localStorage.setItem('exitIntentShown', 'true');
      setIsSubmitted(true);
      
      // Scroll to CTA after delay
      setTimeout(() => {
        const element = document.getElementById('cta');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>

          {isSubmitted ? (
            <div className="text-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <FaGift className="w-8 h-8 text-[#34D399]" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Cảm ơn bạn! 🎉
              </h3>
              <p className="text-gray-600 mb-4">
                Chúng tôi sẽ liên hệ với bạn sớm nhất!
              </p>
              <p className="text-sm text-[#1A66CC] font-semibold">
                Nhận ngay ưu đãi 10% cho lần đăng ký đầu tiên!
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#34D399] to-[#10B981] rounded-full mb-4">
                  <FaGift className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Đợi đã! Bạn sắp bỏ lỡ điều gì đó...
                </h3>
                <p className="text-gray-600 mb-2">
                  Nhận ngay <span className="font-bold text-[#1A66CC]">ưu đãi đặc biệt 10%</span> khi đăng ký ngay bây giờ!
                </p>
                <div className="inline-flex items-center space-x-2 bg-[#34D399]/10 text-[#34D399] px-4 py-2 rounded-full text-sm font-semibold">
                  <span>🎁 Giảm 120.000 VNĐ</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none text-gray-900"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none text-gray-900"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none text-gray-900"
                    placeholder="0901 234 567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ (Tùy chọn)
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none text-gray-900"
                      placeholder="Nhập địa chỉ (ví dụ: Hải Phòng, Hà Nội)"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#1A66CC] to-[#1555B0] hover:from-[#1555B0] hover:to-[#124A9D] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaGift className="w-4 h-4" />
                      Nhận ưu đãi ngay
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-500">
                  Bằng cách đăng ký, bạn đồng ý nhận thông tin về khóa học
                </p>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExitIntentPopup;

