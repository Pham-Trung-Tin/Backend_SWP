/**
 * Script để kiểm tra và cập nhật cột membership trong bảng users
 */
import { pool } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAndFixUsersMembership() {
  let connection;
  try {
    console.log('🔍 Kiểm tra cấu trúc bảng users và cột membership...');

    connection = await pool.getConnection();
    
    // Kiểm tra cấu trúc cột membership
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('✅ Cấu trúc bảng users:');
    
    // Lọc ra cột membership để kiểm tra
    const membershipColumn = columns.find(col => col.Field === 'membership');
    console.log('Column "membership":', membershipColumn || 'Không tìm thấy');
    
    // Kiểm tra các cột liên quan đến membership
    const membershipIdColumn = columns.find(col => col.Field === 'membership_id');
    console.log('Column "membership_id":', membershipIdColumn || 'Không tìm thấy');
    
    // Kiểm tra dữ liệu hiện tại
    const [users] = await connection.execute('SELECT id, email, full_name, membership FROM users LIMIT 5');
    console.log('Dữ liệu users hiện tại:');
    console.table(users);
    
    // Kiểm tra dữ liệu trong bảng user_memberships
    const [memberships] = await connection.execute(`
      SELECT um.user_id, um.package_id, p.name as package_name, um.status 
      FROM user_memberships um 
      JOIN package p ON um.package_id = p.id 
      WHERE um.status = 'active' 
      LIMIT 5
    `);
    console.log('Dữ liệu user_memberships hiện tại:');
    console.table(memberships);
    
    console.log('\n🔧 Thử cập nhật membership cho một user...');
    // Lấy một user để test
    const [testUser] = await connection.execute('SELECT id FROM users LIMIT 1');
    if (testUser.length > 0) {
      const userId = testUser[0].id;
      
      try {
        // Thử cập nhật trực tiếp
        await connection.execute(`
          UPDATE users SET membership = 'premium' WHERE id = ?
        `, [userId]);
        console.log(`✅ Cập nhật trực tiếp thành công cho user ${userId}`);
        
        // Kiểm tra sau khi cập nhật
        const [updatedUser] = await connection.execute('SELECT id, email, full_name, membership FROM users WHERE id = ?', [userId]);
        console.log('User sau khi cập nhật:');
        console.table(updatedUser);
        
        // Khôi phục giá trị
        await connection.execute(`
          UPDATE users SET membership = 'free' WHERE id = ?
        `, [userId]);
        console.log('✅ Đã khôi phục giá trị ban đầu');
      } catch (updateError) {
        console.error('❌ Lỗi khi cập nhật trực tiếp:', updateError.message);
        console.log('Kiểm tra xem cột membership có thể là ENUM với các giá trị hạn chế...');
        
        // Kiểm tra các giá trị ENUM nếu có
        if (membershipColumn && membershipColumn.Type.startsWith('enum')) {
          console.log('Cột membership là ENUM với các giá trị:', membershipColumn.Type);
        }
      }
      
      // Kiểm tra cách cập nhật của hàm purchasePackage
      console.log('\n🔧 Mô phỏng cập nhật như trong hàm purchasePackage...');
      try {
        const packageId = 2; // giả sử gói premium có id = 2
        const membershipValue = 'premium';
        
        await connection.execute(`
          UPDATE users 
          SET membership_id = ?, membership_updated_at = CURRENT_TIMESTAMP,
              membership = ?
          WHERE id = ?
        `, [packageId, membershipValue, userId]);
        
        console.log(`✅ Mô phỏng cập nhật thành công cho user ${userId}`);
        
        // Kiểm tra sau khi cập nhật
        const [updatedUser] = await connection.execute('SELECT id, email, full_name, membership, membership_id FROM users WHERE id = ?', [userId]);
        console.log('User sau khi mô phỏng:');
        console.table(updatedUser);
        
        // Khôi phục giá trị
        await connection.execute(`
          UPDATE users SET membership = 'free', membership_id = 1 WHERE id = ?
        `, [userId]);
      } catch (mockError) {
        console.error('❌ Lỗi khi mô phỏng cập nhật:', mockError.message);
        
        // Thử cập nhật từng cột riêng biệt để tìm ra vấn đề
        console.log('\nThử cập nhật từng cột một...');
        
        try {
          await connection.execute('UPDATE users SET membership = ? WHERE id = ?', ['premium', userId]);
          console.log('✅ Cập nhật cột membership thành công');
        } catch (err) {
          console.error('❌ Lỗi cập nhật cột membership:', err.message);
        }
        
        try {
          await connection.execute('UPDATE users SET membership_id = ? WHERE id = ?', [2, userId]);
          console.log('✅ Cập nhật cột membership_id thành công');
        } catch (err) {
          console.error('❌ Lỗi cập nhật cột membership_id:', err.message);
        }
      }
    }

  } catch (error) {
    console.error('❌ Lỗi kiểm tra:', error);
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

checkAndFixUsersMembership();
