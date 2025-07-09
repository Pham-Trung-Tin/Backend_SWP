import * as Membership from '../models/Membership.js';
import * as Package from '../models/Package.js';

/**
 * Mua hoặc nâng cấp gói thành viên
 * @route POST /api/packages/purchase
 * @access Private
 */
export const purchasePackage = async (req, res) => {
  try {
    const { packageId, paymentMethod } = req.body;
    const userId = req.user.id;
    
    console.log(`📦 User ${userId} purchasing package ${packageId} with method ${paymentMethod}`);
    
    // Validate request
    if (!packageId) {
      return res.status(400).json({
        success: false,
        message: 'Package ID is required',
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
    
    // Kiểm tra nếu gói free thì không cần thanh toán
    if (packageData.price === 0 && paymentMethod !== 'free') {
      return res.status(400).json({
        success: false,
        message: 'Free package requires payment method "free"',
        data: null
      });
    }
    
    // Kiểm tra phương thức thanh toán hợp lệ
    const validPaymentMethods = ['momo', 'vnpay', 'credit_card', 'bank_transfer', 'free'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
        data: null
      });
    }
    
    // Thực hiện mua gói
    const result = await Membership.purchasePackage(userId, packageId, paymentMethod);
    
    // Trả về kết quả
    res.status(200).json({
      success: true,
      message: 'Package purchased successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error purchasing package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase package',
      error: error.message,
      data: null
    });
  }
};

/**
 * Lấy thông tin gói hiện tại của người dùng
 * @route GET /api/packages/user/current
 * @access Private
 */
export const getCurrentMembership = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const membership = await Membership.getCurrentMembership(userId);
    
    if (!membership) {
      return res.status(200).json({
        success: true,
        message: 'User has no active membership',
        data: null
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Current membership retrieved successfully',
      data: membership
    });
  } catch (error) {
    console.error('❌ Error getting current membership:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve current membership',
      error: error.message,
      data: null
    });
  }
};

/**
 * Lấy lịch sử mua gói của người dùng
 * @route GET /api/packages/user/history
 * @access Private
 */
export const getMembershipHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const history = await Membership.getMembershipHistory(userId);
    
    res.status(200).json({
      success: true,
      message: 'Membership history retrieved successfully',
      data: history
    });
  } catch (error) {
    console.error('❌ Error getting membership history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve membership history',
      error: error.message,
      data: null
    });
  }
};

export default {
  purchasePackage,
  getCurrentMembership,
  getMembershipHistory
};
