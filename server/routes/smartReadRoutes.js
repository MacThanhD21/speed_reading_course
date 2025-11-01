import express from 'express';
import {
  createReadingSession,
  saveQuizResult,
  getUserReadingHistory,
  getUserStats,
  getReadingSession,
} from '../controllers/smartReadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.post('/sessions', createReadingSession);
router.get('/sessions', getUserReadingHistory);
router.get('/sessions/:id', getReadingSession);
router.post('/quiz-results', saveQuizResult);
router.get('/stats', getUserStats);

export default router;

