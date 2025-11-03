import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPhone, FaTimes, FaEnvelope, FaComment } from 'react-icons/fa';
import { HiChatAlt2 } from 'react-icons/hi';

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const contactOptions = [
    {
      icon: FaPhone,
      label: 'Hotline',
      value: '0982316213',
      action: () => window.open('tel:0982316213', '_self'),
      color: 'bg-[#1A66CC]'
    },
    {
      icon: FaComment,
      label: 'Zalo',
      value: '0982316213',
      action: () => window.open('https://chat.zalo.me/0982316213', '_blank'),
      color: 'bg-blue-600'
    },
    {
      icon: FaEnvelope,
      label: 'Email',
      value: 'macthanhkmhd2003@gmail.com',
      action: () => window.open('mailto:macthanhkmhd2003@gmail.com', '_self'),
      color: 'bg-[#34D399]'
    }
  ];

  return (
    <div className="fixed bottom-6 left-6 z-[55]" ref={menuRef}>
      <AnimatePresence>
        {/* Contact Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mb-4 bg-white rounded-2xl shadow-2xl p-4 min-w-[280px] border border-gray-100"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Vẫn còn thắc mắc?
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Đội ngũ tư vấn của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
            </p>

            <div className="space-y-2">
              {contactOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={index}
                    onClick={option.action}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`${option.color} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900 text-sm">{option.label}</div>
                      <div className="text-xs text-gray-600">{option.value}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-[#1A66CC] to-[#1555B0] text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-3xl transition-all duration-300 relative overflow-hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Liên hệ"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaTimes className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HiChatAlt2 className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse animation */}
        <motion.div
          className="absolute inset-0 bg-white rounded-full"
          animate={{
            scale: [1, 1.5, 1.5],
            opacity: [0.5, 0, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </motion.button>
    </div>
  );
};

export default FloatingContact;

