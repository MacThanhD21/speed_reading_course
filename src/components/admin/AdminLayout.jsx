import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaEnvelope, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBook,
  FaKey,
  FaStar,
  FaSearch,
  FaBell,
  FaPlus,
  FaCog,
  FaArrowRight,
  FaMoon,
  FaSun,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import apiService from '../../services/apiService';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminDarkMode');
    return saved !== null ? saved === 'true' : true; // Default dark mode
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/admin/users', label: 'Users', icon: FaUsers },
    { path: '/admin/contacts', label: 'Contacts', icon: FaEnvelope },
    { path: '/admin/testimonials', label: 'Đánh giá', icon: FaStar },
    { path: '/admin/smartread', label: 'SmartRead', icon: FaBook },
    { path: '/admin/api-keys', label: 'API Keys', icon: FaKey },
  ];

  // Load notifications
  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('adminDarkMode', darkMode.toString());
  }, [darkMode]);

  const loadNotifications = async () => {
    try {
      const response = await apiService.getNotifications(false, 20);
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId, link) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      loadNotifications();
      if (link) {
        // Fix old notification links that have testimonial ID in path
        // If link contains /admin/testimonials/ followed by ID, redirect to /admin/testimonials
        if (link.includes('/admin/testimonials/') && link !== '/admin/testimonials') {
          link = '/admin/testimonials';
        }
        // If link contains /admin/contacts/ followed by ID, redirect to /admin/contacts
        if (link.includes('/admin/contacts/') && link !== '/admin/contacts') {
          link = '/admin/contacts';
        }
        // If link contains /admin/users/ followed by ID, redirect to /admin/users
        if (link.includes('/admin/users/') && link !== '/admin/users') {
          link = '/admin/users';
        }
        navigate(link);
      }
      setShowNotifications(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_contact':
        return <FaEnvelope className="text-blue-500" />;
      case 'new_testimonial':
        return <FaStar className="text-yellow-500" />;
      case 'new_user':
        return <FaUsers className="text-green-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentPath = location.pathname;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Collapse Button */}
          <div className={`${sidebarCollapsed ? 'p-4' : 'p-6'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.5 2L6 9.5 2.5 6l1.414-1.414L6 6.672l5.086-5.086L13.5 2z"/>
                    </svg>
                  </div>
                  <span className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>SmartRead</span>
                </div>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
                  title="Thu gọn sidebar"
                >
                  <FaChevronLeft />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.5 2L6 9.5 2.5 6l1.414-1.414L6 6.672l5.086-5.086L13.5 2z"/>
                  </svg>
                </div>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
                  title="Mở rộng sidebar"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-1 overflow-y-auto`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  title={sidebarCollapsed ? item.label : ''}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} ${sidebarCollapsed ? 'px-2 py-3' : 'px-4 py-3'} rounded-lg transition-colors ${
                    isActive
                      ? darkMode 
                        ? 'bg-blue-900 text-blue-300 font-medium'
                        : 'bg-blue-50 text-blue-600 font-medium'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`${sidebarCollapsed ? 'text-xl' : 'text-lg'}`} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Info & Actions */}
          <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${sidebarCollapsed ? 'space-y-2' : 'space-y-1'}`}>
            {!sidebarCollapsed ? (
              <>
                <div className="px-4 py-2 mb-2">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name || 'Admin'}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>{user.email || 'admin@speedreading.com'}</p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                  title="Toggle dark mode"
                >
                  {darkMode ? <FaSun className="text-lg text-yellow-500" /> : <FaMoon className="text-lg text-gray-700" />}
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Dark Mode</span>
                </button>
                <button
                  onClick={() => navigate('/admin/settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaCog className="text-lg" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaArrowRight className="text-lg" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={toggleDarkMode}
                  className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors ${
                    darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Toggle dark mode"
                >
                  {darkMode ? <FaSun className="text-xl text-yellow-500" /> : <FaMoon className="text-xl text-gray-600" />}
                </button>
                <button
                  onClick={() => navigate('/admin/settings')}
                  className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors ${
                    darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Settings"
                >
                  <FaCog className="text-xl" />
                </button>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors ${
                    darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Logout"
                >
                  <FaArrowRight className="text-xl" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarOpen 
          ? sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          : 'lg:ml-0'
      }`}>
        {/* Top Header Bar */}
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Left: Mobile menu button + Search */}
            <div className="flex items-center gap-6 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
              </button>
              
              {/* Search Bar */}
              <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
                <div className="relative w-full">
                  <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode 
                        ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Right: Notifications + New Course Button */}
            <div className="flex items-center gap-4">
              {/* Notification Button */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-lg transition-colors relative ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaBell className="text-xl" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl border ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  } max-h-96 overflow-hidden flex flex-col z-50`}>
                    <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Thông báo</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Đánh dấu tất cả đã đọc
                        </button>
                      )}
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Không có thông báo
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification._id}
                            onClick={() => handleMarkAsRead(notification._id, notification.link)}
                            className={`w-full text-left p-4 border-b ${
                              darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                            } transition-colors ${!notification.read ? darkMode ? 'bg-gray-900/50' : 'bg-blue-50' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {notification.title}
                                </p>
                                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {notification.message}
                                </p>
                                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button className={`hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`}>
                <FaPlus />
                <span>New Course</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
