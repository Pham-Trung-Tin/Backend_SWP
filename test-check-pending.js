/**
 * Test script để check và update pending payments
 */
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

async function checkPendingPayments() {
  console.log('🧪 Bắt đầu kiểm tra pending payments...');
  
  try {
    // Step 1: Login để lấy token
    console.log('🔐 Đang đăng nhập...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'testuser@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login thành công');
    
    // Step 2: Gọi API kiểm tra pending payments
    console.log('🔄 Đang kiểm tra pending payments...');
    const checkResponse = await axios.post(
      `${API_BASE}/api/payments/check-pending`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Kết quả kiểm tra:', checkResponse.data);
    
    if (checkResponse.data.data.updated > 0) {
      console.log(`🎉 Đã cập nhật ${checkResponse.data.data.updated} payments từ pending thành completed!`);
    } else {
      console.log('ℹ️ Không có payments nào cần cập nhật');
    }
    
    // In chi tiết kết quả
    if (checkResponse.data.data.results && checkResponse.data.data.results.length > 0) {
      console.log('\n📋 Chi tiết kết quả:');
      checkResponse.data.data.results.forEach((result, index) => {
        console.log(`${index + 1}. Payment ID: ${result.paymentId}, Transaction: ${result.transactionId}, Status: ${result.status}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Lỗi:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
    if (error.response?.data?.error) {
      console.log('Chi tiết lỗi:', error.response.data.error);
    }
  }
}

// Chạy test
checkPendingPayments();
