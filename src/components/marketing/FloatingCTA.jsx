import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowUp, FaTimes } from 'react-icons/fa';

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 300);
      
      // Show CTA after scrolling past hero section
      if (scrollY > 500 && scrollY < document.documentElement.scrollHeight - 1000) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCTA = () => {
    const element = document.getElementById('cta');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {/* Floating CTA Button */}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-[60]"
        >
          <motion.button
            onClick={scrollToCTA}
            className="bg-gradient-to-r from-[#34D399] to-[#10B981] hover:from-[#10B981] hover:to-[#059669] text-white font-semibold px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <span>🎁 Đăng ký ngay - Nhận ưu đãi 10%</span>
          </motion.button>
        </motion.div>
      )}

      {/* Scroll to Top Button */}
      {isScrolled && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-[#1A66CC] hover:bg-[#1555B0] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Lên đầu trang"
        >
          <FaArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default FloatingCTA;

