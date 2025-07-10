import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API base URL
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
let authToken = '';

/**
 * Đăng nhập để lấy token
 */
async function login() {
  try {
    console.log('🔑 Đang đăng nhập...');
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: process.env.TEST_USER_EMAIL || 'user@example.com',
        password: process.env.TEST_USER_PASSWORD || 'password123'
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.data.token) {
      authToken = data.data.token;
      console.log('✅ Đăng nhập thành công, đã nhận token.');
      return true;
    } else {
      console.error('❌ Đăng nhập thất bại:', data.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('❌ Lỗi khi đăng nhập:', error.message);
    return false;
  }
}

/**
 * Kiểm tra API lịch sử thanh toán với các bộ tham số khác nhau
 */
async function testPaymentHistoryAPI() {
  try {
    if (!authToken) {
      console.error('❌ Cần đăng nhập trước khi kiểm tra API');
      return;
    }
    
    console.log('\n🧪 Kiểm tra API lịch sử thanh toán');
    
    // Các bộ test để thử
    const testCases = [
      { name: 'Mặc định', params: {} },
      { name: 'Limit và page', params: { limit: 5, page: 1 } },
      { name: 'Lọc theo trạng thái', params: { status: 'completed' } },
      { name: 'Lọc theo ngày bắt đầu', params: { startDate: '2023-01-01' } },
      { name: 'Lọc theo ngày kết thúc', params: { endDate: '2023-12-31' } },
      { name: 'Lọc theo khoảng ngày', params: { startDate: '2023-01-01', endDate: '2023-12-31' } },
      { name: 'Tất cả các tham số', params: { limit: 5, page: 1, status: 'completed', startDate: '2023-01-01', endDate: '2023-12-31' } }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📝 Test case: ${testCase.name}`);
      
      // Tạo query string từ params
      const queryString = Object.entries(testCase.params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      
      const url = `${API_BASE_URL}/payments/user/history${queryString ? '?' + queryString : ''}`;
      
      console.log(`🔗 URL: ${url}`);
      
      const startTime = Date.now();
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const endTime = Date.now();
      
      const data = await response.json();
      
      console.log(`⏱️ Thời gian phản hồi: ${endTime - startTime}ms`);
      console.log(`🔢 HTTP Status: ${response.status}`);
      
      if (data.success) {
        console.log('✅ API trả về thành công');
        console.log(`📊 Tổng số thanh toán: ${data.data.pagination.total}`);
        console.log(`📄 Số thanh toán trả về: ${data.data.payments.length}`);
      } else {
        console.error('❌ API trả về lỗi:', data.message || 'Unknown error');
        if (data.error) {
          console.error('📝 Chi tiết lỗi:', data.error);
        }
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra API:', error.message);
  }
}

// Chạy test
async function runTests() {
  if (await login()) {
    await testPaymentHistoryAPI();
  }
}

runTests().catch(error => {
  console.error('❌ Lỗi khi chạy test:', error);
  process.exit(1);
});
