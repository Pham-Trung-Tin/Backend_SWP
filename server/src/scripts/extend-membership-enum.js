/**
 * Script để mở rộng cột membership trong bảng users để hỗ trợ giá trị 'pro'
 */
import { pool } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function extendMembershipEnumValues() {
  let connection;
  try {
    console.log('🔍 Kiểm tra và mở rộng cột membership...');

    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Kiểm tra cấu trúc hiện tại của cột membership
    const [columns] = await connection.execute('DESCRIBE users');
    const membershipColumn = columns.find(col => col.Field === 'membership');
    
    if (!membershipColumn) {
      console.log('❌ Không tìm thấy cột membership trong bảng users');
      console.log('Thêm cột membership với hỗ trợ giá trị pro...');
      
      try {
        await connection.execute(`
          ALTER TABLE users 
          ADD COLUMN membership ENUM('free', 'premium', 'pro') DEFAULT 'free'
        `);
        console.log('✅ Đã thêm cột membership với các giá trị: free, premium, pro');
      } catch (error) {
        console.error('❌ Lỗi khi thêm cột membership:', error.message);
      }
    } else if (membershipColumn.Type.toLowerCase().includes('enum')) {
      console.log('Cột membership hiện tại:', membershipColumn);
      
      // Kiểm tra xem 'pro' đã có trong ENUM chưa
      const enumValues = membershipColumn.Type.match(/'([^']*)'/g).map(v => v.replace(/'/g, ''));
      console.log('Các giá trị ENUM hiện tại:', enumValues);
      
      if (!enumValues.includes('pro')) {
        console.log('🔧 Mở rộng ENUM để bao gồm giá trị "pro"...');
        
        try {
          await connection.execute(`
            ALTER TABLE users 
            MODIFY COLUMN membership ENUM('free', 'premium', 'pro') DEFAULT 'free'
          `);
          console.log('✅ Đã cập nhật cột membership để hỗ trợ giá trị "pro"');
          
          // Cập nhật các bản ghi có gói pro nhưng đang được đặt là premium
          // Lấy danh sách gói Pro
          const [proPackages] = await connection.execute(`
            SELECT id FROM package WHERE name LIKE '%pro%' OR name LIKE '%Pro%'
          `);
          
          if (proPackages.length > 0) {
            const proPackageIds = proPackages.map(pkg => pkg.id);
            console.log('Các gói Pro:', proPackageIds);
            
            // Tìm người dùng có membership_id là các gói Pro nhưng membership không phải là 'pro'
            const [usersToUpdate] = await connection.execute(`
              SELECT id, membership, membership_id FROM users 
              WHERE membership_id IN (${proPackageIds.join(',')}) AND membership != 'pro'
            `);
            
            console.log(`Tìm thấy ${usersToUpdate.length} người dùng cần cập nhật từ premium thành pro`);
            
            for (const user of usersToUpdate) {
              console.log(`Cập nhật user ${user.id}: ${user.membership} -> pro`);
              await connection.execute(`
                UPDATE users SET membership = 'pro' WHERE id = ?
              `, [user.id]);
            }
          }
        } catch (error) {
          console.error('❌ Lỗi khi cập nhật cột membership:', error.message);
          throw error;
        }
      } else {
        console.log('✅ Cột membership đã hỗ trợ giá trị "pro"');
      }
    }
    
    await connection.commit();
    
    // Kiểm tra lại cấu trúc sau khi sửa
    const [updatedColumns] = await connection.execute('DESCRIBE users');
    const updatedMembershipColumn = updatedColumns.find(col => col.Field === 'membership');
    console.log('\n✅ Cấu trúc cột membership sau khi sửa:', updatedMembershipColumn);
    
    // Kiểm tra các gói trong bảng package
    const [packages] = await connection.execute('SELECT id, name FROM package');
    console.log('\n📋 Các gói trong bảng package:');
    console.table(packages);
    
    console.log('\n📋 Gợi ý tên membership cho mỗi gói:');
    for (const pkg of packages) {
      let suggestedType = 'free';
      
      if (pkg.name) {
        const packageName = pkg.name.toLowerCase();
        if (packageName.includes('pro')) {
          suggestedType = 'pro';
        } else if (packageName.includes('premium')) {
          suggestedType = 'premium';
        } else if (pkg.id !== 1) {
          suggestedType = 'premium';
        }
      }
      
      console.log(`- Gói ${pkg.id} (${pkg.name}): ${suggestedType}`);
    }
    
  } catch (error) {
    console.error('❌ Lỗi tổng thể:', error);
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

extendMembershipEnumValues();
