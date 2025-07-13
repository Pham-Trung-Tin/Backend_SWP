// Test script để kiểm tra authentication fix
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

// Test 1: Đăng nhập để lấy token
async function testLogin() {
  console.log('\n=== TEST 1: Login ===');
  try {
    const response = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'testuser@example.com',
      password: 'password123'
    });
    
    if (response.data.success) {
      console.log('✅ Login thành công');
      console.log('Token:', response.data.data.token.substring(0, 20) + '...');
      return response.data.data.token;
    } else {
      console.log('❌ Login thất bại:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Login lỗi:', error.response?.data?.message || error.message);
    return null;
  }
}

// Test 2: Kiểm tra API packages với token
async function testPackagesAPI(token) {
  console.log('\n=== TEST 2: Packages API ===');
  try {
    const response = await axios.get(`${API_BASE}/api/packages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Packages API thành công');
    console.log('Số packages:', response.data.data.length);
    return true;
  } catch (error) {
    console.log('❌ Packages API lỗi:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 3: Kiểm tra payment API với token
async function testPaymentAPI(token) {
  console.log('\n=== TEST 3: Payment API ===');
  try {
    // Test tạo payment
    const response = await axios.post(`${API_BASE}/api/payments/zalopay/create`, {
      packageId: 1,
      amount: 999000
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Payment API thành công');
    console.log('Order URL được tạo:', response.data.data.order_url ? 'Có' : 'Không');
    return true;
  } catch (error) {
    console.log('❌ Payment API lỗi:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
    return false;
  }
}

// Chạy tất cả tests
async function runTests() {
  console.log('🧪 Bắt đầu test authentication fix...');
  
  const token = await testLogin();
  if (!token) {
    console.log('\n❌ Không thể lấy token, dừng test');
    return;
  }
  
  await testPackagesAPI(token);
  await testPaymentAPI(token);
  
  console.log('\n✅ Test hoàn thành!');
}

runTests().catch(console.error);
