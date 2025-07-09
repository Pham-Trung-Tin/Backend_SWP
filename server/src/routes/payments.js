import express from 'express';
import paymentController from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

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
 * @route POST /api/payments/:id/refund
 * @desc Hoàn tiền cho thanh toán
 * @access Private - Chỉ admin có quyền
 */
router.post('/:id/refund', requireAuth, paymentController.refundPayment);

/**
 * @route GET /api/payments/test
 * @desc Route test đơn giản để kiểm tra API hoạt động
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
