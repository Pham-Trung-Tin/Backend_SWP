const Membership = require('../models/membershipModel');
const User = require('../models/userModel');

/**
 * Lấy danh sách tất cả các gói thành viên
 * @param {Object} req - Đối tượng yêu cầu
 * @param {Object} res - Đối tượng phản hồi
 */
exports.getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.getAllTypes();
    res.status(200).json({
      success: true,
      data: memberships
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách gói thành viên', error: error.message });
  }
};

/**
 * Lấy thông tin chi tiết một gói thành viên theo loại
 * @param {Object} req - Đối tượng yêu cầu
 * @param {Object} res - Đối tượng phản hồi
 */
exports.getMembershipByType = async (req, res) => {
  const { type } = req.params;
  try {
    const membership = await Membership.getByType(type);
    if (!membership) {
      return res.status(404).json({ 
        success: false,
        message: 'Gói thành viên không tồn tại' 
      });
    }
    res.status(200).json({
      success: true,
      data: membership
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin gói thành viên', error: error.message });
  }
};

/**
 * Đăng ký sử dụng gói thành viên
 * @param {Object} req - Đối tượng yêu cầu
 * @param {Object} res - Đối tượng phản hồi
 */
exports.subscribe = async (req, res) => {
  try {
    const { membershipType, paymentId, amount } = req.body;
    const userId = req.user.id;
    
    // Check if membership type exists
    const membership = await Membership.getByType(membershipType);
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Gói thành viên không tồn tại'
      });
    }
    
    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
    
    // Create subscription
    const subscription = await Membership.createSubscription({
      userId,
      membershipType,
      startDate,
      endDate,
      paymentId,
      amount
    });
    
    res.status(201).json({
      success: true,
      data: {
        subscription,
        message: `Đã đăng ký thành công gói ${membershipType}`
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đăng ký gói thành viên', error: error.message });
  }
};

/**
 * Lấy thông tin gói đăng ký hiện tại của người dùng
 * @param {Object} req - Đối tượng yêu cầu
 * @param {Object} res - Đối tượng phản hồi
 */
exports.getActiveSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = await Membership.getUserActiveSubscription(userId);
    
    res.status(200).json({
      success: true,
      data: subscription || {
        message: "Không tìm thấy gói đăng ký nào đang hoạt động"
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin gói đăng ký', error: error.message });
  }
};

/**
 * Kiểm tra quyền truy cập tính năng dựa trên gói thành viên
 * @param {Object} req - Đối tượng yêu cầu
 * @param {Object} res - Đối tượng phản hồi
 */
exports.checkFeatureAccess = async (req, res) => {
  try {
    const { featureType } = req.body;
    const userId = req.user.id;
    
    const hasAccess = await Membership.hasAccessToFeature(userId, featureType);
    
    res.status(200).json({
      success: true,
      hasAccess,
      requiredMembership: featureType
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi kiểm tra quyền truy cập', error: error.message });
  }
};