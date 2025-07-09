import { pool } from '../config/database.js';

/**
 * Tạo bảng user_memberships nếu chưa tồn tại
 */
export const ensureMembershipTables = async () => {
  try {
    // Tạo bảng user_memberships
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_memberships (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        package_id INT NOT NULL,
        start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_date DATETIME,
        status ENUM('active', 'expired', 'cancelled', 'pending') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES package(id)
      )
    `);
    
    // Tạo bảng payment_transactions
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        package_id INT NOT NULL,
        amount INT NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        transaction_id VARCHAR(100),
        status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES package(id)
      )
    `);
    
    console.log('✅ Membership tables created or already exist');
  } catch (error) {
    console.error('❌ Error creating membership tables:', error);
    throw error;
  }
};

/**
 * Lấy thông tin gói hiện tại của người dùng
 */
export const getCurrentMembership = async (userId) => {
  try {
    const [memberships] = await pool.execute(`
      SELECT um.*, p.name as package_name, p.price, p.period
      FROM user_memberships um
      JOIN package p ON um.package_id = p.id
      WHERE um.user_id = ? AND um.status = 'active'
      ORDER BY um.created_at DESC
      LIMIT 1
    `, [userId]);
    
    return memberships.length > 0 ? memberships[0] : null;
  } catch (error) {
    console.error(`❌ Error getting current membership for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Mua hoặc nâng cấp gói
 */
export const purchasePackage = async (userId, packageId, paymentMethod) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Lấy thông tin gói
    const [packages] = await connection.execute(`
      SELECT * FROM package WHERE id = ?
    `, [packageId]);
    
    if (packages.length === 0) {
      throw new Error(`Package with ID ${packageId} not found`);
    }
    
    const packageData = packages[0];
    
    // Tính ngày kết thúc dựa vào thời hạn của gói
    let endDate = null;
    if (packageData.period === 'tháng') {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      endDate = date.toISOString().slice(0, 19).replace('T', ' ');
    } else if (packageData.period === 'năm') {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      endDate = date.toISOString().slice(0, 19).replace('T', ' ');
    }
    
    // Cập nhật trạng thái gói cũ thành 'cancelled'
    await connection.execute(`
      UPDATE user_memberships
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND status = 'active'
    `, [userId]);
    
    // Thêm gói mới
    const [membershipResult] = await connection.execute(`
      INSERT INTO user_memberships (user_id, package_id, start_date, end_date, status)
      VALUES (?, ?, CURRENT_TIMESTAMP, ?, 'active')
    `, [userId, packageId, endDate]);
    
    // Tạo giao dịch thanh toán
    const [paymentResult] = await connection.execute(`
      INSERT INTO payment_transactions (user_id, package_id, amount, payment_method, status)
      VALUES (?, ?, ?, ?, 'completed')
    `, [userId, packageId, packageData.price, paymentMethod]);
    
    // Cập nhật user.membership_id và membership
    try {
      // Lấy tên gói từ packageData để đặt giá trị membership chính xác
      let membershipValue = 'free';
      
      if (packageData.name) {
        const packageName = packageData.name.toLowerCase();
        if (packageName.includes('pro')) {
          membershipValue = 'pro';
        } else if (packageName.includes('premium')) {
          membershipValue = 'premium';
        } else if (packageId !== 1) { // Nếu không phải gói free (id=1) và không xác định được tên
          membershipValue = 'premium'; // Mặc định là premium cho các gói trả phí
        }
      } else {
        // Fallback nếu không có tên gói
        membershipValue = packageId === 1 ? 'free' : 'premium';
      }
      
      console.log(`🔄 Đang cập nhật user ${userId} membership thành "${membershipValue}" (gói "${packageData.name}") và membership_id thành ${packageId}`);
      
      // Kiểm tra xem cột membership có phải là ENUM không
      try {
        const [userColumns] = await connection.execute('DESCRIBE users');
        const membershipColumn = userColumns.find(col => col.Field === 'membership');
        
        if (membershipColumn && membershipColumn.Type.toLowerCase().includes('enum')) {
          const enumValues = membershipColumn.Type.match(/'([^']*)'/g).map(v => v.replace(/'/g, ''));
          console.log('Các giá trị hợp lệ cho cột membership:', enumValues);
          
          // Nếu giá trị không nằm trong danh sách ENUM, chuyển về giá trị mặc định
          if (!enumValues.includes(membershipValue)) {
            console.log(`⚠️ Giá trị "${membershipValue}" không có trong ENUM, chuyển về "premium"`);
            membershipValue = 'premium';
            
            // Nếu premium cũng không có trong ENUM
            if (!enumValues.includes('premium') && enumValues.length > 0) {
              console.log(`⚠️ "premium" cũng không có trong ENUM, sử dụng giá trị đầu tiên: "${enumValues[0]}"`);
              membershipValue = enumValues[0] !== 'free' ? enumValues[0] : (enumValues.length > 1 ? enumValues[1] : 'free');
            }
          }
        }
      } catch (enumCheckError) {
        console.log('⚠️ Không thể kiểm tra các giá trị ENUM:', enumCheckError.message);
      }
      
      // Thử cập nhật từng cột riêng để tăng khả năng thành công
      try {
        await connection.execute(`UPDATE users SET membership = ? WHERE id = ?`, [membershipValue, userId]);
        console.log(`✅ Đã cập nhật thành công cột membership thành "${membershipValue}"`);
      } catch (membershipError) {
        console.error('❌ Lỗi cập nhật cột membership:', membershipError);
      }
      
      try {
        await connection.execute(`UPDATE users SET membership_id = ? WHERE id = ?`, [packageId, userId]);
        console.log(`✅ Đã cập nhật thành công cột membership_id thành "${packageId}"`);
      } catch (membershipIdError) {
        console.error('❌ Lỗi cập nhật cột membership_id:', membershipIdError);
      }
      
      try {
        await connection.execute(`UPDATE users SET membership_updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [userId]);
      } catch (timestampError) {
        console.error('❌ Lỗi cập nhật cột membership_updated_at:', timestampError);
      }
      
      // Kiểm tra kết quả cập nhật
      const [updatedUser] = await connection.execute('SELECT id, membership, membership_id FROM users WHERE id = ?', [userId]);
      console.log('✅ Thông tin user sau khi cập nhật:', updatedUser[0]);
      
    } catch (updateError) {
      console.error('❌ Lỗi tổng thể khi cập nhật user membership:', updateError);
      // Không ném lỗi để tiếp tục xử lý
    }
    
    await connection.commit();
    
    return {
      membershipId: membershipResult.insertId,
      paymentId: paymentResult.insertId,
      packageId: packageId,
      packageName: packageData.name,
      startDate: new Date(),
      endDate: endDate ? new Date(endDate) : null,
      status: 'active',
      price: packageData.price,
      paymentMethod
    };
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error purchasing package:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Lấy lịch sử mua gói của người dùng
 */
export const getMembershipHistory = async (userId) => {
  try {
    const [history] = await pool.execute(`
      SELECT um.*, p.name as package_name, p.price, p.period, 
             pt.payment_method, pt.status as payment_status, pt.created_at as payment_date
      FROM user_memberships um
      JOIN package p ON um.package_id = p.id
      LEFT JOIN payment_transactions pt ON pt.user_id = um.user_id AND pt.package_id = um.package_id
      WHERE um.user_id = ?
      ORDER BY um.created_at DESC
    `, [userId]);
    
    return history;
  } catch (error) {
    console.error(`❌ Error getting membership history for user ${userId}:`, error);
    throw error;
  }
};

export default {
  ensureMembershipTables,
  getCurrentMembership,
  purchasePackage,
  getMembershipHistory
};
