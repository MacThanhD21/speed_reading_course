import express from 'express';
import {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  initAdmin,
  getUsersWithSmartReadStats,
  getUserReadingSessions,
} from '../controllers/adminController.js';
import {
  getApiKeys,
  getApiKey,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  testApiKey,
  testAllApiKeys,
} from '../controllers/apiKeyController.js';
import {
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initialize admin (chỉ dùng một lần)
router.post('/init', initAdmin);

// All routes below require admin authentication
router.use(protect);
router.use(admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// SmartRead admin routes
router.get('/smartread/users', getUsersWithSmartReadStats);
router.get('/smartread/users/:userId/sessions', getUserReadingSessions);

// API Keys management routes
router.get('/api-keys', getApiKeys);
router.get('/api-keys/:id', getApiKey);
router.post('/api-keys', createApiKey);
router.put('/api-keys/:id', updateApiKey);
router.delete('/api-keys/:id', deleteApiKey);
router.post('/api-keys/:id/test', testApiKey);
router.post('/api-keys/test-all', testAllApiKeys);

// Testimonials management routes
router.get('/testimonials', getAllTestimonials);
router.get('/testimonials/:id', getTestimonialById);
router.post('/testimonials', createTestimonial);
router.put('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

export default router;

