/**
 * Test Packages API for development and testing
 */
import api from './api';

/**
 * Get all available packages for testing
 * @returns {Promise<Object>} API response with packages data
 */
export const testPackagesApi = async () => {
  try {
    console.log('🔍 Fetching test packages...');
    
    // Add auth header if user is logged in
    const options = api.addAuthHeader({
      method: 'GET'
    });
    
    const response = await api.fetch('/api/packages', options);
    console.log('📦 Test packages API response:', response);
    
    return response;
  } catch (error) {
    console.error('❌ Error in testPackagesApi:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to get test packages',
      data: [] 
    };
  }
};

/**
 * Mock data for testing when API is not available
 */
export const getMockPackages = () => {
  return {
    success: true,
    message: 'Mock packages retrieved successfully',
    data: [
      {
        id: 1,
        name: 'Free',
        membershipType: 'free',
        description: 'Gói cơ bản giúp bạn bắt đầu hành trình cai thuốc lá',
        price: 0,
        period: 'lifetime',
        features: [
          'Hỗ trợ cơ bản',
          'Theo dõi tiến trình',
          'Truy cập forum cộng đồng',
          'Kiến thức cơ bản về cai thuốc lá'
        ]
      },
      {
        id: 2,
        name: 'Premium',
        membershipType: 'premium',
        description: 'Gói nâng cao với nhiều tính năng hỗ trợ hơn',
        price: 99000,
        period: 'month',
        features: [
          'Tất cả tính năng của gói Free',
          'Kế hoạch cai thuốc lá cá nhân hóa',
          'Nhắc nhở và thông báo tùy chỉnh',
          'Hỗ trợ qua chat với chuyên gia 5 lần/tháng',
          'Tài liệu và hướng dẫn chuyên sâu'
        ]
      },
      {
        id: 3,
        name: 'Pro',
        membershipType: 'pro',
        description: 'Giải pháp toàn diện dành cho người muốn cai thuốc lá hiệu quả',
        price: 999000,
        period: 'year',
        features: [
          'Tất cả tính năng của gói Premium',
          'Hỗ trợ 1-1 với chuyên gia không giới hạn',
          'Phân tích dữ liệu chi tiết và đề xuất cá nhân',
          'Tham gia nhóm hỗ trợ độc quyền',
          'Ưu đãi cho các sản phẩm và dịch vụ liên quan',
          'Cam kết hoàn tiền nếu không hiệu quả sau 3 tháng'
        ]
      }
    ]
  };
};

export default {
  testPackagesApi,
  getMockPackages
};
