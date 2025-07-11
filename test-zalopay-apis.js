// Test script để kiểm tra các API ZaloPay
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test data
const testData = {
  // Thay đổi transaction ID này với ID từ database của bạn
  transactionId: '250711_1000045624', // Lấy từ bảng payments hoặc payment_transactions
  userToken: 'YOUR_JWT_TOKEN_HERE' // Lấy từ localStorage sau khi login
};

async function testZaloPayAPIs() {
  console.log('=== Testing ZaloPay APIs ===\n');

  try {
    // Test 1: Query ZaloPay status
    console.log('1. Testing ZaloPay status query...');
    const statusResponse = await axios.get(
      `${BASE_URL}/api/payments/zalopay/status/${testData.transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${testData.userToken}`
        }
      }
    );
    console.log('✅ Status Response:', statusResponse.data);
    console.log('');

    // Test 2: Manual update
    console.log('2. Testing manual update...');
    const updateResponse = await axios.post(
      `${BASE_URL}/api/payments/zalopay/manual-update/${testData.transactionId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${testData.userToken}`
        }
      }
    );
    console.log('✅ Update Response:', updateResponse.data);
    console.log('');

    // Test 3: Get payment by transaction ID
    console.log('3. Testing get payment by transaction ID...');
    const paymentResponse = await axios.get(
      `${BASE_URL}/api/payments/transaction/${testData.transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${testData.userToken}`
        }
      }
    );
    console.log('✅ Payment Response:', paymentResponse.data);

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Request Error:', error.message);
    }
  }
}

// Instructions for running this test
console.log(`
🚀 ZaloPay API Test Script

Để chạy test này:
1. Đảm bảo server đang chạy trên port 5000
2. Cập nhật transactionId với ID thực từ database của bạn
3. Lấy JWT token từ localStorage sau khi login và cập nhật userToken
4. Chạy: node test-zalopay-apis.js

Các transaction IDs hiện có trong database:
- Kiểm tra bảng payments hoặc payment_transactions để lấy transaction_id
- Ví dụ: 250711_1000045624, 250711_1000045625, v.v.

Để lấy JWT token:
1. Mở browser, đăng nhập vào ứng dụng
2. Mở Developer Tools (F12)
3. Vào tab Application/Storage -> Local Storage
4. Tìm key 'nosmoke_token' và copy value
`);

// Uncomment dòng này và cập nhật testData để chạy test
// testZaloPayAPIs();
