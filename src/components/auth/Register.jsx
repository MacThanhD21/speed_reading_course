import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaBookOpen } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    return { minLength, hasNumber, isValid: minLength && hasNumber };
  };

  const passwordValidation = validatePassword(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!passwordValidation.isValid) {
      setError('Mật khẩu phải có ít nhất 6 ký tự và 1 số');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 py-12 md:py-20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:block text-center md:text-left"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-6">
              <FaBookOpen className="text-white text-4xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Bắt đầu hành trình
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Tạo tài khoản miễn phí và khám phá cách đọc nhanh hiệu quả với AI. 
              Học tập thông minh, theo dõi tiến độ và cải thiện kỹ năng mỗi ngày.
            </p>
          </motion.div>

          {/* Features list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {[
              { icon: '🚀', text: 'SmartRead với AI thông minh' },
              { icon: '📊', text: 'Thống kê chi tiết WPM, REI, RCI' },
              { icon: '🎯', text: 'Quiz và đánh giá hiểu biết' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center space-x-3 text-gray-700"
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-base">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right side - Register Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4"
              >
                <FaUser className="text-white text-2xl" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Đăng ký
              </h2>
              <p className="text-gray-600">Tạo tài khoản mới để bắt đầu</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên
                </label>
                <div className="relative group">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-all duration-300 ${
                    focusedField === 'name' ? 'bg-gradient-to-b from-blue-500 to-indigo-600' : 'bg-transparent'
                  }`}></div>
                  <FaUser className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'name' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </motion.div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative group">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-all duration-300 ${
                    focusedField === 'email' ? 'bg-gradient-to-b from-blue-500 to-indigo-600' : 'bg-transparent'
                  }`}></div>
                  <FaEnvelope className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'email' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                    placeholder="example@email.com"
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-all duration-300 ${
                    focusedField === 'password' ? 'bg-gradient-to-b from-blue-500 to-indigo-600' : 'bg-transparent'
                  }`}></div>
                  <FaLock className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'password' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                    placeholder="Tối thiểu 6 ký tự, có số"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {/* Password validation */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className={`flex items-center space-x-2 text-xs ${
                      passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <FaCheckCircle className={passwordValidation.minLength ? 'text-green-500' : 'text-gray-300'} size={12} />
                      <span>Ít nhất 6 ký tự</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-xs ${
                      passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <FaCheckCircle className={passwordValidation.hasNumber ? 'text-green-500' : 'text-gray-300'} size={12} />
                      <span>Có ít nhất 1 số</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Xác nhận mật khẩu
                </label>
                <div className="relative group">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-all duration-300 ${
                    focusedField === 'confirmPassword' ? 'bg-gradient-to-b from-blue-500 to-indigo-600' : 'bg-transparent'
                  }`}></div>
                  <FaLock className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'confirmPassword' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-300 focus:border-red-500'
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-green-300 focus:border-green-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="Nhập lại mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className="mt-2">
                    {formData.password === formData.confirmPassword ? (
                      <div className="flex items-center space-x-2 text-xs text-green-600">
                        <FaCheckCircle className="text-green-500" size={12} />
                        <span>Mật khẩu khớp</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-xs text-red-600">
                        <span>⚠️</span>
                        <span>Mật khẩu không khớp</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2"
                >
                  <span className="text-red-500 mt-0.5">⚠️</span>
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading || !passwordValidation.isValid || formData.password !== formData.confirmPassword}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group mt-6"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Đang đăng ký...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng ký</span>
                      <FaCheckCircle className="text-sm" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </motion.button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

    </div>
  );
};

export default Register;
