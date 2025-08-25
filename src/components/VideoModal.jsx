import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX } from 'react-icons/hi'

const VideoModal = ({ isOpen, onClose, videoSrc }) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-4xl mx-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 z-10 p-2 text-white hover:text-gray-300 transition-colors duration-300"
            aria-label="Close video"
          >
            <HiX className="w-8 h-8" />
          </button>

          {/* Video Container */}
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            <video
              className="w-full h-full object-cover"
              controls
              autoPlay
              playsInline
              poster="/video-poster.jpg"
            >
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video Title */}
          <div className="mt-4 text-center">
            <h3 className="text-xl font-semibold text-white">
              Kỹ Thuật Đọc Nhanh - Video Giới Thiệu
            </h3>
            <p className="text-gray-300 mt-2">
              Khám phá cách tăng tốc độ đọc từ 200 lên 1000+ từ/phút
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VideoModal
