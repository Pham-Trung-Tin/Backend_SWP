/**
 * Script để kiểm tra và sửa định nghĩa cột membership trong bảng users
 */
import { pool } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixMembershipColumnDefinition() {
  let connection;
  try {
    console.log('🔧 Kiểm tra và sửa định nghĩa cột membership...');

    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Kiểm tra cấu trúc hiện tại của cột membership
    const [columns] = await connection.execute('DESCRIBE users');
    const membershipColumn = columns.find(col => col.Field === 'membership');
    
    if (!membershipColumn) {
      console.log('❌ Không tìm thấy cột membership trong bảng users');
      console.log('Thêm cột membership...');
      
      try {
        await connection.execute(`
          ALTER TABLE users 
          ADD COLUMN membership ENUM('free', 'premium') DEFAULT 'free'
        `);
        console.log('✅ Đã thêm cột membership');
      } catch (error) {
        console.error('❌ Lỗi khi thêm cột membership:', error.message);
      }
    } else {
      console.log('Cột membership đã tồn tại:', membershipColumn);
      
      // Nếu cột membership không phải kiểu ENUM đúng, cập nhật nó
      if (!membershipColumn.Type.includes('free') || !membershipColumn.Type.includes('premium')) {
        console.log('Cột membership không có giá trị ENUM đúng. Thử sửa...');
        
        try {
          await connection.execute(`
            ALTER TABLE users 
            MODIFY COLUMN membership ENUM('free', 'premium') DEFAULT 'free'
          `);
          console.log('✅ Đã sửa định nghĩa cột membership');
        } catch (error) {
          console.error('❌ Lỗi khi sửa cột membership:', error.message);
        }
      }
    }
    
    // Đảm bảo cột membership_id tồn tại
    const membershipIdColumn = columns.find(col => col.Field === 'membership_id');
    
    if (!membershipIdColumn) {
      console.log('❌ Không tìm thấy cột membership_id trong bảng users');
      console.log('Thêm cột membership_id...');
      
      try {
        await connection.execute(`
          ALTER TABLE users 
          ADD COLUMN membership_id INT DEFAULT 1
        `);
        console.log('✅ Đã thêm cột membership_id');
      } catch (error) {
        console.error('❌ Lỗi khi thêm cột membership_id:', error.message);
      }
    }
    
    // Đảm bảo cột membership_updated_at tồn tại
    const membershipUpdatedAtColumn = columns.find(col => col.Field === 'membership_updated_at');
    
    if (!membershipUpdatedAtColumn) {
      console.log('❌ Không tìm thấy cột membership_updated_at trong bảng users');
      console.log('Thêm cột membership_updated_at...');
      
      try {
        await connection.execute(`
          ALTER TABLE users 
          ADD COLUMN membership_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);
        console.log('✅ Đã thêm cột membership_updated_at');
      } catch (error) {
        console.error('❌ Lỗi khi thêm cột membership_updated_at:', error.message);
      }
    }
    
    // Kiểm tra lại cấu trúc sau khi sửa
    const [updatedColumns] = await connection.execute('DESCRIBE users');
    console.log('\n✅ Cấu trúc bảng users sau khi sửa:');
    const membershipColumns = updatedColumns.filter(col => 
      col.Field === 'membership' || col.Field === 'membership_id' || col.Field === 'membership_updated_at'
    );
    console.table(membershipColumns);
    
    await connection.commit();
    
    // Kiểm tra các giá trị membership hiện tại
    const [userMemberships] = await connection.execute(`
      SELECT id, email, full_name, membership, membership_id 
      FROM users 
      LIMIT 5
    `);
    
    console.log('\nGiá trị membership hiện tại:');
    console.table(userMemberships);
    
    // Cập nhật các giá trị membership không hợp lệ
    try {
      await connection.execute(`
        UPDATE users 
        SET membership = 'free' 
        WHERE membership IS NULL OR membership NOT IN ('free', 'premium')
      `);
      console.log('✅ Đã cập nhật các giá trị membership không hợp lệ thành "free"');
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật giá trị membership:', error.message);
    }
    
    // Đồng bộ giá trị membership với membership_id
    try {
      await connection.execute(`
        UPDATE users 
        SET membership = 'premium' 
        WHERE membership_id = 2 AND membership = 'free'
      `);
      await connection.execute(`
        UPDATE users 
        SET membership = 'free' 
        WHERE membership_id = 1 AND membership = 'premium'
      `);
      console.log('✅ Đã đồng bộ giá trị membership với membership_id');
    } catch (error) {
      console.error('❌ Lỗi khi đồng bộ giá trị:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Lỗi chung:', error);
    if (connection) {
      await connection.rollback();
    }
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

fixMembershipColumnDefinition();
