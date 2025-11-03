import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { HiArrowDown, HiPlay, HiTrendingUp } from 'react-icons/hi'
import VideoModal from './VideoModal'

const Hero = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  
  const scrollToCTA = () => {
    // Add a small delay to ensure CTA component is fully rendered
    setTimeout(() => {
      const element = document.getElementById('cta')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      } else {
        // Fallback: scroll to bottom if element not found
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        })
      }
    }, 100)
  }

  const openVideo = () => {
    setIsVideoOpen(true)
  }

  const closeVideo = () => {
    setIsVideoOpen(false)
  }

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden gradient-bg">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-slow"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Headline */}
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="block text-[#1A66CC] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Đọc Nhanh
            </span>
            <span className="block text-gray-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Tăng Tốc Hiệu Quả
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Khoá học giúp bạn tăng tốc độ đọc từ{' '}
            <span className="font-semibold text-[#1A66CC]">200</span> →{' '}
            <span className="font-semibold text-[#34D399]">1000+ từ/phút</span>{' '}
            chỉ sau <span className="font-semibold text-[#1A66CC]">6 buổi học</span>.
          </motion.p>

          {/* Stats */}
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-8 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-center space-x-2">
              <HiTrendingUp className="w-6 h-6 text-[#34D399]" />
              <span className="text-lg font-semibold text-gray-700" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>6 buổi học</span>
            </div>
            <div className="flex items-center space-x-2">
              <HiPlay className="w-6 h-6 text-[#1A66CC]" />
              <span className="text-lg font-semibold text-gray-700" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>30 phút - 60 phút/buổi</span>
            </div>
            <div className="flex items-center space-x-2">
              <HiTrendingUp className="w-6 h-6 text-[#34D399]" />
              <span className="text-lg font-semibold text-gray-700" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Online - Offline</span>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            onClick={scrollToCTA}
            className="bg-[#34D399] hover:bg-[#10B981] text-white font-semibold text-lg px-8 py-4 mb-16 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Đăng Ký Ngay
          </motion.button>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <HiArrowDown className="w-6 h-6 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cuộn xuống để tìm hiểu thêm</p>
            </motion.div>
          </motion.div>


        </div>
      </div>

      {/* Video Preview (if available) */}
      <motion.div 
        className="absolute bottom-20 right-8 lg:right-20 md:bottom-16 md:right-16 bottom-12 right-4"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div 
          className="relative group cursor-pointer"
          onClick={openVideo}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              openVideo()
            }
          }}
        >
          <div className="w-16 h-16 md:w-20 md:h-20 bg-[#1A66CC] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
            <HiPlay className="w-6 h-6 md:w-8 md:h-8 text-white ml-1" />
          </div>
          <div className="absolute -bottom-6 md:-bottom-8 left-1/2 transform -translate-x-1/2 text-center">
            <p className="text-xs md:text-sm text-gray-600 font-medium whitespace-nowrap">Xem video</p>
          </div>
        </div>
      </motion.div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={closeVideo}
        videoSrc="src\components\media\watermarked-76ed4be6-a6a3-4c0b-9194-a91d3a06404d.mp4"
      />
    </section>
  )
}

export default Hero
