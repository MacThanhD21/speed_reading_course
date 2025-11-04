import Contact from '../models/Contact.js';
import { initializeContactEmailSequence } from '../utils/emailQueueManager.js';
import { createNotification } from './notificationController.js';

// Validation helpers
const validateEmail = (email) => {
  // More strict email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Check for common fake/temporary email domains
  const tempEmailDomains = [
    '10minutemail.com', 'tempmail.com', 'guerrillamail.com', 
    'mailinator.com', 'throwaway.email', 'temp-mail.org',
    'fakeinbox.com', 'trashmail.com', 'getnada.com'
  ];
  const domain = email.split('@')[1]?.toLowerCase();
  if (tempEmailDomains.some(tempDomain => domain.includes(tempDomain))) {
    return false;
  }
  
  return true;
};

const validateVietnamesePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  
  // Remove all spaces, dashes, and dots
  const cleaned = phone.replace(/[\s\-\.]/g, '');
  
  // Vietnamese phone number patterns
  // Mobile: 03, 05, 07, 08, 09 (10 digits) or 012, 016, 018, 019 (11 digits old format)
  // Landline: 024, 028 (for Hanoi, HCMC) or 023x, 025x, etc.
  const phoneRegex = /^(0[3|5|7|8|9][0-9]{8}|01[2|6|8|9][0-9]{8}|02[0-9]{9})$/;
  return phoneRegex.test(cleaned);
};

const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/[\s\-\.]/g, '');
};

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Public
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, address, message, source } = req.body;

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ hoặc là email tạm thời. Vui lòng sử dụng email thật.',
      });
    }

    // Validate phone (if provided)
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone && !validateVietnamesePhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10-11 chữ số).',
      });
    }

    // Get IP and user agent
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Check for duplicate submissions within last 24 hours (same email or phone)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Check duplicate email
    if (email) {
      const duplicateEmail = await Contact.findOne({
        email: email.toLowerCase(),
        createdAt: { $gte: twentyFourHoursAgo },
      });
      if (duplicateEmail) {
        return res.status(429).json({
          success: false,
          message: 'Bạn đã gửi thông tin gần đây. Vui lòng đợi 24 giờ trước khi gửi lại hoặc liên hệ trực tiếp qua hotline.',
        });
      }
    }

    // Check duplicate phone (normalize existing phones in DB)
    if (normalizedPhone) {
      const recentContacts = await Contact.find({
        phone: { $exists: true, $ne: '' },
        createdAt: { $gte: twentyFourHoursAgo },
      });
      
      const hasDuplicatePhone = recentContacts.some(contact => {
        const contactPhoneNormalized = normalizePhone(contact.phone);
        return contactPhoneNormalized === normalizedPhone;
      });
      
      if (hasDuplicatePhone) {
        return res.status(429).json({
          success: false,
          message: 'Bạn đã gửi thông tin gần đây. Vui lòng đợi 24 giờ trước khi gửi lại hoặc liên hệ trực tiếp qua hotline.',
        });
      }
    }

    // Check for spam patterns (same IP with multiple submissions)
    const ipCount = await Contact.countDocuments({
      ipAddress,
      createdAt: { $gte: twentyFourHoursAgo },
    });

    if (ipCount >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Có quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau.',
      });
    }

    const contact = await Contact.create({
      name,
      email: email.toLowerCase(),
      phone: normalizedPhone || phone, // Store normalized phone
      address,
      message,
      source: source || 'homepage',
      ipAddress,
      userAgent,
    });

    // Initialize email marketing sequence (non-blocking)
    initializeContactEmailSequence(contact).catch(err => {
      console.error('Error initializing email sequence:', err);
      // Don't fail the request if email queue fails
    });

    // Create notification for admin
    createNotification(
      'new_contact',
      'Liên hệ mới',
      `${name} đã gửi thông tin liên hệ`,
      `/admin/contacts`,
      { contactId: contact._id, email, phone: normalizedPhone || phone }
    ).catch(err => {
      console.error('Error creating notification:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Gửi thông tin thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.',
      data: contact,
    });
  } catch (error) {
    console.error('Create contact error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi gửi thông tin',
    });
  }
};

// @desc    Get all contacts (Admin only)
// @route   GET /api/contacts
// @access  Private/Admin
export const getContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy danh sách',
    });
  }
};

// @desc    Get contact by ID
// @route   GET /api/contacts/:id
// @access  Private/Admin
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin liên hệ',
      });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Get contact by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server',
    });
  }
};

// @desc    Update contact status
// @route   PUT /api/contacts/:id
// @access  Private/Admin
export const updateContact = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin liên hệ',
      });
    }

    if (status) contact.status = status;
    if (notes !== undefined) contact.notes = notes;

    const updatedContact = await contact.save();

    res.json({
      success: true,
      message: 'Cập nhật thành công',
      data: updatedContact,
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi cập nhật',
    });
  }
};

// @desc    Get recent contacts for social proof
// @route   GET /api/contacts/recent
// @access  Public
export const getRecentContacts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const contacts = await Contact.find({
      address: { $exists: true, $ne: '' }
    })
      .select('name address createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);

    const formattedContacts = contacts.map(contact => {
      const now = new Date();
      const createdAt = new Date(contact.createdAt);
      const diffMs = now - createdAt;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let timeAgo;
      if (diffMins < 1) {
        timeAgo = 'Vừa xong';
      } else if (diffMins < 60) {
        timeAgo = `${diffMins} phút trước`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} giờ trước`;
      } else {
        timeAgo = `${diffDays} ngày trước`;
      }

      return {
        id: contact._id.toString(),
        name: contact.name,
        address: contact.address,
        timeAgo,
        createdAt: contact.createdAt,
      };
    });

    res.json({
      success: true,
      data: formattedContacts,
    });
  } catch (error) {
    console.error('Get recent contacts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy danh sách liên hệ',
    });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin liên hệ',
      });
    }

    await contact.deleteOne();

    res.json({
      success: true,
      message: 'Xóa thành công',
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi xóa',
    });
  }
};

