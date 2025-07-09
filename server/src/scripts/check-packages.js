/**
 * Script để kiểm tra thông tin các gói (packages) trong cơ sở dữ liệu
 */
import { pool } from '../config/database.js';

async function checkPackages() {
  try {
    console.log('🔍 Kiểm tra thông tin các gói trong database...');

    // Lấy thông tin tất cả các gói
    const [packages] = await pool.execute('SELECT * FROM package');
    console.log('📋 Danh sách các gói:');
    console.table(packages);
    
    // Kiểm tra cấu trúc bảng package
    const [columns] = await pool.execute('DESCRIBE package');
    console.log('\n📋 Cấu trúc bảng package:');
    console.table(columns);

    // Kiểm tra gói membership hiện tại của các user
    const [userMemberships] = await pool.execute(`
      SELECT u.id, u.email, u.full_name, u.membership, u.membership_id, p.name as package_name, p.id as package_id 
      FROM users u
      LEFT JOIN package p ON u.membership_id = p.id
      LIMIT 10
    `);
    console.log('\n📋 User membership hiện tại:');
    console.table(userMemberships);

    // Kiểm tra ENUM trong cột membership
    try {
      const [userColumns] = await pool.execute('DESCRIBE users');
      const membershipColumn = userColumns.find(col => col.Field === 'membership');
      if (membershipColumn) {
        console.log('\n📋 Định nghĩa cột membership trong bảng users:');
        console.log(membershipColumn);
        
        if (membershipColumn.Type.toLowerCase().includes('enum')) {
          const enumValues = membershipColumn.Type.match(/'([^']*)'/g).map(v => v.replace(/'/g, ''));
          console.log('Các giá trị ENUM cho cột membership:', enumValues);
          
          // Kiểm tra xem có bao gồm 'pro' không
          if (!enumValues.includes('pro')) {
            console.log('⚠️ Cột membership không có giá trị ENUM "pro"!');
            console.log('Cần sửa cấu trúc cột này để thêm giá trị "pro".');
          }
        }
      }
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra cấu trúc cột membership:', error);
    }

  } catch (error) {
    console.error('❌ Lỗi kiểm tra packages:', error);
  } finally {
    await pool.end();
  }
}

checkPackages();
