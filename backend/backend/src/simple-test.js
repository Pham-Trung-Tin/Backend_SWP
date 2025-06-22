// Hãy thử một file kết nối đơn giản hơn
import mysql from 'mysql2/promise';

async function testConnection() {
  try {    // Tạo kết nối với thông tin cố định
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root', // Thử các mật khẩu phổ biến
      database: 'SmokingCessationDB'
    });
    
    console.log('✅ Kết nối thành công đến MySQL!');
    
    // Thử thực hiện một truy vấn đơn giản
    const [users] = await connection.execute('SELECT * FROM User LIMIT 3');
    console.log('📋 Danh sách người dùng:');
    console.table(users);
    
    // Lấy thông tin các bảng trong database
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📊 Danh sách các bảng:');
    console.table(tables);
    
    // Đóng kết nối
    await connection.end();
    console.log('✅ Đã đóng kết nối MySQL');
    
  } catch (err) {
    console.error('❌ Lỗi kết nối MySQL:', err);
  }
}

// Chạy kiểm tra kết nối
testConnection();
