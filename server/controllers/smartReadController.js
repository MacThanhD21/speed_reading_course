import mongoose from 'mongoose';
import ReadingSession from '../models/ReadingSession.js';
import QuizResult from '../models/QuizResult.js';
import User from '../models/User.js';

// @desc    Create a new reading session
// @route   POST /api/smartread/sessions
// @access  Private
export const createReadingSession = async (req, res) => {
  try {
    const { content, readingStats } = req.body;

    if (!content || !content.text || !readingStats) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin',
      });
    }

    const session = await ReadingSession.create({
      user: req.user._id,
      content: {
        title: content.title || 'Văn bản đã dán',
        text: content.text,
        wordCount: content.wordCount || content.text.trim().split(/\s+/).length,
        source: content.source || 'pasted',
      },
      readingStats: {
        wpm: readingStats.wpm,
        duration: readingStats.duration,
        startTime: readingStats.startTime ? new Date(readingStats.startTime) : new Date(),
        endTime: readingStats.endTime ? new Date(readingStats.endTime) : new Date(),
      },
      status: 'completed',
    });

    // Populate user info
    await session.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Đã lưu phiên đọc thành công',
      data: session,
    });
  } catch (error) {
    console.error('Create reading session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi tạo phiên đọc',
    });
  }
};

// @desc    Save quiz result
// @route   POST /api/smartread/quiz-results
// @access  Private
export const saveQuizResult = async (req, res) => {
  try {
    const { readingSessionId, quizType, results, metrics, answers, feedback } = req.body;

    if (!readingSessionId || !results || !metrics) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin',
      });
    }

    // Verify reading session belongs to user
    const session = await ReadingSession.findOne({
      _id: readingSessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiên đọc',
      });
    }

    // Calculate RCI if user has previous results
    let rci = null;
    const previousResults = await QuizResult.find({
      user: req.user._id,
      'metrics.rei': { $exists: true, $ne: null },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('metrics.rei');

    if (previousResults.length >= 3) {
      const reiValues = previousResults
        .map((r) => r.metrics?.rei)
        .filter((rei) => rei != null && !isNaN(rei) && rei > 0);
      
      if (reiValues.length >= 3) {
        const maxRei = Math.max(...reiValues);
        const minRei = Math.min(...reiValues);
        const avgRei = reiValues.reduce((a, b) => a + b, 0) / reiValues.length;
        if (avgRei > 0) {
          const variation = ((maxRei - minRei) / avgRei) * 100;
          rci = Math.max(0, Math.min(100, 100 - Math.min(variation, 100))); // RCI is inverse of variation
        }
      }
    }

    // Create quiz result
    const quizResult = await QuizResult.create({
      user: req.user._id,
      readingSession: readingSessionId,
      quizType: quizType || 'mixed',
      results: {
        correctCount: results.correctCount,
        totalQuestions: results.totalQuestions,
        comprehensionPercent: results.comprehensionPercent,
      },
      metrics: {
        wpm: metrics.wpm,
        rei: metrics.rei,
        rci: rci,
      },
      answers: answers || [],
      feedback: feedback || '',
    });

    // Update reading session with quiz result
    session.quizResult = quizResult._id;
    session.status = 'completed';
    await session.save();

    // Populate data
    await quizResult.populate('user', 'name email');
    await quizResult.populate('readingSession');

    res.status(201).json({
      success: true,
      message: 'Đã lưu kết quả quiz thành công',
      data: quizResult,
    });
  } catch (error) {
    console.error('Save quiz result error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lưu kết quả quiz',
    });
  }
};

// @desc    Get user's reading history
// @route   GET /api/smartread/sessions
// @access  Private
export const getUserReadingHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sessions = await ReadingSession.find({ user: req.user._id })
      .populate('quizResult')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ReadingSession.countDocuments({ user: req.user._id });

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
    console.error('Get reading history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy lịch sử đọc',
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/smartread/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total sessions
    const totalSessions = await ReadingSession.countDocuments({ user: userId });

    // Get average WPM
    const avgWpmResult = await ReadingSession.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avgWpm: { $avg: '$readingStats.wpm' } } },
    ]);

    // Get average comprehension
    const avgComprehensionResult = await QuizResult.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avgComprehension: { $avg: '$results.comprehensionPercent' } } },
    ]);

    // Get average REI
    const avgReiResult = await QuizResult.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avgRei: { $avg: '$metrics.rei' } } },
    ]);

    // Get best scores
    const bestWpm = await ReadingSession.findOne({ user: userId })
      .sort({ 'readingStats.wpm': -1 })
      .select('readingStats.wpm createdAt');

    const bestRei = await QuizResult.findOne({ user: userId })
      .sort({ 'metrics.rei': -1 })
      .select('metrics.rei createdAt');

    res.json({
      success: true,
      data: {
        totalSessions,
        avgWpm: avgWpmResult[0]?.avgWpm || 0,
        avgComprehension: avgComprehensionResult[0]?.avgComprehension || 0,
        avgRei: avgReiResult[0]?.avgRei || 0,
        bestWpm: bestWpm?.readingStats.wpm || 0,
        bestRei: bestRei?.metrics.rei || 0,
        lastActivity: await ReadingSession.findOne({ user: userId })
          .sort({ createdAt: -1 })
          .select('createdAt'),
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy thống kê',
    });
  }
};

// @desc    Get single reading session
// @route   GET /api/smartread/sessions/:id
// @access  Private
export const getReadingSession = async (req, res) => {
  try {
    const session = await ReadingSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('quizResult');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiên đọc',
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Get reading session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server',
    });
  }
};

