/**
 * Script đơn giản để test API packages/purchase với token cứng
 * Phương pháp này đơn giản hơn và ít bị lỗi
 */
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Tạo token thủ công không dùng database
async function testPurchaseAPI() {
  try {
    // Tạo token thủ công - phù hợp với cấu trúc bảng users
    const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';
    const payload = {
      id: 1, // ID người dùng cứng 
      email: 'test@example.com',
      full_name: 'Test User', // Sử dụng full_name thay vì name
      role: 'user'
    };
    
    console.log('🔑 Tạo token cứng với payload:', payload);
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    
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
    
    // Đọc và hiển thị response
    const responseData = await response.json();
    
    console.log(`\n📥 Status: ${response.status}`);
    console.log('📥 Response:');
    console.log(JSON.stringify(responseData, null, 2));
    
    // Phân tích lỗi nếu có
    if (!response.ok) {
      console.log('\n❌ API trả về lỗi');
      if (responseData.error && responseData.error.includes('Bind parameters must not contain undefined')) {
        console.log('💡 Gợi ý: Lỗi này xảy ra khi có giá trị undefined được truyền vào truy vấn SQL');
        console.log('   - Kiểm tra cấu trúc JWT payload');
        console.log('   - Đảm bảo id trong token là một số');
        console.log('   - Kiểm tra cấu trúc bảng users có khớp với truy vấn không');
      }
    } else {
      console.log('\n✅ API thành công!');
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi test API:', error);
  }
}

testPurchaseAPI();
