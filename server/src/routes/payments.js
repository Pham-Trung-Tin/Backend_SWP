import express from 'express';
import paymentController from '../controllers/paymentController.js';
import paymentStatusController from '../controllers/paymentStatusController.js';
import zaloPayRoutes from './zaloPayRoutes.js';
import { authenticateToken as requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Include ZaloPay routes
router.use('/', zaloPayRoutes);

/**
 * @route POST /api/payments/create
 * @desc Tạo bản ghi thanh toán mới
 * @access Private - Yêu cầu đăng nhập
 */
router.post('/create', requireAuth, paymentController.createPayment);

/**
 * @route GET /api/payments/user
 * @desc Lấy danh sách thanh toán của người dùng hiện tại
 * @access Private - Yêu cầu đăng nhập
 */
router.get('/user', requireAuth, paymentController.getUserPayments);

/**
 * @route POST /api/payments/verify
 * @desc Xác minh thanh toán từ cổng thanh toán
 * @access Public - Không yêu cầu xác thực để cổng thanh toán có thể gọi
 */
router.post('/verify', paymentController.verifyPayment);

/**
 * @route POST /api/payments/callback/verify
 * @desc Xác minh thanh toán từ cổng thanh toán (callback URL) - Endpoint cũ, giữ lại để tương thích ngược
 * @access Public - Không yêu cầu xác thực để cổng thanh toán có thể gọi
 * @deprecated - Sử dụng /api/payments/verify thay thế
 */
router.post('/callback/verify', paymentController.verifyPayment);

/**
 * @route PUT /api/payments/:id/status
 * @desc Cập nhật trạng thái thanh toán
 * @access Private - Yêu cầu đăng nhập
 */
router.put('/:id/status', requireAuth, paymentController.updatePaymentStatus);

/**
 * @route GET /api/payments/user/history
 * @desc Lấy lịch sử thanh toán của người dùng hiện tại với phân trang và lọc
 * @access Private - Yêu cầu đăng nhập
 */
router.get('/user/history', requireAuth, paymentController.getUserPaymentHistory);

/**
 * @route GET /api/payments/:id
 * @desc Lấy chi tiết thanh toán theo ID
 * @access Private - Yêu cầu đăng nhập
 */
router.get('/:id', requireAuth, paymentController.getPaymentById);

/**
 * @route GET /api/payments/transaction/:transactionId
 * @desc Lấy chi tiết thanh toán theo transaction ID
 * @access Private - Yêu cầu đăng nhập
 */
router.get('/transaction/:transactionId', requireAuth, paymentController.getPaymentByTransactionId);

/**
 * @route POST /api/payments/:id/refund
 * @desc Hoàn tiền cho thanh toán
 * @access Private - Chỉ admin có quyền
 */
router.post('/:id/refund', requireAuth, paymentController.refundPayment);

/**
 * @route POST /api/payments/check-pending
 * @desc Kiểm tra và cập nhật tất cả pending payments
 * @access Private - Yêu cầu đăng nhập
 */
router.post('/check-pending', requireAuth, paymentStatusController.checkAndUpdatePendingPayments);

/**
 * @route POST /api/payments/force-update-pending
 * @desc Force update tất cả pending payments thành completed - KHÔNG CẦN AUTH (chỉ dùng cho debug)
 * @access Public
 */
router.post('/force-update-pending', async (req, res) => {
  try {
    console.log('🔄 Force updating pending payments...');
    
    // Import trong route để tránh circular dependency
    const PaymentTransaction = await import('../models/PaymentTransaction.js');
    const { pool } = await import('../config/database.js');
    
    // Lấy tất cả pending payments
    const [pendingPayments] = await pool.execute(`
      SELECT * FROM payment_transactions 
      WHERE status = 'pending' 
      ORDER BY created_at DESC
    `);
    
    console.log(`📋 Tìm thấy ${pendingPayments.length} payments đang pending`);
    
    if (pendingPayments.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Không có payments pending nào',
        data: { updated: 0, payments: [] }
      });
    }
    
    // Cập nhật tất cả thành completed
    const [updateResult] = await pool.execute(`
      UPDATE payment_transactions 
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP 
      WHERE status = 'pending'
    `);
    
    // Cập nhật payments table cũng
    const [updatePaymentsResult] = await pool.execute(`
      UPDATE payments 
      SET payment_status = 'completed' 
      WHERE payment_status = 'pending'
    `);
    
    console.log(`✅ Đã cập nhật ${updateResult.affectedRows} payment_transactions và ${updatePaymentsResult.affectedRows} payments`);
    
    return res.status(200).json({
      success: true,
      message: `Đã cập nhật ${updateResult.affectedRows} payments từ pending thành completed`,
      data: {
        updated: updateResult.affectedRows,
        updatedPayments: updatePaymentsResult.affectedRows,
        payments: pendingPayments.map(p => ({
          id: p.id,
          transaction_id: p.transaction_id,
          user_id: p.user_id,
          amount: p.amount
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Lỗi force update pending payments:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi force update pending payments',
      error: error.message
    });
  }
});

/**
 * @route GET /api/payments/test
 * @desc Test endpoint để kiểm tra API hoạt động
 * @access Public
 */
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Payment API is working',
    timestamp: new Date().toISOString()
  });
});

export default router;
