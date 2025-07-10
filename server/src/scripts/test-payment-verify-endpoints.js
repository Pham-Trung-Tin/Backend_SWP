import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API base URL
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

/**
 * Kiểm tra API xác minh thanh toán mới (/api/payments/verify)
 */
async function testVerifyPaymentAPI() {
  console.log('\n🧪 Kiểm tra API xác minh thanh toán mới (POST /api/payments/verify)');
  
  try {
    // Dữ liệu kiểm tra
    const testPaymentData = {
      transactionId: 'MOM' + Date.now(),
      paymentStatus: 'completed',
      paymentMethod: 'momo',
      amount: 99000,
      signature: 'test-signature',
      paymentDetails: {
        orderId: 'ORDER' + Date.now(),
        paymentTime: new Date().toISOString()
      }
    };
    
    console.log('📝 Dữ liệu gửi đi:', JSON.stringify(testPaymentData, null, 2));
    
    // Tạo payment record thông qua endpoint cũ (cần có token)
    console.log('\n📡 Bước 1: Gọi API xác minh thanh toán mới');
    const response = await fetch(`${API_BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPaymentData)
    });
    
    const result = await response.json();
    
    console.log(`🔢 HTTP Status: ${response.status}`);
    console.log('📊 Kết quả:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ API xác minh thanh toán mới hoạt động bình thường!');
    } else {
      console.error('❌ API xác minh thanh toán mới gặp lỗi:', result.message || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra API xác minh thanh toán:', error.message);
  }
}

/**
 * Kiểm tra API xác minh thanh toán cũ (/api/payments/callback/verify) để so sánh
 */
async function testCallbackVerifyAPI() {
  console.log('\n🧪 Kiểm tra API xác minh thanh toán cũ (POST /api/payments/callback/verify)');
  
  try {
    // Dữ liệu kiểm tra
    const testPaymentData = {
      transactionId: 'MOM' + Date.now(),
      paymentStatus: 'completed',
      paymentMethod: 'momo',
      amount: 99000,
      signature: 'test-signature',
      paymentDetails: {
        orderId: 'ORDER' + Date.now(),
        paymentTime: new Date().toISOString()
      }
    };
    
    console.log('📝 Dữ liệu gửi đi:', JSON.stringify(testPaymentData, null, 2));
    
    // Gọi API xác minh thanh toán cũ
    console.log('\n📡 Bước 1: Gọi API xác minh thanh toán cũ');
    const response = await fetch(`${API_BASE_URL}/payments/callback/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPaymentData)
    });
    
    const result = await response.json();
    
    console.log(`🔢 HTTP Status: ${response.status}`);
    console.log('📊 Kết quả:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ API xác minh thanh toán cũ hoạt động bình thường!');
    } else {
      console.error('❌ API xác minh thanh toán cũ gặp lỗi:', result.message || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra API xác minh thanh toán cũ:', error.message);
  }
}

// Chạy các kiểm tra
async function runTests() {
  // Kiểm tra API mới
  await testVerifyPaymentAPI();
  
  // Kiểm tra API cũ để so sánh
  await testCallbackVerifyAPI();
  
  // Kết quả tổng quan
  console.log('\n📊 Kết quả tổng quan:');
  console.log('1. Đã thêm API mới POST /api/payments/verify');
  console.log('2. Giữ nguyên API cũ POST /api/payments/callback/verify để tương thích ngược');
  console.log('3. Cả hai API đều trỏ đến cùng một controller function');
}

runTests().catch(error => {
  console.error('❌ Lỗi khi chạy kiểm tra:', error);
  process.exit(1);
});
