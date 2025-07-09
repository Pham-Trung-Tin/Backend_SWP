import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import membershipApi from '../utils/membershipApi';

// Tạo context cho quản lý membership
const MembershipContext = createContext(null);

// Hook tùy chỉnh để sử dụng MembershipContext
export const useMembership = () => useContext(MembershipContext);

// Provider component
export const MembershipProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [currentPackage, setCurrentPackage] = useState(null);
  const [membershipHistory, setMembershipHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
      // Xác định packageId dựa trên targetMembership
      const packageId = targetMembership === 'premium' ? 2 : targetMembership === 'pro' ? 3 : 1;
      
      // Gọi API để mua gói membership mới
      const response = await membershipApi.purchasePackage(packageId, 'momo');
      
      if (!response.success) {
        throw new Error(response.message || 'Không thể nâng cấp gói thành viên');
      }
      
      // API purchasePackage đã cập nhật localStorage, chỉ cần gọi updateUser để cập nhật state
      await updateUser({ membership: targetMembership, membershipType: targetMembership });
      
      return { success: true };
    } catch (error) {
      console.error('Upgrade membership error:', error);
      
      return { 
        success: false, 
        error: error.message || 'Có lỗi xảy ra khi nâng cấp gói thành viên' 
      };
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

  // Lấy thông tin membership hiện tại từ API
  useEffect(() => {
    const fetchCurrentMembership = async () => {
      if (user && user.id) {
        setLoading(true);
        setError(null);
        try {
          console.log('MembershipContext - Fetching current membership data...');
          const response = await membershipApi.getCurrentMembership();
          
          if (response.success && response.data) {
            console.log('MembershipContext - Membership data fetched successfully:', response.data);
            setCurrentPackage(response.data);
            
            // Cập nhật thông tin user nếu có sự khác biệt về membership
            if (response.data.package_name) {
              let membershipValue = 'free';
              const packageName = response.data.package_name.toLowerCase();
              
              if (packageName.includes('pro')) {
                membershipValue = 'pro';
              } else if (packageName.includes('premium')) {
                membershipValue = 'premium';
              } else if (response.data.package_id !== 1) {
                membershipValue = 'premium';
              }
              
              console.log('MembershipContext - Determined membership value:', membershipValue);
              console.log('MembershipContext - Current user membership:', user.membership);
              
              if (user.membership !== membershipValue) {
                console.log('MembershipContext - Updating user with new membership:', membershipValue);
                updateUser({ 
                  membership: membershipValue, 
                  membershipType: membershipValue,
                  packageDetails: response.data
                });
              }
            }
          } else {
            console.warn('MembershipContext - Failed to fetch membership data:', response.message);
            setError(response.message || 'Không thể lấy thông tin gói thành viên');
          }
        } catch (err) {
          console.error('MembershipContext - Error fetching membership:', err);
          setError(err.message || 'Đã xảy ra lỗi khi lấy thông tin gói thành viên');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchCurrentMembership();
    
    // Thiết lập interval để tự động refresh membership data
    const intervalId = setInterval(() => {
      if (user && user.id) {
        console.log('MembershipContext - Auto refreshing membership data...');
        fetchCurrentMembership();
      }
    }, 180000); // 3 phút
    
    // Lắng nghe sự kiện membership-updated
    const handleMembershipUpdate = (event) => {
      if (event.detail && event.detail.membership) {
        console.log('MembershipContext - Membership update event received:', event.detail);
        
        // Cập nhật package details nếu có
        if (event.detail.packageDetails) {
          setCurrentPackage(event.detail.packageDetails);
        }
        
        // Force refresh membership data
        fetchCurrentMembership();
      }
    };
    
    // Đăng ký lắng nghe sự kiện
    window.addEventListener('membership-updated', handleMembershipUpdate);
    
    // Cleanup function
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('membership-updated', handleMembershipUpdate);
    };
    
    // Hàm này sẽ được gọi khi component được mount hoặc khi user thay đổi
  }, [user, updateUser]);

  // Lấy lịch sử gói thành viên
  const fetchMembershipHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await membershipApi.getMembershipHistory();
      if (response.success && response.data) {
        setMembershipHistory(response.data);
      } else {
        setError(response.message || 'Không thể lấy lịch sử gói thành viên');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi lấy lịch sử gói thành viên');
      console.error('Error fetching membership history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mua gói thành viên
  const purchasePackage = async (packageId, paymentMethod) => {
    if (!user) return { success: false, error: 'Chưa đăng nhập' };
    
    setLoading(true);
    setError(null);
    try {
      const response = await membershipApi.purchasePackage(packageId, paymentMethod);
      
      if (response.success && response.data) {
        // Cập nhật thông tin gói hiện tại
        setCurrentPackage(response.data);
        
        // Cập nhật trạng thái membership trong user
        let membershipValue = 'free';
        if (response.data.packageName) {
          const packageName = response.data.packageName.toLowerCase();
          if (packageName.includes('pro')) {
            membershipValue = 'pro';
          } else if (packageName.includes('premium')) {
            membershipValue = 'premium';
          } else if (response.data.packageId !== 1) {
            membershipValue = 'premium';
          }
        }
        
        // Cập nhật user trong auth context
        await updateUser({ 
          membership: membershipValue, 
          membershipType: membershipValue 
        });
        
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Không thể mua gói thành viên');
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi mua gói thành viên');
      console.error('Error purchasing package:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Giá trị context
  const value = {
    membershipTiers,
    getCurrentMembershipInfo,
    upgradeMembership,
    checkFeatureAccess,
    purchasePackage,
    fetchMembershipHistory,
    currentMembership: user?.membership || 'free',
    currentPackage,
    membershipHistory,
    loading,
    error
  };

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
};

export default MembershipContext;
