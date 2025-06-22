import express from 'express';
import {
  createDailyCheckin,
  getTodayCheckin,
  getCheckinHistory,
  updateCheckin,
  getCheckinStatistics,
  getCheckinTrends
} from '../controllers/checkinController.js';
import { authenticateToken } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting cho checkin routes
const checkinLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5, // Tối đa 5 check-ins mỗi giờ
  message: {
    success: false,
    message: 'Quá nhiều lần check-in, vui lòng thử lại sau'
  }
});

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// Checkin routes
router.post('/', checkinLimiter, createDailyCheckin);
router.get('/today', getTodayCheckin);
router.get('/history', getCheckinHistory);
router.get('/statistics', getCheckinStatistics);
router.get('/trends', getCheckinTrends);
router.put('/:id', updateCheckin);

export default router;
