/**
 * Test force update API (không cần auth)
 */
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

async function forceUpdatePending() {
  console.log('🔄 Bắt đầu force update pending payments...');
  
  try {
    const response = await axios.post(`${API_BASE}/api/payments/force-update-pending`);
    
    console.log('✅ Kết quả:', response.data);
    
    if (response.data.data.updated > 0) {
      console.log(`🎉 Đã cập nhật ${response.data.data.updated} payments từ pending thành completed!`);
      console.log('📋 Danh sách payments đã cập nhật:');
      response.data.data.payments.forEach((payment, index) => {
        console.log(`${index + 1}. ID: ${payment.id}, Transaction: ${payment.transaction_id}, User: ${payment.user_id}, Amount: ${payment.amount}`);
      });
    } else {
      console.log('ℹ️ Không có payments pending nào cần cập nhật');
    }
    
  } catch (error) {
    console.log('❌ Lỗi:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
  }
}

forceUpdatePending();
