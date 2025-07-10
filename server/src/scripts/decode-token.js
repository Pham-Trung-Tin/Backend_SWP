/**
 * Script để phân tích token JWT và hiển thị cấu trúc payload
 * Sử dụng: node src/scripts/decode-token.js YOUR_JWT_TOKEN
 */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Lấy token từ tham số dòng lệnh
const token = process.argv[2];

if (!token) {
  console.error('❌ Vui lòng cung cấp token JWT!');
  console.log('Sử dụng: node src/scripts/decode-token.js YOUR_JWT_TOKEN');
  process.exit(1);
}

try {
  console.log('🔍 Phân tích token JWT...');
  
  // Decode token mà không xác thực (để hiểu cấu trúc)
  const decodedHeader = jwt.decode(token, { complete: true })?.header;
  console.log('\n📋 Header:', decodedHeader);
  
  // Decode payload
  const decoded = jwt.decode(token);
  
  if (!decoded) {
    console.error('❌ Không thể decode token. Token không hợp lệ hoặc định dạng không được hỗ trợ.');
    process.exit(1);
  }
  
  console.log('\n📋 Token payload:');
  console.log(JSON.stringify(decoded, null, 2));
  
  // Phân tích payload chi tiết
  console.log('\n🔎 Phân tích cấu trúc payload:');
  
  // Các trường chuẩn JWT
  const standardClaims = ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti'];
  console.log('\n  📌 Các trường chuẩn JWT:');
  for (const claim of standardClaims) {
    if (decoded[claim] !== undefined) {
      let value = decoded[claim];
      if (claim === 'exp' || claim === 'nbf' || claim === 'iat') {
        const date = new Date(value * 1000);
        value = `${value} (${date.toISOString()})`;
      }
      console.log(`    - ${claim}: ${value}`);
    }
  }
  
  // Phân tích cấu trúc ID người dùng
  console.log('\n  📌 Thông tin người dùng:');
  
  // Kiểm tra các trường có thể chứa ID
  const possibleIdFields = ['id', 'userId', 'user_id', 'sub'];
  let foundId = false;
  
  for (const field of possibleIdFields) {
    if (decoded[field] !== undefined) {
      console.log(`    - ${field}: ${decoded[field]}`);
      foundId = true;
    }
  }
  
  // Kiểm tra đối tượng lồng nhau
  const nestedObjects = Object.keys(decoded).filter(
    key => typeof decoded[key] === 'object' && decoded[key] !== null
  );
  
  if (nestedObjects.length > 0) {
    console.log('\n  📌 Đối tượng lồng nhau:');
    
    for (const obj of nestedObjects) {
      console.log(`    - ${obj}:`);
      for (const key in decoded[obj]) {
        console.log(`      + ${key}: ${decoded[obj][key]}`);
      }
    }
  }
  
  // Đề xuất cách cập nhật middleware
  console.log('\n🔧 Đề xuất cho middleware:');
  if (foundId) {
    console.log('  ✅ Token này đã có ID người dùng, middleware hiện tại nên nhận ra được.');
  } else if (nestedObjects.length > 0) {
    console.log('  ⚠️ Token này sử dụng cấu trúc lồng nhau. Cần cập nhật middleware để xử lý đối tượng:');
    for (const obj of nestedObjects) {
      if (decoded[obj].id !== undefined) {
        console.log(`    decoded.${obj}.id`);
      }
    }
  } else {
    console.log('  ❌ Token này không có ID người dùng ở định dạng phổ biến.');
    console.log('  💡 Kiểm tra lại quá trình tạo token trong API đăng nhập.');
  }
  
} catch (error) {
  console.error('❌ Lỗi khi phân tích token:', error);
}
