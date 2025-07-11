// Test manual update cho transaction ID cụ thể
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';
const TRANSACTION_ID = '250711_50659'; // Transaction ID từ database

async function testManualUpdate() {
  console.log('=== Testing Manual Update ZaloPay ===\n');
  
  try {
    // Bước 1: Kiểm tra trạng thái hiện tại
    console.log('1. Kiểm tra trạng thái ZaloPay...');
    const statusResponse = await axios.get(
      `${BASE_URL}/api/payments/zalopay/status/${TRANSACTION_ID}`
    );
    console.log('✅ Status từ ZaloPay:', statusResponse.data);
    console.log('');

    // Bước 2: Manual update (cần token)
    console.log('2. Thực hiện manual update...');
    console.log('⚠️  Cần JWT token để thực hiện manual update');
    console.log('Để lấy token:');
    console.log('- Đăng nhập vào ứng dụng');
    console.log('- Mở Developer Tools (F12)');
    console.log('- Application/Storage -> Local Storage');
    console.log('- Copy value của key "nosmoke_token"');
    console.log('');
    
    // Nếu có token, uncomment và thay thế TOKEN_HERE
    /*
    const token = 'YOUR_TOKEN_HERE';
    const updateResponse = await axios.post(
      `${BASE_URL}/api/payments/zalopay/manual-update/${TRANSACTION_ID}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('✅ Manual update result:', updateResponse.data);
    */
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Request Error:', error.message);
    }
  }
}

// Chạy test
testManualUpdate();
