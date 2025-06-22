// Kiểm tra kết nối MySQL và hiển thị schema
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import process from 'process';
import { table } from 'console';

// Khởi tạo biến môi trường
dotenv.config();

// Thông tin kết nối từ biến môi trường hoặc mặc định
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_NAME = process.env.DB_NAME || 'SmokingCessationDB';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '12345';

// Cấu hình kết nối
const dbConfig = {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME
};

// Hàm kiểm tra kết nối và hiển thị schema
async function testMySQLConnection() {
  try {
    console.log('\n====== KIỂM TRA KẾT NỐI MYSQL ======');
    console.log('Thông tin kết nối:');
    console.log(`  Host: ${DB_HOST}:${DB_PORT}`);
    console.log(`  Database: ${DB_NAME}`);
    console.log(`  User: ${DB_USER}`);
    console.log('Đang kết nối...');
    
    // Tạo kết nối
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Kết nối thành công đến MySQL!');

    // Lấy danh sách bảng
    console.log('\n====== DANH SÁCH BẢNG ======');
    const [tables] = await connection.query(`
      SELECT table_name, table_rows, create_time, update_time
      FROM information_schema.tables
      WHERE table_schema = ?
      ORDER BY table_name
    `, [DB_NAME]);
    
    if (tables.length === 0) {
      console.log('Không có bảng nào trong database.');
    } else {
      table(tables);
    }

    // Lấy thông tin chi tiết của mỗi bảng
    for (const tbl of tables) {
      const tableName = tbl.TABLE_NAME;
      console.log(`\n====== SCHEMA BẢNG: ${tableName} ======`);
      
      // Lấy thông tin cột
      const [columns] = await connection.query(`
        SELECT column_name, column_type, is_nullable, column_key, column_default, extra
        FROM information_schema.columns
        WHERE table_schema = ? AND table_name = ?
        ORDER BY ordinal_position
      `, [DB_NAME, tableName]);
      
      if (columns.length === 0) {
        console.log('Không tìm thấy thông tin cột.');
      } else {
        table(columns);
      }
      
      // Kiểm tra dữ liệu trong bảng
      const [count] = await connection.query(`
        SELECT COUNT(*) AS count FROM ${tableName}
      `);
      
      console.log(`Số bản ghi: ${count[0].count}`);
      
      // Hiển thị 5 bản ghi đầu tiên nếu có dữ liệu
      if (count[0].count > 0) {
        console.log('Mẫu dữ liệu (5 bản ghi đầu tiên):');
        const [rows] = await connection.query(`
          SELECT * FROM ${tableName} LIMIT 5
        `);
        console.log(rows);
      }
    }

    // Test truy vấn User
    console.log('\n====== KIỂM TRA BẢNG USER ======');
    try {
      const [users] = await connection.query('SELECT * FROM User LIMIT 5');
      console.log('Thông tin Users:', users);
    } catch (error) {
      console.error('Lỗi khi truy vấn User:', error.message);
    }
    
    // Đóng kết nối
    await connection.end();
    console.log('\n====== HOÀN THÀNH KIỂM TRA ======');
    
  } catch (error) {
    console.error('❌ Lỗi kết nối MySQL:', error);
    process.exit(1);
  }
}

// Chạy hàm kiểm tra
testMySQLConnection();
