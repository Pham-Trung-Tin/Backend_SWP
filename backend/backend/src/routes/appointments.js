import express from 'express';
import {
  getUserAppointments,
  createAppointment,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  rateAppointment,
  getUpcomingAppointments,
  getAppointmentStatistics
} from '../controllers/appointmentController.js';
import { authenticateToken } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting cho appointment routes
const appointmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 10, // Tối đa 10 appointments mỗi giờ
  message: {
    success: false,
    message: 'Quá nhiều lần đặt lịch hẹn, vui lòng thử lại sau'
  }
});

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// Appointment routes
router.get('/', getUserAppointments);
router.get('/upcoming', getUpcomingAppointments);
router.get('/statistics', getAppointmentStatistics);
router.get('/:id', getAppointmentById);
router.post('/', appointmentLimiter, createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', cancelAppointment);
router.post('/:id/rating', rateAppointment);

export default router;
