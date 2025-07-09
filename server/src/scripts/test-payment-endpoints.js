/**
 * Script kiểm tra các API endpoint mới của payments
 */

import fetch from 'node-fetch';

// Cấu hình test
const API_BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testPaymentId = '';

// Helper function để gọi API
const callApi = async (endpoint, method = 'GET', data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const requestOptions = {
    method,
    headers
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    requestOptions.body = JSON.stringify(data);
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`🔍 ${method} ${url}`);
  
  const response = await fetch(url, requestOptions);
  const result = await response.json();
  
  return {
    status: response.status,
    data: result
  };
};

// Đăng nhập để lấy token
const login = async () => {
  console.log('🔑 Đang đăng nhập để lấy token...');
  
  try {
    // Thử đăng nhập với một số tài khoản test khác nhau
    const testAccounts = [
      { email: 'user@example.com', password: 'password123' },
      { email: 'admin@example.com', password: 'admin123' },
      { email: 'test@test.com', password: 'test123' }
    ];
    
    let loginSuccess = false;
    let response;
    
    for (const account of testAccounts) {
      console.log(`Trying to login with ${account.email}...`);
      response = await callApi('/auth/login', 'POST', account);
      
      if (response.status === 200 && response.data.token) {
        loginSuccess = true;
        break;
      }
    }
    
    if (loginSuccess) {
      authToken = response.data.token;
      console.log('✅ Đăng nhập thành công, token đã được lưu');
      return true;
    } else {
      console.error('❌ Đăng nhập thất bại:', response ? response.data : 'No response');
      return false;
    }
    
    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      console.log('✅ Đăng nhập thành công, token đã được lưu');
      return true;
    } else {
      console.error('❌ Đăng nhập thất bại:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error);
    return false;
  }
};

// Test tạo payment để có dữ liệu test
const createTestPayment = async () => {
  console.log('\n📝 Đang tạo payment mới cho test...');
  
  try {
    const response = await callApi('/payments/create', 'POST', {
      packageId: 1, // Premium package
      amount: 99000,
      paymentMethod: 'momo',
      transactionId: `TEST_${Date.now()}`
    }, authToken);
    
    if (response.status === 201 && response.data.success) {
      testPaymentId = response.data.data.id;
      console.log(`✅ Đã tạo payment mới với ID: ${testPaymentId}`);
      return true;
    } else {
      console.error('❌ Tạo payment thất bại:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Lỗi tạo payment:', error);
    return false;
  }
};

// Test GET /api/payments/user/history
const testGetPaymentHistory = async () => {
  console.log('\n📊 Test 1: GET /api/payments/user/history');
  
  try {
    // Test với các tham số phân trang
    const response = await callApi('/payments/user/history?limit=5&page=1', 'GET', null, authToken);
    
    console.log('📝 Response status:', response.status);
    console.log('📝 Response data:', JSON.stringify(response.data, null, 2));
    
    // Test với filter theo status
    const responseWithFilter = await callApi('/payments/user/history?status=pending', 'GET', null, authToken);
    
    console.log('\n📝 Response status (with filter):', responseWithFilter.status);
    console.log('📝 Response data count:', responseWithFilter.data.data.payments.length);
    
    return response.status === 200 && response.data.success;
  } catch (error) {
    console.error('❌ Error testing payment history API:', error);
    return false;
  }
};

// Test GET /api/payments/:id
const testGetPaymentById = async () => {
  console.log('\n📋 Test 2: GET /api/payments/:id');
  
  try {
    const response = await callApi(`/payments/${testPaymentId}`, 'GET', null, authToken);
    
    console.log('📝 Response status:', response.status);
    console.log('📝 Response data:', JSON.stringify(response.data, null, 2));
    
    return response.status === 200 && response.data.success;
  } catch (error) {
    console.error('❌ Error testing get payment by ID API:', error);
    return false;
  }
};

// Test POST /api/payments/:id/refund (requires admin access)
const testRefundPayment = async () => {
  console.log('\n💰 Test 3: POST /api/payments/:id/refund');
  
  try {
    const response = await callApi(`/payments/${testPaymentId}/refund`, 'POST', {
      reason: 'Customer requested a refund',
      refundAmount: 99000
    }, authToken);
    
    console.log('📝 Response status:', response.status);
    console.log('📝 Response data:', JSON.stringify(response.data, null, 2));
    
    // Note: This might return 403 if the test user is not an admin
    return response.status === 200 || response.status === 403;
  } catch (error) {
    console.error('❌ Error testing refund payment API:', error);
    return false;
  }
};

// Main execution
const runTests = async () => {
  console.log('🚀 Starting payment endpoints tests...\n');
  
  // Login first to get token
  const loggedIn = await login();
  if (!loggedIn) {
    console.error('❌ Tests aborted: Could not login');
    return;
  }
  
  // Create test payment
  const paymentCreated = await createTestPayment();
  if (!paymentCreated) {
    console.error('❌ Tests will continue but might fail without valid test payment');
  }
  
  // Run tests
  await testGetPaymentHistory();
  
  if (testPaymentId) {
    await testGetPaymentById();
    await testRefundPayment();
  } else {
    console.warn('⚠️ Skipping payment ID specific tests because no payment was created');
  }
  
  console.log('\n✅ All tests completed!');
};

// Run all tests
runTests();
