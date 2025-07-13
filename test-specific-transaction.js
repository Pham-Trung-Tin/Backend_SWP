/**
 * Simple test để kiểm tra transaction ID cụ thể
 */
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

async function testSpecificTransaction() {
  console.log('🧪 Test transaction cụ thể...');
  
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'testuser@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login thành công');
    
    // Thay transaction ID này bằng transaction ID từ payment vừa tạo
    const transactionId = '250714_182894'; // Từ log server
    
    console.log(`🔍 Đang kiểm tra transaction: ${transactionId}`);
    
    // Test manual update API
    const updateResponse = await axios.post(
      `${API_BASE}/api/payments/zalopay/manual-update/${transactionId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Kết quả:', updateResponse.data);
    
  } catch (error) {
    console.log('❌ Lỗi:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
    if (error.response?.data) {
      console.log('Response data:', error.response.data);
    }
  }
}

testSpecificTransaction();
