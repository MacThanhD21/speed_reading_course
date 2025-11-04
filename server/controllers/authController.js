import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { initializeUserEmailSequence } from '../utils/emailQueueManager.js';
import { OAuth2Client } from 'google-auth-library';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

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
      address,
    });

    if (user) {
      // Initialize email marketing sequence (non-blocking)
      initializeUserEmailSequence(user).catch(err => {
        console.error('Error initializing user email sequence:', err);
        // Don't fail the request if email queue fails
      });

      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Dữ liệu người dùng không hợp lệ',
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi đăng ký',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // Update last login
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi đăng nhập',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server',
    });
  }
};

// @desc    Get recent registrations for social proof
// @route   GET /api/auth/recent-registrations
// @access  Public
export const getRecentRegistrations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const users = await User.find({
      address: { $exists: true, $ne: '' }
    })
      .select('name address createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);

    const registrations = users.map(user => {
      const now = new Date();
      const createdAt = new Date(user.createdAt);
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
        id: user._id.toString(),
        name: user.name,
        address: user.address,
        timeAgo,
        createdAt: user.createdAt,
      };
    });

    res.json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    console.error('Get recent registrations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy danh sách đăng ký',
    });
  }
};

// @desc    Google OAuth Login/Register
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  try {
    let { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu Google credential',
      });
    }

    // Ensure credential is a string (handle case where it might be sent as object)
    if (typeof credential !== 'string') {
      if (credential && typeof credential === 'object') {
        credential = credential.credential || credential.id_token || credential;
      }
      credential = String(credential);
    }

    // Validate it looks like a JWT token (has 3 parts separated by dots)
    if (!credential.includes('.')) {
      return res.status(400).json({
        success: false,
        message: 'Credential không đúng định dạng JWT token',
      });
    }

    // Check if GOOGLE_CLIENT_ID is configured
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return res.status(500).json({
        success: false,
        message: 'Server chưa được cấu hình Google OAuth',
      });
    }

    // Verify Google token
    const client = new OAuth2Client(googleClientId);
    let ticket;
    
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Google token không hợp lệ',
      });
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists with Google ID
    let user = await User.findOne({ googleId });

    if (user) {
      // User exists - login
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      // Check if user exists with email (but different provider)
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = googleId;
        existingUser.provider = 'google';
        existingUser.lastLogin = new Date();
        await existingUser.save({ validateBeforeSave: false });

        res.json({
          success: true,
          message: 'Đăng nhập thành công',
          data: {
            _id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            token: generateToken(existingUser._id),
          },
        });
      } else {
        // New user - register
        user = await User.create({
          name: name || 'Google User',
          email,
          googleId,
          provider: 'google',
          lastLogin: new Date(),
        });

        // Initialize email marketing sequence (non-blocking)
        initializeUserEmailSequence(user).catch(err => {
          console.error('Error initializing user email sequence:', err);
        });

        res.status(201).json({
          success: true,
          message: 'Đăng ký thành công',
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
          },
        });
      }
    }
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi đăng nhập với Google',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
      user.name = name || user.name;
      
      // Check if email is being changed and not already taken
      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email này đã được sử dụng',
          });
        }
        user.email = email;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: updatedUser,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi cập nhật',
    });
  }
};

