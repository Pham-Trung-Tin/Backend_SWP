// Routes cho Plans API
import express from 'express';
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
} from '../controllers/planController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes (có thể xem plans)
router.get('/', getAllPlans);
router.get('/:id', getPlanById);

// Protected routes (cần đăng nhập)
router.post('/', protect, createPlan);
router.put('/:id', protect, updatePlan);
router.delete('/:id', protect, deletePlan);

export default router;
