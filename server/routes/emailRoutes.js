import express from 'express';
import {
  processQueue,
  getQueueStats,
  getEmailQueue,
  retryEmail,
  cancelEmail,
} from '../controllers/emailController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(admin);

router.post('/process-queue', processQueue);
router.get('/queue-stats', getQueueStats);
router.get('/queue', getEmailQueue);
router.post('/queue/:id/retry', retryEmail);
router.post('/queue/:id/cancel', cancelEmail);

export default router;

