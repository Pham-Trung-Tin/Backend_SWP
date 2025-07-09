/**
 * Script để test API purchase với token từ login
 * Sử dụng: node src/scripts/test-with-login-token.js LOGIN_TOKEN
 */
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Lấy token từ tham số dòng lệnh
const token = process.argv[2];

if (!token) {
  console.error('❌ Vui lòng cung cấp token JWT!');
  console.log('Sử dụng: node src/scripts/test-with-login-token.js LOGIN_TOKEN');
  process.exit(1);
}

async function testWithLoginToken() {
  try {
    // Hiển thị thông tin token
    console.log('🔑 Sử dụng token được cung cấp...');
    
    // Decode token để hiển thị thông tin
    try {
      const decoded = jwt.decode(token);
      if (decoded) {
        console.log('Token payload:', JSON.stringify(decoded, null, 2));
      }
    } catch (decodeError) {
      console.log('Không thể decode token (nhưng vẫn có thể sử dụng)');
    }
    
    // API URL và body
    const API_URL = 'http://localhost:5000/api/packages/purchase';
    const requestBody = {
      packageId: 2,
      paymentMethod: "momo"
    };
    
    console.log(`\n📡 Gửi request đến ${API_URL}`);
    console.log('📦 Body:', requestBody);
    console.log('🔐 Authorization: Bearer ' + token.substring(0, 20) + '...');
    
    // Gọi API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });
    
    // Đọc response
    const responseData = await response.json();
    
    console.log(`\n📥 Status: ${response.status}`);
    console.log('📥 Response:');
    console.log(JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('\n✅ API call thành công!');
    } else {
      console.log('\n❌ API call thất bại!');
      
      // Phân tích lỗi
      if (response.status === 401) {
        console.log('\n💡 Lỗi xác thực 401:');
        if (responseData.message && responseData.message.includes('missing')) {
          console.log('- Token không chứa ID người dùng');
          console.log('- Hãy kiểm tra cấu trúc token với lệnh: npm run decode-token YOUR_TOKEN');
        }
        
        console.log('\n🔧 Thử các giải pháp:');
        console.log('1. Tạo token mới với script: npm run generate-token');
        console.log('2. Kiểm tra API đăng nhập có đặt ID người dùng vào token không');
        console.log('3. Cập nhật middleware để hỗ trợ định dạng token này');
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi test API:', error);
  }
}

testWithLoginToken();
