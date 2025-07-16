/**
 * Direct route endpoint cho việc cập nhật trạng thái booking
 * File này tạo một controller đơn giản cho endpoint mới không sử dụng PATCH
 * và không cần xử lý phức tạp CORS
 */

import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import * as appointmentController from '../controllers/appointmentController.js';

const createStatusRoutes = () => {
  const router = express.Router();
  
  /**
   * @route POST /api/appointment-update/:id/status
   * @desc Alternative endpoint to update appointment status (avoids PATCH issues)
   * @access Private - Requires coach authentication
   */
  router.post('/:id/status', requireAuth, appointmentController.updateAppointmentStatus);
  
  /**
   * @route OPTIONS /api/appointment-update/:id/status
   * @desc Handle preflight requests for CORS
   */
  router.options('/:id/status', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
  });
  
  return router;
};

export default createStatusRoutes;
