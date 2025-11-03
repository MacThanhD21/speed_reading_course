import express from 'express';
import {
  getTestimonials,
  createUserTestimonial,
  getMyTestimonial,
  updateMyTestimonial,
} from '../controllers/testimonialController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getTestimonials);

// Protected routes (user must be authenticated)
router.post('/', protect, createUserTestimonial);
router.get('/my-testimonial', protect, getMyTestimonial);
router.put('/my-testimonial', protect, updateMyTestimonial);

export default router;

