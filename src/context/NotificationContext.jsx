import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

const Toast = ({ notification, onClose }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'error':
        return <FaTimesCircle className="text-red-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
      className={`${getBgColor()} border rounded-lg shadow-lg p-4 mb-4 min-w-[300px] max-w-[400px] flex items-start gap-3`}
    >
      <div className="flex-shrink-0 text-xl mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1">
        {notification.title && (
          <h4 className="font-semibold mb-1">{notification.title}</h4>
        )}
        <p className="text-sm">{notification.message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <FaTimes />
      </button>
    </motion.div>
  );
};

const ToastContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence>
          {notifications.map((notification) => (
            <Toast
              key={notification.id}
              notification={notification}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      duration: notification.duration || 5000,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, [removeNotification]);

  const showSuccess = useCallback((message, title = null) => {
    return addNotification({ type: 'success', message, title });
  }, [addNotification]);

  const showError = useCallback((message, title = null) => {
    return addNotification({ type: 'error', message, title, duration: 7000 });
  }, [addNotification]);

  const showWarning = useCallback((message, title = null) => {
    return addNotification({ type: 'warning', message, title });
  }, [addNotification]);

  const showInfo = useCallback((message, title = null) => {
    return addNotification({ type: 'info', message, title });
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        showSuccess,
        showError,
        showWarning,
        showInfo,
        addNotification,
        removeNotification,
      }}
    >
      {children}
      <ToastContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

