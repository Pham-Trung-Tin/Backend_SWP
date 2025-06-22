import express from 'express';
import {
  getUserDashboard,
  updateUserProfile,
  updateQuitPlan,
  completeMilestone,
  updateSettings,
  getUserStatistics
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// User routes
router.get('/dashboard', getUserDashboard);
router.get('/statistics', getUserStatistics);
router.put('/profile', updateUserProfile);
router.put('/quit-plan', updateQuitPlan);
router.post('/quit-plan/milestone/:milestoneIndex/complete', completeMilestone);
router.put('/settings', updateSettings);

export default router;
