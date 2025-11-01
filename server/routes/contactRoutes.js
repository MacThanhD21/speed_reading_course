import express from 'express';
import {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
} from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes
router.post('/', createContact);
router.get('/', protect, admin, getContacts);
router.get('/:id', protect, admin, getContactById);
router.put('/:id', protect, admin, updateContact);
router.delete('/:id', protect, admin, deleteContact);

export default router;

