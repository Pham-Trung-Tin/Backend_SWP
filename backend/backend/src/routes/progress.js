// Routes cho Progress Tracking API
import express from 'express';
import {
  getAllProgress,
  getProgressByUserId,
  createProgress,
  updateProgress,
  deleteProgress
} from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (cần đăng nhập)
router.get('/', protect, getAllProgress);
router.get('/user/:userId', protect, getProgressByUserId);
router.post('/', protect, createProgress);
router.put('/:id', protect, updateProgress);
router.delete('/:id', protect, deleteProgress);

export default router;
