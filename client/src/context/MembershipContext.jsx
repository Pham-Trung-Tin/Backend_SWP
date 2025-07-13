import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Tạo context cho quản lý membership
const MembershipContext = createContext(null);

// Hook tùy chỉnh để sử dụng MembershipContext
export const useMembership = () => useContext(MembershipContext);

// Provider component
export const MembershipProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  
  // Danh sách các gói thành viên
  const membershipTiers = {
    free: {
      name: 'Miễn phí',
      description: 'Gói cơ bản với các tính năng cơ bản',
      price: 0,
      features: [
        'Theo dõi tiến trình cai thuốc',
        'Tài liệu cơ bản',
        'Công cụ theo dõi tâm trạng'
      ],
      icon: '🔸'
    },
    premium: {
      name: 'Premium',
      description: 'Gói premium với các tính năng nâng cao',
      price: 99000,
      features: [
        'Tất cả tính năng của gói Miễn phí',
        'Chat với Coach',
        'Nội dung premium',
        'Công cụ phân tích nâng cao'
      ],
      icon: '🔶'
    },
    pro: {
      name: 'Professional',
      description: 'Gói chuyên nghiệp với đầy đủ tính năng',
      price: 199000,
      features: [
        'Tất cả tính năng của gói Premium',
        'Tư vấn 1-1 với chuyên gia',
        'Kế hoạch cai thuốc cá nhân hóa',
        'Ưu tiên hỗ trợ 24/7'
      ],
      icon: '💎'
    }
  };

  // Lấy thông tin gói thành viên hiện tại
  const getCurrentMembershipInfo = () => {
    const currentTier = user?.membership || 'free';
    return membershipTiers[currentTier];
  };
  
  // Nâng cấp membership
  const upgradeMembership = async (targetMembership) => {
    if (!user) return { success: false, error: 'Chưa đăng nhập' };
    if (!membershipTiers[targetMembership]) return { success: false, error: 'Gói thành viên không hợp lệ' };
    
    // Kiểm tra xem có đang nâng cấp không
    const currentTierIndex = Object.keys(membershipTiers).indexOf(user.membership || 'free');
    const targetTierIndex = Object.keys(membershipTiers).indexOf(targetMembership);
    
    if (currentTierIndex >= targetTierIndex) {
      return { 
        success: false, 
        error: 'Bạn đang sử dụng gói thành viên cao hơn hoặc tương đương' 
      };
    }
    
    try {
      // Cập nhật membership của người dùng
      const result = await updateUser({ membership: targetMembership });
      
      if (result.success) {
        // Thêm transaction vào lịch sử
        const transactions = JSON.parse(localStorage.getItem('membership_transactions') || '[]');
        transactions.push({
          id: Date.now().toString(),
          userId: user.id,
          membershipType: targetMembership,
          amount: membershipTiers[targetMembership].price,
          date: new Date().toISOString(),
          status: 'completed'
        });
        localStorage.setItem('membership_transactions', JSON.stringify(transactions));
        
        return { success: true };
      } else {
        return result; // Trả về kết quả từ updateUser
      }
    } catch (error) {
      return { success: false, error: 'Có lỗi xảy ra khi nâng cấp gói thành viên' };
    }
  };
    // Kiểm tra xem người dùng có quyền truy cập tính năng không
  const checkFeatureAccess = (requiredMembership) => {
    if (!user) return false;
    
    // Đảm bảo rằng requiredMembership là một giá trị hợp lệ
    if (!requiredMembership || !['free', 'premium', 'pro'].includes(requiredMembership)) {
      requiredMembership = 'premium'; // Giá trị mặc định nếu không hợp lệ
    }
    
    const membershipLevels = ['free', 'premium', 'pro'];
    const userLevel = membershipLevels.indexOf(user.membership || 'free');
    const requiredLevel = membershipLevels.indexOf(requiredMembership);
    
    // Kiểm tra bổ sung để ghi log và debug
    console.log(`Kiểm tra quyền truy cập: User ${user.email} có gói ${user.membership || 'free'} (cấp ${userLevel})`);
    console.log(`Yêu cầu gói tối thiểu: ${requiredMembership} (cấp ${requiredLevel})`);
    console.log(`Kết quả: ${userLevel >= requiredLevel ? 'Có quyền truy cập' : 'Không có quyền truy cập'}`);
    
    return userLevel >= requiredLevel;
  };

  // Giá trị context
  const value = {
    membershipTiers,
    getCurrentMembershipInfo,
    upgradeMembership,
    checkFeatureAccess,
    currentMembership: user?.membership || 'free'
  };

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
};

export default MembershipContext;
