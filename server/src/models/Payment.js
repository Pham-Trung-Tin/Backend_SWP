import { pool } from '../config/database.js';

/**
 * Tạo bảng payments nếu chưa tồn tại
 */
export const ensurePaymentsTable = async () => {
  try {
    // Tạo bảng payments
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        package_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        payment_details JSON,
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES package(id)
      )
    `);
    
    console.log('✅ Payments table created or already exists');
  } catch (error) {
    console.error('❌ Error creating payments table:', error);
    throw error;
  }
};

/**
 * Thêm một bản ghi thanh toán mới
 * @param {Object} paymentData - Dữ liệu thanh toán cần thêm
 * @returns {Object} - Bản ghi thanh toán đã được thêm
 */
export const createPayment = async (paymentData) => {
  try {
    const { 
      userId, 
      packageId, 
      amount, 
      paymentMethod, 
      paymentStatus = 'pending', 
      paymentDetails = null, 
      transactionId = null 
    } = paymentData;
    
    // Validate required fields
    if (!userId || !packageId || !amount || !paymentMethod) {
      throw new Error('Missing required payment fields');
    }
    
    // Convert payment details to JSON if it's an object
    let details = paymentDetails;
    if (details && typeof details === 'object') {
      details = JSON.stringify(details);
    }
    
    const [result] = await pool.execute(
      `INSERT INTO payments 
        (user_id, package_id, amount, payment_method, payment_status, payment_details, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, packageId, amount, paymentMethod, paymentStatus, details, transactionId]
    );
    
    // Get the newly created payment
    const [rows] = await pool.execute(
      `SELECT * FROM payments WHERE id = ?`,
      [result.insertId]
    );
    
    // Parse payment_details if it's a JSON string
    if (rows[0].payment_details && typeof rows[0].payment_details === 'string') {
      try {
        rows[0].payment_details = JSON.parse(rows[0].payment_details);
      } catch (e) {
        // Ignore parse errors, keep as string
      }
    }
    
    return rows[0];
  } catch (error) {
    console.error('❌ Error creating payment record:', error);
    throw error;
  }
};

/**
 * Lấy danh sách thanh toán của một người dùng
 * @param {number} userId - ID của người dùng
 * @returns {Array} - Danh sách các thanh toán
 */
export const getUserPayments = async (userId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, pkg.name as package_name 
       FROM payments p
       JOIN package pkg ON p.package_id = pkg.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );
    
    // Parse payment_details JSON for each row
    return rows.map(row => {
      if (row.payment_details && typeof row.payment_details === 'string') {
        try {
          row.payment_details = JSON.parse(row.payment_details);
        } catch (e) {
          // Ignore parse errors, keep as string
        }
      }
      return row;
    });
  } catch (error) {
    console.error('❌ Error getting user payments:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái thanh toán
 * @param {number} paymentId - ID của thanh toán cần cập nhật
 * @param {string} newStatus - Trạng thái mới ('pending', 'completed', 'failed', 'refunded')
 * @param {string|null} transactionId - ID giao dịch (optional)
 * @returns {Object} - Bản ghi thanh toán đã cập nhật
 */
export const updatePaymentStatus = async (paymentId, newStatus, transactionId = null) => {
  try {
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid payment status: ${newStatus}`);
    }
    
    let query = `UPDATE payments SET payment_status = ?`;
    const params = [newStatus];
    
    if (transactionId) {
      query += `, transaction_id = ?`;
      params.push(transactionId);
    }
    
    query += ` WHERE id = ?`;
    params.push(paymentId);
    
    await pool.execute(query, params);
    
    // Get the updated payment
    const [rows] = await pool.execute(
      `SELECT * FROM payments WHERE id = ?`,
      [paymentId]
    );
    
    // Parse payment_details if it's a JSON string
    if (rows[0] && rows[0].payment_details && typeof rows[0].payment_details === 'string') {
      try {
        rows[0].payment_details = JSON.parse(rows[0].payment_details);
      } catch (e) {
        // Ignore parse errors, keep as string
      }
    }
    
    return rows[0] || null;
  } catch (error) {
    console.error(`❌ Error updating payment status:`, error);
    throw error;
  }
};

/**
 * Tìm thanh toán theo transaction_id
 * @param {string} transactionId - ID giao dịch cần tìm
 * @returns {Object|null} - Bản ghi thanh toán hoặc null nếu không tìm thấy
 */
export const findPaymentByTransactionId = async (transactionId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM payments WHERE transaction_id = ?`,
      [transactionId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    // Parse payment_details if it's a JSON string
    if (rows[0].payment_details && typeof rows[0].payment_details === 'string') {
      try {
        rows[0].payment_details = JSON.parse(rows[0].payment_details);
      } catch (e) {
        // Ignore parse errors, keep as string
      }
    }
    
    return rows[0];
  } catch (error) {
    console.error(`❌ Error finding payment by transaction ID:`, error);
    throw error;
  }
};

/**
 * Cập nhật chi tiết thanh toán
 * @param {number} paymentId - ID của thanh toán
 * @param {Object} details - Chi tiết thanh toán mới
 * @returns {Object} - Bản ghi thanh toán đã cập nhật
 */
export const updatePaymentDetails = async (paymentId, details) => {
  try {
    // Chuyển đổi details thành chuỗi JSON nếu là object
    let detailsJson = details;
    if (details && typeof details === 'object') {
      detailsJson = JSON.stringify(details);
    }
    
    await pool.execute(
      `UPDATE payments SET payment_details = ? WHERE id = ?`,
      [detailsJson, paymentId]
    );
    
    // Lấy bản ghi đã cập nhật
    const [rows] = await pool.execute(
      `SELECT * FROM payments WHERE id = ?`,
      [paymentId]
    );
    
    // Parse payment_details if it's a JSON string
    if (rows[0] && rows[0].payment_details && typeof rows[0].payment_details === 'string') {
      try {
        rows[0].payment_details = JSON.parse(rows[0].payment_details);
      } catch (e) {
        // Ignore parse errors, keep as string
      }
    }
    
    return rows[0] || null;
  } catch (error) {
    console.error(`❌ Error updating payment details:`, error);
    throw error;
  }
};

/**
 * Lấy lịch sử thanh toán của người dùng với phân trang và lọc
 * @param {number} userId - ID của người dùng
 * @param {Object} options - Các tùy chọn lọc và phân trang
 * @returns {Array} - Danh sách các thanh toán đã lọc
 */
export const getUserPaymentHistory = async (userId, options = {}) => {
  try {
    const {
      status,
      startDate,
      endDate,
      limit = 10,
      offset = 0
    } = options;
    
    console.log('Debug - getUserPaymentHistory params:', { userId, status, startDate, endDate, limit, offset });
    
    let query = `
      SELECT p.*, pkg.name as package_name 
      FROM payments p
      JOIN package pkg ON p.package_id = pkg.id
      WHERE p.user_id = ?
    `;
    
    const queryParams = [userId];
    
    // Thêm điều kiện lọc nếu có
    if (status) {
      query += ` AND p.payment_status = ?`;
      queryParams.push(status);
    }
    
    // Điều kiện ngày: sử dụng trực tiếp trong câu lệnh SQL thay vì tham số
    if (startDate) {
      if (typeof startDate === 'string' && startDate.trim() !== '') {
        // Format ngày đúng định dạng MySQL YYYY-MM-DD
        const formattedDate = startDate.trim().substring(0, 10);
        query += ` AND DATE(p.created_at) >= DATE('${formattedDate}')`;
      }
    }
    
    if (endDate) {
      if (typeof endDate === 'string' && endDate.trim() !== '') {
        // Format ngày đúng định dạng MySQL YYYY-MM-DD
        const formattedDate = endDate.trim().substring(0, 10);
        query += ` AND DATE(p.created_at) <= DATE('${formattedDate}')`;
      }
    }
    
    // Thêm order by và limit
    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    const [rows] = await pool.execute(query, queryParams);
    
    // Parse payment_details JSON for each row
    return rows.map(row => {
      if (row.payment_details && typeof row.payment_details === 'string') {
        try {
          row.payment_details = JSON.parse(row.payment_details);
        } catch (e) {
          // Ignore parse errors, keep as string
        }
      }
      return row;
    });
  } catch (error) {
    console.error('❌ Error getting user payment history:', error);
    throw error;
  }
};

/**
 * Đếm số lượng thanh toán của người dùng (dùng cho phân trang)
 * @param {number} userId - ID của người dùng
 * @param {Object} options - Các tùy chọn lọc
 * @returns {number} - Tổng số thanh toán
 */
export const countUserPayments = async (userId, options = {}) => {
  try {
    const { status, startDate, endDate } = options;
    
    console.log('Debug - countUserPayments params:', { userId, status, startDate, endDate });
    
    let query = `
      SELECT COUNT(*) AS total
      FROM payments
      WHERE user_id = ?
    `;
    
    const queryParams = [userId];
    
    // Thêm điều kiện lọc nếu có
    if (status) {
      query += ` AND payment_status = ?`;
      queryParams.push(status);
    }
    
    // Điều kiện ngày: sử dụng trực tiếp trong câu lệnh SQL thay vì tham số
    if (startDate) {
      if (typeof startDate === 'string' && startDate.trim() !== '') {
        // Format ngày đúng định dạng MySQL YYYY-MM-DD
        const formattedDate = startDate.trim().substring(0, 10);
        query += ` AND DATE(created_at) >= DATE('${formattedDate}')`;
      }
    }
    
    if (endDate) {
      if (typeof endDate === 'string' && endDate.trim() !== '') {
        // Format ngày đúng định dạng MySQL YYYY-MM-DD
        const formattedDate = endDate.trim().substring(0, 10);
        query += ` AND DATE(created_at) <= DATE('${formattedDate}')`;
      }
    }
    
    const [rows] = await pool.execute(query, queryParams);
    return rows[0].total;
  } catch (error) {
    console.error('❌ Error counting user payments:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết thanh toán theo ID
 * @param {number} paymentId - ID của thanh toán
 * @returns {Object|null} - Chi tiết thanh toán hoặc null nếu không tìm thấy
 */
export const getPaymentById = async (paymentId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, pkg.name as package_name, pkg.description as package_description
       FROM payments p
       JOIN package pkg ON p.package_id = pkg.id
       WHERE p.id = ?`,
      [paymentId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    // Parse payment_details if it's a JSON string
    if (rows[0].payment_details && typeof rows[0].payment_details === 'string') {
      try {
        rows[0].payment_details = JSON.parse(rows[0].payment_details);
      } catch (e) {
        // Ignore parse errors, keep as string
      }
    }
    
    return rows[0];
  } catch (error) {
    console.error('❌ Error getting payment by ID:', error);
    throw error;
  }
};

/**
 * Hoàn tiền cho thanh toán
 * @param {number} paymentId - ID của thanh toán
 * @param {Object} refundData - Dữ liệu hoàn tiền
 * @returns {Object} - Thông tin thanh toán đã hoàn tiền
 */
export const refundPayment = async (paymentId, refundData) => {
  try {
    // Bắt đầu transaction
    await pool.execute('START TRANSACTION');
    
    // Cập nhật trạng thái thanh toán thành 'refunded'
    await pool.execute(
      `UPDATE payments SET payment_status = 'refunded' WHERE id = ?`,
      [paymentId]
    );
    
    // Thêm thông tin hoàn tiền vào payment_details
    const [rows] = await pool.execute(
      `SELECT * FROM payments WHERE id = ?`,
      [paymentId]
    );
    
    if (rows.length === 0) {
      await pool.execute('ROLLBACK');
      throw new Error(`Payment with ID ${paymentId} not found`);
    }
    
    // Parse payment_details nếu có
    let paymentDetails = {};
    if (rows[0].payment_details) {
      try {
        paymentDetails = typeof rows[0].payment_details === 'string' 
          ? JSON.parse(rows[0].payment_details) 
          : rows[0].payment_details;
      } catch (e) {
        paymentDetails = {};
      }
    }
    
    // Thêm thông tin hoàn tiền
    paymentDetails.refund = refundData;
    
    // Cập nhật payment_details
    await pool.execute(
      `UPDATE payments SET payment_details = ? WHERE id = ?`,
      [JSON.stringify(paymentDetails), paymentId]
    );
    
    // Commit transaction
    await pool.execute('COMMIT');
    
    // Lấy thông tin thanh toán đã cập nhật
    const [updatedRows] = await pool.execute(
      `SELECT p.*, pkg.name as package_name 
       FROM payments p
       JOIN package pkg ON p.package_id = pkg.id
       WHERE p.id = ?`,
      [paymentId]
    );
    
    // Parse payment_details if it's a JSON string
    if (updatedRows[0].payment_details && typeof updatedRows[0].payment_details === 'string') {
      try {
        updatedRows[0].payment_details = JSON.parse(updatedRows[0].payment_details);
      } catch (e) {
        // Ignore parse errors, keep as string
      }
    }
    
    return updatedRows[0];
  } catch (error) {
    // Rollback nếu có lỗi
    try {
      await pool.execute('ROLLBACK');
    } catch (rollbackError) {
      console.error('❌ Error during rollback:', rollbackError);
    }
    
    console.error('❌ Error refunding payment:', error);
    throw error;
  }
};

export default {
  ensurePaymentsTable,
  createPayment,
  getUserPayments,
  updatePaymentStatus,
  findPaymentByTransactionId,
  updatePaymentDetails,
  getUserPaymentHistory,
  countUserPayments,
  getPaymentById,
  refundPayment
};
