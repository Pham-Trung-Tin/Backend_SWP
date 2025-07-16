/**
 * Script debug endpoint với fetch theo từng bước
 */
import fetch from 'node-fetch';

const testEndpoint = async () => {
  try {
    // Dùng ID appointment cần test
    const appointmentId = 147;
    const status = 'confirmed';
    
    // Token được lấy sau khi login (thay YOUR_TOKEN)
    const token = 'YOUR_TOKEN';
    
    // Đảm bảo không có khoảng trắng trong giá trị status
    const trimmedStatus = status.trim();
    
    console.log(`🔍 Testing update status for appointment ID=${appointmentId} to status="${trimmedStatus}"`);
    
    const url = `http://localhost:5000/api/appointment-update/${appointmentId}/status`;
    console.log(`🔗 URL: ${url}`);
    
    // Tạo payload
    const payload = JSON.stringify({ status: trimmedStatus });
    console.log(`📦 Payload: ${payload}`);
    
    // Headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    console.log('📋 Headers:', headers);
    
    // Gửi request
    console.log('⏳ Sending request...');
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: payload
    });
    
    // Kiểm tra response
    console.log(`📩 Response status: ${response.status} ${response.statusText}`);
    console.log('📩 Response headers:', response.headers.raw());
    
    // Nếu trả về lỗi, kiểm tra chi tiết
    if (!response.ok) {
      const responseText = await response.text();
      try {
        // Try to parse JSON
        const jsonData = JSON.parse(responseText);
        console.error('❌ Error response:', jsonData);
        
        // Kiểm tra chi tiết về status và message
        if (jsonData.message && jsonData.message.includes('Invalid status')) {
          console.log('\n🔍 Debug hướng dẫn:');
          console.log('1. Đang gửi:', { statusValue: trimmedStatus, statusType: typeof trimmedStatus });
          console.log('2. Kiểm tra giá trị của validStatuses trên server');
          console.log('3. Kiểm tra lại hàm includes đang dùng');
          console.log('4. Thử gửi một status khác như "pending" hoặc "completed"');
        }
      } catch (e) {
        // Not JSON
        console.error('❌ Error response (text):', responseText);
      }
      return;
    }
    
    // Xử lý response thành công
    const data = await response.json();
    console.log('✅ Success response:', data);
    
  } catch (error) {
    console.error('❌ Error during request:', error);
  }
};

testEndpoint();
