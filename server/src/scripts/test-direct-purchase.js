/**
 * Script để test trực tiếp API mua gói Premium và kiểm tra kết quả
 */
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

// Thay đổi các giá trị này để test
const TEST_USER_ID = 1;  // ID của user cần test
const TEST_SECRET = process.env.JWT_SECRET || 'your-default-secret';

const generateTestToken = () => {
  return jwt.sign(
    { id: TEST_USER_ID },
    TEST_SECRET,
    { expiresIn: '1h' }
  );
};

const testDirectPurchase = async () => {
  try {
    console.log(`🧪 Test mua gói Premium cho người dùng ID=${TEST_USER_ID}`);
    const token = generateTestToken();

    console.log('📋 BƯỚC 1: Kiểm tra thông tin người dùng trước khi mua');
    let connection = await pool.getConnection();
    try {
      const [user] = await connection.execute(
        'SELECT id, email, full_name, membership, membership_id FROM users WHERE id = ?',
        [TEST_USER_ID]
      );
      console.log('Thông tin người dùng trước khi mua:');
      console.table(user);
    } finally {
      connection.release();
    }

    console.log('\n📋 BƯỚC 2: Gọi API mua gói Premium');
    // Dữ liệu cho việc mua gói
    const purchaseData = {
      packageId: 2, // ID gói Premium
      paymentMethod: 'momo'
    };

    // Gọi API mua gói
    const response = await fetch('http://localhost:3001/api/packages/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(purchaseData)
    });

    const result = await response.json();
    console.log('Kết quả API mua gói:');
    console.log(JSON.stringify(result, null, 2));

    if (!result.success) {
      console.error('❌ Lỗi mua gói:', result.message);
      return;
    }

    console.log('\n📋 BƯỚC 3: Kiểm tra thông tin người dùng SAU khi mua');
    connection = await pool.getConnection();
    try {
      const [user] = await connection.execute(
        'SELECT id, email, full_name, membership, membership_id FROM users WHERE id = ?',
        [TEST_USER_ID]
      );
      console.log('Thông tin người dùng sau khi mua:');
      console.table(user);

      console.log('\n📋 BƯỚC 4: Kiểm tra thông tin gói hiện tại trong user_memberships');
      const [memberships] = await connection.execute(`
        SELECT um.id, um.user_id, um.package_id, p.name as package_name, um.status, um.start_date, um.end_date
        FROM user_memberships um
        JOIN package p ON um.package_id = p.id
        WHERE um.user_id = ? AND um.status = 'active'
      `, [TEST_USER_ID]);

      console.log('Thông tin gói thành viên hiện tại:');
      console.table(memberships);

      if (memberships.length > 0 && user.length > 0) {
        const membershipPackageId = memberships[0].package_id;
        const userMembershipId = user[0].membership_id;
        const userMembership = user[0].membership;

        console.log('\n🔄 So sánh kết quả:');
        console.log(`- ID gói trong user_memberships: ${membershipPackageId}`);
        console.log(`- ID gói trong users.membership_id: ${userMembershipId}`);
        console.log(`- Trạng thái membership trong users: "${userMembership}"`);

        if (membershipPackageId === userMembershipId && userMembership === 'premium') {
          console.log('✅ Dữ liệu đồng bộ và chính xác!');
        } else {
          console.log('❌ Dữ liệu không đồng bộ:');
          
          if (membershipPackageId !== userMembershipId) {
            console.log('  - ID gói không khớp giữa hai bảng');
          }
          
          if (userMembership !== 'premium') {
            console.log('  - Trạng thái membership không được cập nhật thành "premium"');
          }
        }
      }

      // Cập nhật thủ công nếu cần thiết
      if (user.length > 0 && user[0].membership !== 'premium') {
        console.log('\n🔧 Cập nhật thủ công trạng thái membership:');
        try {
          await connection.execute(
            'UPDATE users SET membership = "premium" WHERE id = ?',
            [TEST_USER_ID]
          );
          console.log('✅ Đã cập nhật thủ công thành "premium"');
          
          // Kiểm tra lại
          const [updatedUser] = await connection.execute(
            'SELECT id, membership FROM users WHERE id = ?',
            [TEST_USER_ID]
          );
          console.log('Sau khi cập nhật thủ công:', updatedUser[0]);
        } catch (updateError) {
          console.error('❌ Lỗi cập nhật thủ công:', updateError.message);
        }
      }
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ Lỗi test:', error);
  } finally {
    await pool.end();
  }
};

testDirectPurchase();
