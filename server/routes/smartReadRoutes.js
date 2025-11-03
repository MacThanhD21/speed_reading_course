import express from 'express';
import {
  createReadingSession,
  saveQuizResult,
  getUserReadingHistory,
  getUserStats,
  getReadingSession,
  generateQuiz,
  generateFiveWOneH,
  generateReadingTips,
  generateComprehensiveLearning,
  evaluateEssayAnswers,
  getGeminiPoolStats,
} from '../controllers/smartReadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.post('/sessions', createReadingSession);
router.get('/sessions', getUserReadingHistory);
router.get('/sessions/:id', getReadingSession);
router.post('/quiz-results', saveQuizResult);
router.get('/stats', getUserStats);

// AI endpoints with stricter rate limiting
router.post('/generate-quiz', aiRateLimiter, generateQuiz);
router.post('/fivewoneh', aiRateLimiter, generateFiveWOneH);
router.post('/reading-tips', aiRateLimiter, generateReadingTips);
router.post('/comprehensive-learning', aiRateLimiter, generateComprehensiveLearning);
router.post('/evaluate-essay', aiRateLimiter, evaluateEssayAnswers);

// Admin/Health endpoint to check pool stats
router.get('/pool-stats', getGeminiPoolStats);

export default router;

