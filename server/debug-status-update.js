/**
 * Script test trực tiếp endpoint cập nhật trạng thái
 * Script này sẽ kiểm tra chi tiết request và response
 */

// Nhập thư viện http/https
import http from 'http';

// Cài đặt thông tin request
const appointmentId = 147; // Thay đổi ID nếu cần
const status = 'confirmed'; // Có thể thay đổi: 'pending', 'confirmed', 'completed', 'cancelled'
const token = 'Bearer YOUR_TOKEN_HERE'; // Thay YOUR_TOKEN_HERE bằng token thật

// Tạo payload cho request
const data = JSON.stringify({
  status: status
});

// Log chi tiết request sắp gửi
console.log('🔄 Chuẩn bị gửi request...');
console.log(`📦 Payload: ${data}`);

// Tạo options cho request
const options = {
  hostname: 'localhost',
  port: 5000,
  path: `/api/appointment-update/${appointmentId}/status`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': token
  }
};

// Log thông tin request
console.log('📡 Request details:');
console.log(`URL: http://${options.hostname}:${options.port}${options.path}`);
console.log('Method:', options.method);
console.log('Headers:', JSON.stringify(options.headers, null, 2));

// Tạo request và xử lý response
const req = http.request(options, (res) => {
  console.log(`🔄 Status Code: ${res.statusCode}`);
  console.log('📄 Headers:', res.headers);
  
  // Collect data chunks
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  // Process complete response
  res.on('end', () => {
    console.log('📋 Response body:');
    try {
      // Try to parse as JSON
      const parsedData = JSON.parse(responseData);
      console.log(JSON.stringify(parsedData, null, 2));
      
      // Log chi tiết nếu có lỗi
      if (!parsedData.success) {
        console.error('❌ Response indicates an error:', parsedData.message);
        
        // Log gợi ý debug
        console.log('\n🔍 Gợi ý debug:');
        console.log('1. Kiểm tra giá trị status đã đúng định dạng chưa (chữ hoa/thường)')
        console.log('2. Kiểm tra token có đúng và còn hạn không')
        console.log('3. Kiểm tra appointmentId có tồn tại không')
        console.log('4. Kiểm tra user từ token có quyền cập nhật không (có phải coach không)')
      } else {
        console.log('✅ Request successful!');
      }
    } catch (error) {
      // Non-JSON response
      console.log(responseData);
      console.error('❌ Failed to parse response as JSON:', error.message);
    }
  });
});

// Handle request errors
req.on('error', (error) => {
  console.error('❌ Request error:', error);
});

// Write data and end request
req.write(data);
req.end();

console.log('⏳ Waiting for response...');
