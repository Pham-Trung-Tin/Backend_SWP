/**
 * Tiện ích hỗ trợ kiểm tra và quản lý quyền truy cập theo gói thành viên
 */

// Danh sách các cấp độ thành viên theo thứ tự tăng dần
export const MEMBERSHIP_LEVELS = ['free', 'premium', 'pro'];

/**
 * Kiểm tra xem người dùng có quyền truy cập tính năng không dựa trên gói thành viên
 * @param {string} userMembership - Gói thành viên của người dùng ('free', 'premium', 'pro')
 * @param {string} requiredMembership - Gói thành viên tối thiểu cần thiết
 * @returns {boolean} - true nếu có quyền truy cập, false nếu không
 */
export const hasAccessToFeature = (userMembership = 'free', requiredMembership = 'premium') => {
  const userLevel = MEMBERSHIP_LEVELS.indexOf(userMembership);
  const requiredLevel = MEMBERSHIP_LEVELS.indexOf(requiredMembership);
  
  // Nếu không tìm thấy membership trong danh sách, coi như không có quyền
  if (userLevel === -1 || requiredLevel === -1) return false;
  
  // Có quyền truy cập nếu cấp độ người dùng >= cấp độ yêu cầu
  return userLevel >= requiredLevel;
};

/**
 * Lấy gói thành viên tối thiểu từ danh sách các gói được phép
 * @param {Array<string>} allowedMemberships - Danh sách các gói được phép truy cập
 * @returns {string} - Gói thành viên tối thiểu
 */
export const getMinimumRequiredMembership = (allowedMemberships = []) => {
  if (!allowedMemberships || allowedMemberships.length === 0) return 'free';
  
  // Sắp xếp theo cấp độ và lấy gói thấp nhất
  return allowedMemberships.sort((a, b) => {
    const levelA = MEMBERSHIP_LEVELS.indexOf(a);
    const levelB = MEMBERSHIP_LEVELS.indexOf(b);
    return levelA - levelB;
  })[0];
};

/**
 * Hiển thị tên gói thành viên đẹp hơn
 * @param {string} membershipType - Loại gói thành viên ('free', 'premium', 'pro')
 * @returns {string} - Tên hiển thị đẹp hơn
 */
export const formatMembershipName = (membershipType = 'free') => {
  const names = {
    'free': 'Miễn phí',
    'premium': 'Pre',
    'pro': 'Pro'
  };
  
  return names[membershipType] || 'Miễn phí';
};
