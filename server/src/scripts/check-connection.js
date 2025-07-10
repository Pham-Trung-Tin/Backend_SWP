/**
 * Script đơn giản để kiểm tra kết nối cơ sở dữ liệu và cấu trúc bảng users
 */
import { pool } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkConnection() {
  try {
    console.log('🔍 Kiểm tra kết nối database...');

    // Kiểm tra kết nối
    const [result] = await pool.execute('SELECT 1');
    console.log('✅ Kết nối database thành công!');
    
    // Kiểm tra bảng users
    console.log('\n🔍 Kiểm tra bảng users...');
    try {
      const [columns] = await pool.execute('DESCRIBE users');
      console.log('✅ Cấu trúc bảng users:');
      console.table(columns);
      
      // Kiểm tra users
      const [users] = await pool.execute('SELECT id, email, name, role FROM users LIMIT 5');
      console.log(`\n✅ Tìm thấy ${users.length} người dùng:`);
      console.table(users);
    } catch (error) {
      console.error('❌ Không thể truy vấn bảng users:', error.message);
    }
    
    // Kiểm tra JWT_SECRET
    console.log('\n🔑 JWT Secret:', 
      process.env.JWT_SECRET 
        ? `Đã thiết lập (${process.env.JWT_SECRET.substring(0, 3)}...)`
        : 'KHÔNG TÌM THẤY - sử dụng giá trị mặc định');

  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error);
  } finally {
    await pool.end();
  }
}

checkConnection();
