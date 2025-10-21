import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiMenu, HiX, HiBookOpen } from 'react-icons/hi'

const Header = () => {
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
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <HiBookOpen className="w-8 h-8 text-primary-600" />
            <span className="text-xl lg:text-2xl font-bold text-primary-600">
              Đọc Nhanh
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('hero')}
              className="text-gray-700 hover:text-primary-600 transition-colors duration-300 font-medium"
            >
              Trang chủ
            </button>
            <button 
              onClick={() => scrollToSection('solution')}
              className="text-gray-700 hover:text-primary-600 transition-colors duration-300 font-medium"
            >
              Giải pháp
            </button>
            <button 
              onClick={() => scrollToSection('timeline')}
              className="text-gray-700 hover:text-primary-600 transition-colors duration-300 font-medium"
            >
              Lộ trình
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="text-gray-700 hover:text-primary-600 transition-colors duration-300 font-medium"
            >
              Học phí
            </button>
            <Link 
              to="/smartread"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              SmartRead
            </Link>
            <button 
              onClick={() => scrollToSection('cta')}
              className="btn-primary"
            >
              Đăng ký ngay
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-colors duration-300"
          >
            {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <motion.nav
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
          initial={false}
        >
          <div className="py-4 space-y-2">
            <button 
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-300"
            >
              Trang chủ
            </button>
            <button 
              onClick={() => scrollToSection('solution')}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-300"
            >
              Giải pháp
            </button>
            <button 
              onClick={() => scrollToSection('timeline')}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-300"
            >
              Lộ trình
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-300"
            >
              Học phí
            </button>
            <Link 
              to="/smartread"
              className="block w-full mx-4 mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-center"
            >
              SmartRead
            </Link>
            <button 
              onClick={() => scrollToSection('cta')}
              className="block w-full mx-4 mt-2 btn-primary"
            >
              Đăng ký ngay
            </button>
          </div>
        </motion.nav>
      </div>
    </motion.header>
  )
}

export default Header
