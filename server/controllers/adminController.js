import User from '../models/User.js';
import Contact from '../models/Contact.js';
import ReadingSession from '../models/ReadingSession.js';
import QuizResult from '../models/QuizResult.js';
import mongoose from 'mongoose';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Total admins
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Total contacts
    const totalContacts = await Contact.countDocuments();
    
    // Contacts by status
    const contactsByStatus = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Contacts in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const contactsLast7Days = await Contact.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Contacts in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const contactsLast30Days = await Contact.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // New users in last 30 days
    const newUsersLast30Days = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Contacts by day (last 7 days)
    const contactsByDay = await Contact.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Contacts by source
    const contactsBySource = await Contact.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
        },
      },
    ]);

    // SmartRead Statistics
    const totalSessions = await ReadingSession.countDocuments();
    const totalQuizResults = await QuizResult.countDocuments();
    
    const sessionsLast7Days = await ReadingSession.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const sessionsLast30Days = await ReadingSession.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Average WPM and REI
    const avgStats = await QuizResult.aggregate([
      {
        $group: {
          _id: null,
          avgWpm: { $avg: '$metrics.wpm' },
          avgRei: { $avg: '$metrics.rei' },
          avgComprehension: { $avg: '$results.comprehensionPercent' },
        },
      },
    ]);

    // Active users (users who have reading sessions)
    const activeUsers = await ReadingSession.distinct('user').length;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          newLast30Days: newUsersLast30Days,
        },
        contacts: {
          total: totalContacts,
          last7Days: contactsLast7Days,
          last30Days: contactsLast30Days,
          byStatus: contactsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          bySource: contactsBySource.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          byDay: contactsByDay,
        },
        smartread: {
          totalSessions,
          totalQuizResults,
          last7Days: sessionsLast7Days,
          last30Days: sessionsLast30Days,
          activeUsers,
          avgWpm: avgStats[0]?.avgWpm || 0,
          avgRei: avgStats[0]?.avgRei || 0,
          avgComprehension: avgStats[0]?.avgComprehension || 0,
        },
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy thống kê',
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const search = req.query.search;

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy danh sách người dùng',
    });
  }
};

// @desc    Create new user (admin)
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin (name, email, password)',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được sử dụng',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      isActive: true,
    });

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      data: userResponse,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi tạo người dùng',
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Prevent admin from changing their own role/status
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể thay đổi quyền của chính mình',
      });
    }

    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi cập nhật',
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể xóa chính mình',
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'Xóa người dùng thành công',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi xóa',
    });
  }
};

// @desc    Get users with SmartRead statistics
// @route   GET /api/admin/smartread/users
// @access  Private/Admin
export const getUsersWithSmartReadStats = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;

    const query = { role: 'user' }; // Only get regular users
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get SmartRead statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const userId = user._id;

        // Get total sessions
        const totalSessions = await ReadingSession.countDocuments({ user: userId });

        // Get total quiz results
        const totalQuizResults = await QuizResult.countDocuments({ user: userId });

        // Get average WPM
        const avgWpmResult = await ReadingSession.aggregate([
          { $match: { user: new mongoose.Types.ObjectId(userId) } },
          { $group: { _id: null, avgWpm: { $avg: '$readingStats.wpm' } } },
        ]);

        // Get average REI
        const avgReiResult = await QuizResult.aggregate([
          { $match: { user: new mongoose.Types.ObjectId(userId) } },
          { $group: { _id: null, avgRei: { $avg: '$metrics.rei' } } },
        ]);

        // Get average comprehension
        const avgComprehensionResult = await QuizResult.aggregate([
          { $match: { user: new mongoose.Types.ObjectId(userId) } },
          { $group: { _id: null, avgComprehension: { $avg: '$results.comprehensionPercent' } } },
        ]);

        // Get best scores
        const bestWpm = await ReadingSession.findOne({ user: userId })
          .sort({ 'readingStats.wpm': -1 })
          .select('readingStats.wpm');

        const bestRei = await QuizResult.findOne({ user: userId })
          .sort({ 'metrics.rei': -1 })
          .select('metrics.rei');

        // Get last activity
        const lastSession = await ReadingSession.findOne({ user: userId })
          .sort({ createdAt: -1 })
          .select('createdAt');

        return {
          ...user.toObject(),
          smartreadStats: {
            totalSessions,
            totalQuizResults,
            avgWpm: avgWpmResult[0]?.avgWpm || 0,
            avgRei: avgReiResult[0]?.avgRei || 0,
            avgComprehension: avgComprehensionResult[0]?.avgComprehension || 0,
            bestWpm: bestWpm?.readingStats.wpm || 0,
            bestRei: bestRei?.metrics.rei || 0,
            lastActivity: lastSession?.createdAt || null,
          },
        };
      })
    );

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users with SmartRead stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy thống kê',
    });
  }
};

// @desc    Get user's reading sessions (admin view)
// @route   GET /api/admin/smartread/users/:userId/sessions
// @access  Private/Admin
export const getUserReadingSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    const sessions = await ReadingSession.find({ user: userId })
      .populate('quizResult')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ReadingSession.countDocuments({ user: userId });

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get user reading sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server',
    });
  }
};

// @desc    Initialize admin user
// @route   POST /api/admin/init
// @access  Public (chỉ dùng một lần để tạo admin đầu tiên)
export const initAdmin = async (req, res) => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin đã tồn tại. Sử dụng endpoint khác để tạo admin.',
      });
    }

    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin (email, password, name)',
      });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
    });

    res.status(201).json({
      success: true,
      message: 'Tạo admin thành công',
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Init admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi tạo admin',
    });
  }
};

