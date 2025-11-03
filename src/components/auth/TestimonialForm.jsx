import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaUser, FaCheckCircle } from 'react-icons/fa';
import apiService from '../../services/apiService';
import { useNotification } from '../../context/NotificationContext';

const TestimonialForm = () => {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    role: 'Học viên',
    avatar: '👤',
    quote: '',
    rating: 5,
    improvement: '',
  });
  const [existingTestimonial, setExistingTestimonial] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const AVATAR_OPTIONS = ['👤', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '💼', '🎓'];

  useEffect(() => {
    loadMyTestimonial();
  }, []);

  const loadMyTestimonial = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getMyTestimonial();
      if (response.success && response.data) {
        setExistingTestimonial(response.data);
        setFormData({
          role: response.data.role || 'Học viên',
          avatar: response.data.avatar || '👤',
          quote: response.data.quote || '',
          rating: response.data.rating || 5,
          improvement: response.data.improvement || '',
        });
      }
    } catch (error) {
      console.error('Error loading testimonial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRatingClick = (rating) => {
    setFormData({
      ...formData,
      rating,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let response;
      if (existingTestimonial) {
        response = await apiService.updateMyTestimonial(formData);
      } else {
        response = await apiService.createTestimonial(formData);
      }

      if (response.success) {
        showSuccess(
          existingTestimonial
            ? 'Cập nhật đánh giá thành công! Chúng tôi sẽ xem xét lại.'
            : 'Cảm ơn bạn đã đánh giá! Chúng tôi sẽ xem xét và hiển thị trong thời gian sớm nhất.',
          'Thành công'
        );
        await loadMyTestimonial();
      } else {
        showError(response.message || 'Có lỗi xảy ra', 'Lỗi');
      }
    } catch (err) {
      showError(err.message || 'Có lỗi xảy ra khi gửi đánh giá', 'Lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A66CC]"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đánh giá khóa học</h2>
        <p className="text-gray-600">
          {existingTestimonial
            ? existingTestimonial.isActive
              ? 'Đánh giá của bạn đã được duyệt và hiển thị công khai. Bạn không thể chỉnh sửa. Liên hệ admin nếu cần thay đổi.'
              : 'Đánh giá của bạn đang chờ duyệt. Bạn có thể chỉnh sửa bên dưới.'
            : 'Chia sẻ trải nghiệm của bạn sau khi hoàn thành khóa học!'}
        </p>
        {existingTestimonial?.isActive && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
            <FaCheckCircle className="text-green-600 mr-2" />
            <span className="text-green-800 text-sm">Đánh giá của bạn đã được hiển thị công khai</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Vai trò của bạn *
          </label>
          <input
            type="text"
            id="role"
            name="role"
            required
            value={formData.role}
            onChange={handleChange}
            disabled={existingTestimonial?.isActive}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Ví dụ: Sinh viên, Nhân viên văn phòng, Giáo viên..."
          />
        </div>

        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn biểu tượng
          </label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_OPTIONS.map((avatar) => (
              <button
                key={avatar}
                type="button"
                onClick={() => !existingTestimonial?.isActive && setFormData({ ...formData, avatar })}
                disabled={existingTestimonial?.isActive}
                className={`text-2xl p-3 rounded-lg border-2 transition-all ${
                  formData.avatar === avatar
                    ? 'border-[#1A66CC] bg-blue-50'
                    : 'border-gray-300 hover:border-[#1A66CC] hover:bg-gray-50'
                } ${existingTestimonial?.isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đánh giá của bạn *
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => !existingTestimonial?.isActive && handleRatingClick(star)}
                disabled={existingTestimonial?.isActive}
                className={`transition-all ${
                  star <= formData.rating
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                } ${existingTestimonial?.isActive ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
              >
                <FaStar className="w-6 h-6 fill-current" />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {formData.rating}/5 sao
            </span>
          </div>
        </div>

        {/* Quote */}
        <div>
          <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung đánh giá *
          </label>
          <textarea
            id="quote"
            name="quote"
            required
            rows="5"
            value={formData.quote}
            onChange={handleChange}
            disabled={existingTestimonial?.isActive}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Chia sẻ trải nghiệm của bạn về khóa học..."
          />
        </div>

        {/* Improvement */}
        <div>
          <label htmlFor="improvement" className="block text-sm font-medium text-gray-700 mb-2">
            Cải thiện tốc độ đọc (Tùy chọn)
          </label>
          <input
            type="text"
            id="improvement"
            name="improvement"
            value={formData.improvement}
            onChange={handleChange}
            disabled={existingTestimonial?.isActive}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Ví dụ: 250 → 800 WPM"
          />
          <p className="mt-1 text-xs text-gray-500">
            Ví dụ: 250 → 800 WPM, hoặc 200 từ/phút → 750 từ/phút
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || existingTestimonial?.isActive}
          className="w-full bg-[#1A66CC] hover:bg-[#1555B0] text-white font-semibold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Đang gửi...
            </>
          ) : existingTestimonial ? (
            'Cập nhật đánh giá'
          ) : (
            'Gửi đánh giá'
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default TestimonialForm;

