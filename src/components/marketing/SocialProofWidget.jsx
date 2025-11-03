import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaMapMarkerAlt } from 'react-icons/fa';

const SocialProofWidget = () => {
  const [notifications, setNotifications] = useState([]);

  // Simulate real-time sign-ups (in production, this would come from API)
  useEffect(() => {
    const names = [
      'Trần Văn Nam', 'Nguyễn Bình An', 'Lê Thị Mai', 'Phạm Đức Minh', 
      'Hoàng Thị Hương', 'Đỗ Văn Tuấn', 'Vũ Thị Lan', 'Nguyễn Đức Hùng',
      'Trần Thị Hoa', 'Lê Văn Đạt', 'Phạm Thị Linh', 'Hoàng Văn Quang',
      'Nguyễn Thị Nga', 'Đỗ Đức Thành', 'Vũ Văn Hải', 'Trần Thị Mai'
    ];
    const cities = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
    
    const generateNotification = () => {
      const name = names[Math.floor(Math.random() * names.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const minutesAgo = Math.floor(Math.random() * 30) + 1;
      
      return {
        id: Date.now(),
        name,
        city,
        minutesAgo,
        action: Math.random() > 0.5 ? 'đã đăng ký' : 'vừa đăng ký'
      };
    };

    // Add initial notifications
    const initial = Array.from({ length: 3 }, generateNotification);
    setNotifications(initial);

    // Add new notification every 8-15 seconds
    const interval = setInterval(() => {
      const newNotification = generateNotification();
      setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    }, Math.random() * 7000 + 8000);

    return () => clearInterval(interval);
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[55] max-w-sm">
      <AnimatePresence>
        {notifications.slice(0, 1).map((notification) => (
          <motion.div
            key={notification.id}
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
                  <span className="font-semibold text-[#1A66CC]">{notification.name}</span>
                  {' '}
                  <span className="text-gray-600">{notification.action}</span>
                </p>
                <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                  <FaMapMarkerAlt className="w-3 h-3" />
                  <span>{notification.city}</span>
                  <span>•</span>
                  <span>{notification.minutesAgo} phút trước</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
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

