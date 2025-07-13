import * as PaymentTransaction from '../models/PaymentTransaction.js';
import * as Package from '../models/Package.js';

/**
 * Tạo bản ghi thanh toán mới
 * @route POST /api/payments/create
 * @access Private
 */
export const createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { packageId, amount, paymentMethod, paymentStatus, paymentDetails, transactionId } = req.body;
    
    // Validate required fields
    if (!packageId) {
      return res.status(400).json({
        success: false,
        message: 'Package ID is required',
        data: null
      });
    }
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required',
        data: null
      });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required',
        data: null
      });
    }
    
    // Kiểm tra xem gói tồn tại không
    const packageData = await Package.getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: `Package with ID ${packageId} not found`,
        data: null
      });
    }
    
    // Kiểm tra phương thức thanh toán hợp lệ
    const validPaymentMethods = ['momo', 'vnpay', 'credit_card', 'bank_transfer', 'free', 'other'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
        data: null
      });
    }
    
    // Kiểm tra trạng thái thanh toán hợp lệ
    if (paymentStatus) {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
      if (!validStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status',
          data: null
        });
      }
    }
    
    // Tạo dữ liệu thanh toán
    const paymentData = {
      userId,
      packageId,
      amount,
      paymentMethod,
      paymentStatus: paymentStatus || 'pending',
      paymentDetails: paymentDetails || null,
      transactionId: transactionId || null
    };
    
    // Thêm bản ghi thanh toán mới
    const payment = await PaymentTransaction.createPayment(paymentData);
    
    // Trả về kết quả thành công
    res.status(201).json({
      success: true,
      message: 'Payment record created successfully',
      data: payment
    });
    
  } catch (error) {
    console.error('❌ Error creating payment record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment record',
      error: error.message,
      data: null
    });
  }
};

/**
 * Lấy danh sách thanh toán của người dùng hiện tại
 * @route GET /api/payments/user
 * @access Private
 */
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const payments = await PaymentTransaction.getUserPayments(userId);
    
    res.status(200).json({
      success: true,
      message: 'User payments retrieved successfully',
      data: payments
    });
  } catch (error) {
    console.error('❌ Error getting user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user payments',
      error: error.message,
      data: null
    });
  }
};

/**
 * Cập nhật trạng thái thanh toán
 * @route PUT /api/payments/:id/status
 * @access Private
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Payment status is required',
        data: null
      });
    }
    
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status',
        data: null
      });
    }
    
    const updatedPayment = await PaymentTransaction.updatePaymentStatus(id, status, transactionId);
    
    if (!updatedPayment) {
      return res.status(404).json({
        success: false,
        message: `Payment with ID ${id} not found`,
        data: null
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: updatedPayment
    });
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message,
      data: null
    });
  }
};

/**
 * Lấy danh sách lịch sử thanh toán của người dùng hiện tại
 * @route GET /api/payments/user/history
 * @access Private
 */
export const getUserPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, startDate, endDate, limit = 10, page = 1 } = req.query;
    
    console.log('Debug - Query Parameters:', { status, startDate, endDate, limit, page });
    
    // Tạo options để filter - chỉ dùng status và phân trang để đảm bảo hoạt động
    const options = {
      status,
      // Bỏ qua các tham số ngày tháng nếu chúng gây ra vấn đề
      startDate: startDate || null,
      endDate: endDate || null,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };
    
    console.log('Debug - Options:', JSON.stringify(options));
    
    // Sử dụng cùng options cho cả hai hàm để đảm bảo tính nhất quán
    const countOptions = {
      status,
      startDate,
      endDate
    };
    
    const payments = await PaymentTransaction.getUserPaymentHistory(userId, options);
    const total = await PaymentTransaction.countUserPayments(userId, countOptions);
    
    res.status(200).json({
      success: true,
      message: 'User payment history retrieved successfully',
      data: {
        payments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Error getting user payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user payment history',
      error: error.message,
      data: null
    });
  }
};

/**
 * Lấy chi tiết thanh toán theo ID
 * @route GET /api/payments/:id
 * @access Private
 */
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const payment = await PaymentTransaction.getPaymentById(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: `Payment with ID ${id} not found`,
        data: null
      });
    }
    
    // Kiểm tra xem người dùng có quyền xem thanh toán này không
    // Chỉ admin hoặc chủ sở hữu thanh toán mới được xem
    if (payment.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this payment',
        data: null
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment details retrieved successfully',
      data: payment
    });
  } catch (error) {
    console.error('❌ Error getting payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment details',
      error: error.message,
      data: null
    });
  }
};

/**
 * Lấy chi tiết thanh toán theo transaction ID
 * @route GET /api/payments/transaction/:transactionId
 * @access Private
 */
export const getPaymentByTransactionId = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;
    
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required',
        data: null
      });
    }
    
    // Sử dụng findPaymentByTransactionId thay vì getPaymentByTransactionId để dùng đúng bảng payments
    const payment = await PaymentTransaction.findPaymentByTransactionId(transactionId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: `Payment with transaction ID ${transactionId} not found`,
        data: null
      });
    }
    
    // Kiểm tra xem người dùng có quyền xem thanh toán này không
    // Chỉ admin hoặc chủ sở hữu thanh toán mới được xem
    if (payment.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this payment',
        data: null
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment details retrieved successfully',
      data: payment
    });
  } catch (error) {
    console.error('❌ Error getting payment by transaction ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment details',
      error: error.message,
      data: null
    });
  }
};

/**
 * Hoàn tiền cho thanh toán
 * @route POST /api/payments/:id/refund
 * @access Private - Chỉ admin mới có quyền hoàn tiền
 */
export const refundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, refundAmount } = req.body;
    
    // Kiểm tra quyền admin (sẽ cần middleware adminAuth ở route)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can process refunds',
        data: null
      });
    }
    
    // Kiểm tra lý do hoàn tiền
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Refund reason is required',
        data: null
      });
    }
    
    // Lấy thông tin thanh toán
    const payment = await PaymentTransaction.getPaymentById(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: `Payment with ID ${id} not found`,
        data: null
      });
    }
    
    // Kiểm tra trạng thái thanh toán
    if (payment.payment_status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund completed payments',
        data: null
      });
    }
    
    // Thực hiện hoàn tiền
    const refundData = {
      paymentId: id,
      reason,
      amount: refundAmount || payment.amount,
      refundedBy: req.user.id,
      timestamp: new Date()
    };
    
    const refundResult = await PaymentTransaction.refundPayment(id, refundData);
    
    // Cập nhật gói thành viên nếu hoàn tiền thành công
    if (refundResult) {
      // Hủy gói thành viên
      try {
        const Membership = await import('../models/Membership.js');
        await Membership.deactivateMembership(payment.user_id, payment.package_id);
        console.log(`✅ Deactivated membership for user ${payment.user_id}, package ${payment.package_id}`);
      } catch (membershipError) {
        console.error('❌ Error deactivating membership:', membershipError);
        // Vẫn tiếp tục vì hoàn tiền đã thành công
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      data: refundResult
    });
    
  } catch (error) {
    console.error('❌ Error refunding payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refund payment',
      error: error.message,
      data: null
    });
  }
};

/**
 * Xác minh thanh toán
 * @route POST /api/payments/verify
 * @access Public - Không yêu cầu xác thực để cổng thanh toán có thể gọi
 */
export const verifyPayment = async (req, res) => {
  try {
    console.log(`✅ Payment verification API called from: ${req.originalUrl}`);
    
    const { 
      transactionId, 
      paymentStatus, 
      paymentMethod, 
      amount, 
      signature,
      paymentDetails 
    } = req.body;
    
    // Validate required fields
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required',
        data: null
      });
    }
    
    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Payment status is required',
        data: null
      });
    }
    
    // Kiểm tra trạng thái thanh toán hợp lệ
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status',
        data: null
      });
    }
    
    // Tìm payment có transaction_id tương ứng
    const payment = await PaymentTransaction.findPaymentByTransactionId(transactionId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: `Payment with transaction ID ${transactionId} not found`,
        data: null
      });
    }
    
    // Cập nhật trạng thái thanh toán
    const updatedPayment = await PaymentTransaction.updatePaymentStatus(
      payment.id,
      paymentStatus,
      transactionId
    );
    
    // Thêm chi tiết thanh toán nếu có
    if (paymentDetails) {
      await PaymentTransaction.updatePaymentDetails(payment.id, paymentDetails);
    }
    
    // Nếu thanh toán hoàn tất, cập nhật gói thành viên của người dùng
    if (paymentStatus === 'completed') {
      // Import Membership service để cập nhật gói thành viên
      const Membership = await import('../models/Membership.js');
      
      // Gọi hàm cập nhật membership
      try {
        await Membership.activateMembership(payment.user_id, payment.package_id);
        console.log(`✅ Activated membership for user ${payment.user_id}, package ${payment.package_id}`);
      } catch (membershipError) {
        console.error('❌ Error activating membership:', membershipError);
        // Vẫn tiếp tục xử lý vì thanh toán đã thành công
      }
    }
    
    // Trả về kết quả thành công
    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: payment.id,
        transactionId,
        status: paymentStatus
      }
    });
    
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message,
      data: null
    });
  }
};

// Export default object cho sử dụng trong route
export default {
  createPayment,
  getUserPayments,
  updatePaymentStatus,
  verifyPayment,
  getUserPaymentHistory,
  getPaymentById,
  refundPayment,
  getPaymentByTransactionId
};
