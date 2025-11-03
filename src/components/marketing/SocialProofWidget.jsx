import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import apiService from '../../services/apiService';

const SocialProofWidget = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch recent contacts from API
  const fetchRecentContacts = async () => {
    try {
      const response = await apiService.getRecentContacts(10);
      if (response.success && response.data && response.data.length > 0) {
        // Map API data to notification format
        const formattedNotifications = response.data.map((contact) => ({
          id: contact.id,
          name: contact.name,
          address: contact.address,
          timeAgo: contact.timeAgo,
          action: 'vừa đăng ký',
        }));
        setNotifications(formattedNotifications);
        // Reset index to 0 when new data arrives
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error fetching recent contacts:', error);
      // Silently fail - don't show widget if API fails
    }
  };

  useEffect(() => {
    // Fetch initial data
    fetchRecentContacts();

    // Poll for new contacts every 10 seconds
    const interval = setInterval(() => {
      fetchRecentContacts();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Rotate through notifications every 8-12 seconds
  useEffect(() => {
    if (notifications.length <= 1) return;

    const rotationInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
    }, Math.random() * 4000 + 8000);

    return () => clearInterval(rotationInterval);
  }, [notifications.length]);

  if (notifications.length === 0) return null;

  const currentNotification = notifications[currentIndex];

  return (
    <div className="fixed bottom-4 right-4 z-[55] max-w-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentNotification.id}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="bg-white rounded-lg shadow-2xl p-4 border-l-4 border-[#34D399] mb-3 pointer-events-auto"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1A66CC] to-[#1555B0] rounded-full flex items-center justify-center">
                <FaUser className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">
                <span className="font-semibold text-[#1A66CC]">{currentNotification.name}</span>
                {' '}
                <span className="text-gray-600">{currentNotification.action}</span>
              </p>
              <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                <FaMapMarkerAlt className="w-3 h-3" />
                <span>{currentNotification.address}</span>
                <span>•</span>
                <span>{currentNotification.timeAgo}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Summary badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-[#34D399] to-[#10B981] text-white rounded-lg px-4 py-2 shadow-lg"
      >
        <div className="flex items-center space-x-2 text-sm">
          <span className="font-semibold">🔥</span>
          <span>Hơn 500+ học viên đã đăng ký trong tháng này!</span>
        </div>
      </motion.div>
    </div>
  );
};

export default SocialProofWidget;

