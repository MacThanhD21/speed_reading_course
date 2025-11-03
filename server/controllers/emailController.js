import EmailQueue from '../models/EmailQueue.js';
import EmailCampaign from '../models/EmailCampaign.js';
import { processEmailQueue } from '../utils/emailQueueManager.js';

// @desc    Process email queue (manual trigger or cron)
// @route   POST /api/admin/emails/process-queue
// @access  Private/Admin
export const processQueue = async (req, res) => {
  try {
    await processEmailQueue();
    res.json({
      success: true,
      message: 'Đã xử lý hàng đợi email',
    });
  } catch (error) {
    console.error('Process email queue error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xử lý hàng đợi email',
    });
  }
};

// @desc    Get email queue stats
// @route   GET /api/admin/emails/queue-stats
// @access  Private/Admin
export const getQueueStats = async (req, res) => {
  try {
    const pending = await EmailQueue.countDocuments({ status: 'pending' });
    const sent = await EmailQueue.countDocuments({ status: 'sent' });
    const failed = await EmailQueue.countDocuments({ status: 'failed' });

    // Count emails scheduled for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const scheduledToday = await EmailQueue.countDocuments({
      status: 'pending',
      scheduledFor: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    res.json({
      success: true,
      data: {
        pending,
        sent,
        failed,
        scheduledToday,
        total: pending + sent + failed,
      },
    });
  } catch (error) {
    console.error('Get queue stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thống kê',
    });
  }
};

// @desc    Get email queue list
// @route   GET /api/admin/emails/queue
// @access  Private/Admin
export const getEmailQueue = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;

    const query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const emails = await EmailQueue.find(query)
      .populate('campaign', 'name type subject')
      .populate('contact', 'name email source')
      .populate('user', 'name email')
      .sort({ scheduledFor: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await EmailQueue.countDocuments(query);

    res.json({
      success: true,
      data: emails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get email queue error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách',
    });
  }
};

// @desc    Retry failed email
// @route   POST /api/admin/emails/queue/:id/retry
// @access  Private/Admin
export const retryEmail = async (req, res) => {
  try {
    const emailQueue = await EmailQueue.findById(req.params.id);

    if (!emailQueue) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy email trong hàng đợi',
      });
    }

    emailQueue.status = 'pending';
    emailQueue.sendAttempts = 0;
    emailQueue.errorMessage = '';
    await emailQueue.save();

    // Process immediately
    await processEmailQueue();

    res.json({
      success: true,
      message: 'Đã thử gửi lại email',
    });
  } catch (error) {
    console.error('Retry email error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi thử lại',
    });
  }
};

// @desc    Cancel scheduled email
// @route   POST /api/admin/emails/queue/:id/cancel
// @access  Private/Admin
export const cancelEmail = async (req, res) => {
  try {
    const emailQueue = await EmailQueue.findById(req.params.id);

    if (!emailQueue) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy email trong hàng đợi',
      });
    }

    emailQueue.status = 'cancelled';
    await emailQueue.save();

    res.json({
      success: true,
      message: 'Đã hủy email',
    });
  } catch (error) {
    console.error('Cancel email error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi hủy',
    });
  }
};

