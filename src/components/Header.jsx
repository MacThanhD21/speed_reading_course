import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiMenu, HiX, HiBookOpen } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import UserMenu from './auth/UserMenu'

const Header = () => {
  const { isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    // Add a small delay to ensure components are fully rendered
    setTimeout(() => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        setIsOpen(false)
      } else if (sectionId === 'cta') {
        // Fallback for CTA section
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        })
        setIsOpen(false)
      }
    }, 100)
  }

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-1.5 sm:space-x-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection('hero')}
          >
            <HiBookOpen className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#1A66CC] flex-shrink-0" />
            <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#1A66CC] whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Đọc Nhanh
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
            <button 
              onClick={() => scrollToSection('hero')}
              className="text-gray-700 hover:text-[#1A66CC] transition-colors duration-300 font-medium text-sm lg:text-base whitespace-nowrap"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Trang chủ
            </button>
            <button 
              onClick={() => scrollToSection('solution')}
              className="text-gray-700 hover:text-[#1A66CC] transition-colors duration-300 font-medium text-sm lg:text-base whitespace-nowrap"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Giải pháp
            </button>
            <button 
              onClick={() => scrollToSection('timeline')}
              className="text-gray-700 hover:text-[#1A66CC] transition-colors duration-300 font-medium text-sm lg:text-base whitespace-nowrap"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Lộ trình
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="text-gray-700 hover:text-[#1A66CC] transition-colors duration-300 font-medium text-sm lg:text-base whitespace-nowrap"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Học phí
            </button>
            <Link 
              to="/smartread"
              className="bg-[#34D399] hover:bg-[#10B981] text-white font-semibold py-1.5 px-3 lg:py-2 lg:px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm lg:text-base whitespace-nowrap"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              SmartRead
            </Link>
            {isAuthenticated() ? (
              <div className="ml-2 lg:ml-4">
                <UserMenu />
              </div>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="text-gray-700 hover:text-[#1A66CC] transition-colors duration-300 font-medium text-sm lg:text-base whitespace-nowrap"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/register"
                  className="bg-[#1A66CC] hover:bg-[#1555B0] text-white font-semibold py-1.5 px-3 lg:py-2 lg:px-4 rounded-lg transition-all duration-300 text-sm lg:text-base whitespace-nowrap ml-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Đăng ký
                </Link>
              </>
            )}
          </nav>

          {/* Mobile/Tablet menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-[#1A66CC] hover:bg-gray-100 transition-colors duration-300 flex-shrink-0"
            aria-label="Toggle menu"
          >
            {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <motion.nav
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
          initial={false}
          animate={{
            height: isOpen ? 'auto' : 0,
          }}
        >
          <div className="py-4 space-y-2 border-t border-gray-200 mt-2">
            <button 
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left px-4 py-3 text-gray-700 hover:text-[#1A66CC] hover:bg-gray-50 rounded-md transition-colors duration-300 font-medium"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Trang chủ
            </button>
            <button 
              onClick={() => scrollToSection('solution')}
              className="block w-full text-left px-4 py-3 text-gray-700 hover:text-[#1A66CC] hover:bg-gray-50 rounded-md transition-colors duration-300 font-medium"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Giải pháp
            </button>
            <button 
              onClick={() => scrollToSection('timeline')}
              className="block w-full text-left px-4 py-3 text-gray-700 hover:text-[#1A66CC] hover:bg-gray-50 rounded-md transition-colors duration-300 font-medium"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Lộ trình
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="block w-full text-left px-4 py-3 text-gray-700 hover:text-[#1A66CC] hover:bg-gray-50 rounded-md transition-colors duration-300 font-medium"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Học phí
            </button>
            <Link 
              to="/smartread"
              className="block w-full mx-4 mt-3 bg-[#34D399] hover:bg-[#10B981] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-center shadow-md"
              onClick={() => setIsOpen(false)}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              SmartRead
            </Link>
            {isAuthenticated() ? (
              <div className="mx-4 mt-3 space-y-2">
                <UserMenu />
              </div>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="block w-full mx-4 mt-2 text-center px-4 py-3 text-gray-700 hover:text-[#1A66CC] hover:bg-gray-50 rounded-md transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/register"
                  className="block w-full mx-4 mt-2 bg-[#1A66CC] hover:bg-[#1555B0] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-center"
                  onClick={() => setIsOpen(false)}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </motion.nav>
      </div>
    </motion.header>
  )
}

export default Header
