/**
 * Fix cho vấn đề cập nhật trạng thái cuộc hẹn
 * File này tạo ra một endpoint mới với các xử lý đặc biệt
 */

import { pool } from './src/config/database.js';
import jwt from 'jsonwebtoken';

/**
 * Thiết lập endpoint mới cho việc cập nhật trạng thái cuộc hẹn
 */
export default function setupStatusUpdateEndpoint(app) {
  app.options('/api/appointments-update/:id/status', (req, res) => {
    // Xử lý preflight request
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
  });

  // Endpoint mới để cập nhật trạng thái
  app.post('/api/appointments-update/:id/status', async (req, res) => {
    try {
      // Xử lý CORS cho tất cả các origin trong môi trường phát triển
      const origin = req.headers.origin || '*';
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      console.log(`🔄 Update appointment status request received for ID: ${req.params.id}`);
      
      // 1. Xác thực người dùng từ token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      const token = authHeader.split(' ')[1];
      let decoded;
      
      try {
        // Sử dụng cùng JWT_SECRET từ env
        const JWT_SECRET = process.env.JWT_SECRET || 'nosmoke_super_secret_key_2024_very_long_and_secure';
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        console.error('❌ Token verification failed:', err);
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      
      const userId = decoded.id;
      const userRole = decoded.role;
      const appointmentId = req.params.id;
      const { status } = req.body;
      
      console.log(`👤 User: ${userId} (${userRole}) | Appointment: ${appointmentId} | New Status: ${status}`);
      
      // 2. Validate status
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value. Must be one of: pending, confirmed, completed, cancelled'
        });
      }
      
      // 3. Get appointment to check if user has permission
      const [appointmentRows] = await pool.query(
        'SELECT * FROM appointments WHERE id = ?',
        [appointmentId]
      );
      
      if (appointmentRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
      
      const appointment = appointmentRows[0];
      
      // 4. Check if user has permission
      if (userRole !== 'coach' || appointment.coach_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only the assigned coach can update this appointment status'
        });
      }
      
      // 5. Update appointment status
      const [updateResult] = await pool.query(
        'UPDATE appointments SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, appointmentId]
      );
      
      if (updateResult.affectedRows === 0) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update appointment status'
        });
      }
      
      // 6. Get updated appointment
      const [updatedAppointmentRows] = await pool.query(
        'SELECT * FROM appointments WHERE id = ?',
        [appointmentId]
      );
      
      // 7. Return success response
      return res.status(200).json({
        success: true,
        message: 'Appointment status updated successfully',
        data: updatedAppointmentRows[0]
      });
      
    } catch (error) {
      console.error('❌ Error updating appointment status:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  });
  
  console.log('✅ Special appointment status update endpoint initialized: /api/appointments-update/:id/status');
}
