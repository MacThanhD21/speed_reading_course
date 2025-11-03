import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRocket, FaBolt } from 'react-icons/fa';

const AuthLayout = ({ children, mode = 'login' }) => {
  const location = useLocation();
  const isLogin = location.pathname === '/login' || mode === 'login';
  const isRegister = location.pathname === '/register' || mode === 'register';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4 py-6">
      <div className="w-full max-w-4xl rounded-xl overflow-hidden shadow-xl bg-white grid md:grid-cols-[38%_62%] max-h-[95vh] overflow-y-auto">
        {/* Left Panel - Blue Background */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1A66CC] hidden md:flex flex-col items-center justify-center p-6 md:p-8 text-white relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-8 right-8 w-24 h-24 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-8 left-8 w-20 h-20 bg-white rounded-full blur-2xl"></div>
          </div>

          <div className="relative z-10 text-center px-4">
            {/* Rocket Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <FaRocket className="text-5xl md:text-6xl text-white mx-auto" />
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl font-bold mb-3 leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Unlock Your Reading Potential
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm md:text-base text-white/90 leading-relaxed max-w-xs mx-auto"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}
            >
              Read faster, learn more, and boost your productivity. Welcome to the future of learning.
            </motion.p>
          </div>
        </motion.div>

        {/* Right Panel - White Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-4 sm:p-6 md:p-8"
        >
          {/* Logo and Tabs */}
          <div className="mb-6">
            {/* QuickRead Logo */}
            <div className="flex items-center gap-2 mb-4">
              <FaBolt className="text-[#1A66CC] text-xl md:text-2xl" />
              <span
                className="text-xl md:text-2xl font-bold text-[#1A66CC]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                QuickRead
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 mb-4">
              <Link
                to="/login"
                className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                  isLogin
                    ? 'text-[#1A66CC]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Login
                {isLogin && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A66CC]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
              <Link
                to="/register"
                className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                  isRegister
                    ? 'text-[#1A66CC]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Register
                {isRegister && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A66CC]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </div>
          </div>

          {/* Form Content */}
          <div className="w-full">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;

