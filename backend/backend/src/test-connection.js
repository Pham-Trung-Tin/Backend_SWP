// Đây là file kết nối MySQL đơn giản
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Khởi tạo dotenv
dotenv.config();

async function checkConnection() {
  try {    // Sử dụng thông tin kết nối cố định
    const dbConfig = {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '12345',
      database: 'SmokingCessationDB'
    };
    
    console.log('Cấu hình kết nối:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });
    
    // Tạo kết nối
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Kết nối thành công đến MySQL!');
    
    // Thử thực hiện một truy vấn đơn giản
    const [rows] = await connection.execute('SELECT * FROM User LIMIT 5');
    console.log('Danh sách người dùng:');
    console.log(rows);
    
    // Đóng kết nối
    await connection.end();
    console.log('Đã đóng kết nối MySQL');
    
  } catch (err) {
    console.error('Lỗi kết nối MySQL:', err);
  }
}

// Chạy kiểm tra kết nối
checkConnection();
