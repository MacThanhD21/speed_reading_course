import Testimonial from '../models/Testimonial.js';
import { createNotification } from './notificationController.js';

// @desc    Get all active testimonials (Public)
// @route   GET /api/testimonials
// @access  Public
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .select('-createdAtBy')
      .populate('user', 'name email')
      .lean();

    // Format response to not expose user details, just use user.name if available
    const formattedTestimonials = testimonials.map(t => {
      const testimonial = { ...t };
      if (testimonial.user && testimonial.user.name) {
        testimonial.name = testimonial.user.name;
      }
      delete testimonial.user;
      return testimonial;
    });

    res.json({
      success: true,
      data: formattedTestimonials,
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy danh sách đánh giá',
    });
  }
};

// @desc    Create testimonial by user (Authenticated)
// @route   POST /api/testimonials
// @access  Private
export const createUserTestimonial = async (req, res) => {
  try {
    const { role, avatar, quote, rating, improvement } = req.body;

    // Check if user already has a testimonial
    const existingTestimonial = await Testimonial.findOne({ user: req.user._id });
    if (existingTestimonial) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã có đánh giá rồi. Bạn có thể chỉnh sửa đánh giá hiện tại.',
      });
    }

    const testimonial = await Testimonial.create({
      name: req.user.name, // Use user's name from auth
      role: role || 'Học viên',
      avatar: avatar || '👤',
      quote,
      rating: rating || 5,
      improvement,
      user: req.user._id,
      isActive: false, // Default inactive, admin needs to approve
      createdAtBy: req.user._id,
    });

    // Create notification for admin
    createNotification(
      'new_testimonial',
      'Đánh giá mới',
      `${req.user.name} đã gửi đánh giá mới cần duyệt`,
      `/admin/testimonials`,
      { testimonialId: testimonial._id, userId: req.user._id, userName: req.user.name }
    ).catch(err => {
      console.error('Error creating notification:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Đánh giá của bạn đã được gửi! Chúng tôi sẽ xem xét và hiển thị trong thời gian sớm nhất.',
      data: testimonial,
    });
  } catch (error) {
    console.error('Create user testimonial error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi tạo đánh giá',
    });
  }
};

// @desc    Get user's own testimonial
// @route   GET /api/testimonials/my-testimonial
// @access  Private
export const getMyTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findOne({ user: req.user._id });

    res.json({
      success: true,
      data: testimonial || null,
    });
  } catch (error) {
    console.error('Get my testimonial error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server',
    });
  }
};

// @desc    Update user's own testimonial
// @route   PUT /api/testimonials/my-testimonial
// @access  Private
export const updateMyTestimonial = async (req, res) => {
  try {
    const { role, avatar, quote, rating, improvement } = req.body;

    let testimonial = await Testimonial.findOne({ user: req.user._id });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá của bạn',
      });
    }

    // User can only update if not yet approved (isActive = false)
    if (testimonial.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Không thể chỉnh sửa đánh giá đã được duyệt. Vui lòng liên hệ admin để yêu cầu chỉnh sửa.',
      });
    }

    if (role) testimonial.role = role;
    if (avatar !== undefined) testimonial.avatar = avatar;
    if (quote) testimonial.quote = quote;
    if (rating !== undefined) testimonial.rating = rating;
    if (improvement !== undefined) testimonial.improvement = improvement;
    
    // Update name if user name changed
    testimonial.name = req.user.name;

    const updatedTestimonial = await testimonial.save();

    res.json({
      success: true,
      message: 'Cập nhật đánh giá thành công. Chúng tôi sẽ xem xét lại.',
      data: updatedTestimonial,
    });
  } catch (error) {
    console.error('Update my testimonial error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi cập nhật',
    });
  }
};

// @desc    Get all testimonials (Admin)
// @route   GET /api/admin/testimonials
// @access  Private/Admin
export const getAllTestimonials = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { quote: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const testimonials = await Testimonial.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('createdAtBy', 'name email')
      .lean();

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      data: testimonials,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all testimonials error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy danh sách',
    });
  }
};

// @desc    Get testimonial by ID
// @route   GET /api/admin/testimonials/:id
// @access  Private/Admin
export const getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id)
      .populate('user', 'name email')
      .populate('createdAtBy', 'name email');

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá',
      });
    }

    res.json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    console.error('Get testimonial by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server',
    });
  }
};

// @desc    Create new testimonial
// @route   POST /api/admin/testimonials
// @access  Private/Admin
export const createTestimonial = async (req, res) => {
  try {
    const { name, role, avatar, quote, rating, improvement, isActive, displayOrder, userId } = req.body;

    const testimonial = await Testimonial.create({
      name: name || 'User',
      role,
      avatar: avatar || '👤',
      quote,
      rating: rating || 5,
      improvement,
      user: userId || req.user._id, // Admin can create for other users
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
      createdAtBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Tạo đánh giá thành công',
      data: testimonial,
    });
  } catch (error) {
    console.error('Create testimonial error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi tạo đánh giá',
    });
  }
};

// @desc    Update testimonial
// @route   PUT /api/admin/testimonials/:id
// @access  Private/Admin
export const updateTestimonial = async (req, res) => {
  try {
    const { name, role, avatar, quote, rating, improvement, isActive, displayOrder } = req.body;

    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá',
      });
    }

    if (name) testimonial.name = name;
    if (role) testimonial.role = role;
    if (avatar !== undefined) testimonial.avatar = avatar;
    if (quote) testimonial.quote = quote;
    if (rating !== undefined) testimonial.rating = rating;
    if (improvement !== undefined) testimonial.improvement = improvement;
    if (isActive !== undefined) testimonial.isActive = isActive;
    if (displayOrder !== undefined) testimonial.displayOrder = displayOrder;

    const updatedTestimonial = await testimonial.save();

    res.json({
      success: true,
      message: 'Cập nhật đánh giá thành công',
      data: updatedTestimonial,
    });
  } catch (error) {
    console.error('Update testimonial error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi cập nhật',
    });
  }
};

// @desc    Delete testimonial
// @route   DELETE /api/admin/testimonials/:id
// @access  Private/Admin
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá',
      });
    }

    await testimonial.deleteOne();

    res.json({
      success: true,
      message: 'Xóa đánh giá thành công',
    });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi xóa',
    });
  }
};

