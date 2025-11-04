import Notification from '../models/Notification.js';

// @desc    Get all notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
export const getNotifications = async (req, res) => {
  try {
    const { unreadOnly, limit = 50 } = req.query;
    
    const query = {};
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ read: false });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy thông báo',
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/admin/notifications/:id/read
// @access  Private/Admin
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo',
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi đánh dấu đã đọc',
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/admin/notifications/read-all
// @access  Private/Admin
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { read: false },
      { 
        read: true,
        readAt: new Date(),
      }
    );

    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi đánh dấu tất cả đã đọc',
    });
  }
};

// Helper function to create notification
export const createNotification = async (type, title, message, link = null, metadata = {}) => {
  try {
    const notification = await Notification.create({
      type,
      title,
      message,
      link,
      metadata,
    });
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

