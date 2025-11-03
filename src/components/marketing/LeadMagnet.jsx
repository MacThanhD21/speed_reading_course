import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaFilePdf, FaGift, FaTimes } from 'react-icons/fa';
import apiService from '../../services/apiService';

const LeadMagnet = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await apiService.createContact({
        name: name || 'Lead Magnet Subscriber',
        email,
        phone: '',
        message: 'Đăng ký nhận tài liệu miễn phí: "10 Kỹ Thuật Đọc Nhanh Hiệu Quả"',
        source: 'lead_magnet'
      });

      setIsSubmitted(true);
      
      // In production, you would trigger email with PDF link or download
      // For now, we'll just show success message
      
      // Simulate download after 2 seconds
      setTimeout(() => {
        // You can trigger actual PDF download here
        // window.open('/downloads/10-ky-thuat-doc-nhanh.pdf', '_blank');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#1A66CC] to-[#1555B0] rounded-2xl p-6 md:p-8 text-white shadow-2xl relative"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      )}

      {isSubmitted ? (
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FaFilePdf className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-2">
            Cảm ơn bạn! 🎉
          </h3>
          <p className="text-blue-100 mb-4">
            Tài liệu đang được gửi vào email của bạn...
          </p>
          <div className="inline-flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
            <FaDownload className="w-4 h-4" />
            <span className="text-sm">Kiểm tra email để tải về</span>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <FaGift className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              Nhận tài liệu MIỄN PHÍ
            </h3>
            <p className="text-blue-100 text-lg mb-2">
              <span className="font-semibold">"10 Kỹ Thuật Đọc Nhanh Hiệu Quả"</span>
            </p>
            <p className="text-blue-50 text-sm">
              PDF 20 trang với các mẹo đọc nhanh đã được chứng minh
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none"
                placeholder="Họ và tên (tùy chọn)"
              />
            </div>

            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none"
                placeholder="Email của bạn *"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-300 text-white px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white hover:bg-gray-100 text-[#1A66CC] font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  <FaDownload className="w-4 h-4" />
                  Tải về miễn phí ngay
                </>
              )}
            </button>

            <p className="text-xs text-center text-blue-100">
              🔒 Chúng tôi tôn trọng quyền riêng tư của bạn. Không spam!
            </p>
          </form>
        </>
      )}
    </motion.div>
  );
};

export default LeadMagnet;

