import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaFacebook, FaMapMarkerAlt } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        address: formData.address,
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
    <AuthLayout mode="register">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-[#1A66CC] focus:ring-2 focus:ring-[#1A66CC]/20 outline-none transition-all text-sm text-gray-800 placeholder-gray-400"
              placeholder="Enter your full name"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-[#1A66CC] focus:ring-2 focus:ring-[#1A66CC]/20 outline-none transition-all text-sm text-gray-800 placeholder-gray-400"
              placeholder="Enter your email"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
          </div>
        </div>

        {/* Address Field */}
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
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-[#1A66CC] focus:ring-2 focus:ring-[#1A66CC]/20 outline-none transition-all text-sm text-gray-800 placeholder-gray-400"
              placeholder="Nhập địa chỉ của bạn (ví dụ: Hải Phòng, Hà Nội)"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-[#1A66CC] focus:ring-2 focus:ring-[#1A66CC]/20 outline-none transition-all text-sm text-gray-800 placeholder-gray-400"
              placeholder="Enter your password"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                <span>At least 6 characters</span>
              </div>
              <div className={`flex items-center space-x-2 text-xs ${
                passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'
              }`}>
                <FaCheckCircle className={passwordValidation.hasNumber ? 'text-green-500' : 'text-gray-300'} size={12} />
                <span>At least 1 number</span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full pl-10 pr-12 py-2.5 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 outline-none transition-all text-sm text-gray-800 placeholder-gray-400 ${
                formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : formData.confirmPassword && formData.password === formData.confirmPassword
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                  : 'border-gray-300 focus:border-[#1A66CC] focus:ring-[#1A66CC]/20'
              }`}
              placeholder="Confirm your password"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {formData.confirmPassword && (
            <div className="mt-2">
              {formData.password === formData.confirmPassword ? (
                <div className="flex items-center space-x-2 text-xs text-green-600">
                  <FaCheckCircle className="text-green-500" size={12} />
                  <span>Passwords match</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-xs text-red-600">
                  <span>⚠️</span>
                  <span>Passwords do not match</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* reCAPTCHA Placeholder */}
        <div className="flex items-center gap-2 p-2.5 border border-gray-300 rounded-lg bg-gray-50">
          <input
            type="checkbox"
            id="recaptcha"
            className="w-4 h-4 rounded border-gray-300 text-[#1A66CC] focus:ring-[#1A66CC]"
          />
          <label htmlFor="recaptcha" className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
            <span>I'm not a robot</span>
            <span className="text-xs text-gray-500">reCAPTCHA</span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {error}
          </motion.div>
        )}

        {/* Register Button */}
        <motion.button
          type="submit"
          disabled={isLoading || !passwordValidation.isValid || formData.password !== formData.confirmPassword}
          whileHover={{ scale: isLoading ? 1 : 1.01 }}
          whileTap={{ scale: isLoading ? 1 : 0.99 }}
          className="w-full bg-[#1A66CC] hover:bg-[#1555B0] text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registering...
            </span>
          ) : (
            'Register'
          )}
        </motion.button>

        {/* Separator */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-500" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all text-gray-700 font-medium text-xs"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <FcGoogle size={16} />
            <span className="text-xs">Continue with Google</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-lg transition-all font-medium text-xs"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <FaFacebook size={16} />
            <span className="text-xs">Continue with Facebook</span>
          </button>
        </div>

        {/* Admin Login Link */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Are you an administrator?{' '}
            <Link
              to="/admin/login"
              className="text-[#1A66CC] hover:text-[#1555B0] hover:underline font-medium"
            >
              Admin Login
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
