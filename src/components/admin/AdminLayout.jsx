import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaEnvelope, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBook,
  FaChartBar,
  FaKey
} from 'react-icons/fa';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FaTachometerAlt, color: 'from-blue-500 to-cyan-500' },
    { path: '/admin/users', label: 'Người dùng', icon: FaUsers, color: 'from-purple-500 to-pink-500' },
    { path: '/admin/contacts', label: 'Liên hệ', icon: FaEnvelope, color: 'from-green-500 to-emerald-500' },
    { path: '/admin/smartread', label: 'SmartRead', icon: FaBook, color: 'from-orange-500 to-red-500' },
    { path: '/admin/api-keys', label: 'API Keys', icon: FaKey, color: 'from-indigo-500 to-purple-500' },
  ];

  const handleLogout = () => {
    // Simple logout without confirmation for better UX
    // If confirmation is needed, use ConfirmDialog component
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentPath = location.pathname;
  const currentMenu = menuItems.find(item => item.path === currentPath) || menuItems[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -256,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
                  <FaChartBar className="text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Admin Panel</h2>
                  <p className="text-xs text-gray-400">Speed Reading</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;

              return (
                <motion.button
                  key={item.path}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all relative ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r opacity-20 rounded-xl"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className={`text-lg ${isActive ? 'relative z-10' : ''}`} />
                  <span className={`font-medium ${isActive ? 'relative z-10' : ''}`}>{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-700">
            <div className="mb-4 p-3 bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Đăng nhập như</p>
              <p className="text-white font-medium truncate">{user.name || user.email || 'Admin'}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-red-600 hover:text-white transition-all group"
            >
              <FaSignOutAlt className="group-hover:rotate-12 transition-transform" />
              <span className="font-medium">Đăng xuất</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        {/* Top Bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-40 border-b border-gray-200"
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaBars className="text-xl" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className={`bg-gradient-to-r ${currentMenu.color} p-2 rounded-lg`}>
                    <currentMenu.icon className="text-white" />
                  </div>
                  {currentMenu.label}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Trực tuyến</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
