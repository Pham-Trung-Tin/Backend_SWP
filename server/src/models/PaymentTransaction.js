import { pool } from '../config/database.js';

/**
 * Tạo bảng payment_transactions nếu chưa tồn tại
 */
export const ensurePaymentTransactionsTable = async () => {
  try {
    // Tạo bảng payment_transactions
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        package_id INT NOT NULL,
        amount INT NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        transaction_id VARCHAR(100) NOT NULL,
        status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        payment_details JSON,
        callback_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES package(id)
      )
    `);
    
    console.log('✅ Payment_transactions table created or already exists');
  } catch (error) {
    console.error('❌ Error creating payment_transactions table:', error);
    throw error;
  }
};

/**
 * Thêm một bản ghi giao dịch thanh toán mới
 * @param {Object} transactionData - Dữ liệu giao dịch thanh toán
 * @returns {Object} - Bản ghi giao dịch thanh toán đã được thêm
 */
export const createPaymentTransaction = async (transactionData) => {
  try {
    const { 
      userId, 
      packageId, 
      amount, 
      paymentMethod, 
      transactionId,
      status = 'pending', 
      paymentDetails = null, 
      callbackData = null 
    } = transactionData;
    
    // Validate required fields
    if (!userId || !packageId || !amount || !paymentMethod || !transactionId) {
      throw new Error('Missing required transaction fields');
    }
    
    // Convert details to JSON if they're objects
    let details = paymentDetails;
    if (details && typeof details === 'object') {
      details = JSON.stringify(details);
    }
    
    let callback = callbackData;
    if (callback && typeof callback === 'object') {
      callback = JSON.stringify(callback);
    }
    
    const [result] = await pool.execute(
      `INSERT INTO payment_transactions 
        (user_id, package_id, amount, payment_method, transaction_id, status, payment_details, callback_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, packageId, amount, paymentMethod, transactionId, status, details, callback]
    );
    
    // Get the newly created transaction
    const [rows] = await pool.execute(
      `SELECT * FROM payment_transactions WHERE id = ?`,
      [result.insertId]
    );
    
    // Parse JSON fields
    const transaction = rows[0];
    
    ['payment_details', 'callback_data'].forEach(field => {
      if (transaction[field] && typeof transaction[field] === 'string') {
        try {
          transaction[field] = JSON.parse(transaction[field]);
        } catch (e) {
          // Ignore parse errors, keep as string
        }
      }
    });
    
    return transaction;
  } catch (error) {
    console.error('❌ Error creating payment transaction record:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái giao dịch thanh toán
 * @param {string} transactionId - ID giao dịch cần cập nhật
 * @param {string} status - Trạng thái mới ('pending', 'completed', 'failed', 'refunded')
 * @param {Object} callbackData - Dữ liệu callback từ cổng thanh toán (optional)
 * @returns {Object} - Bản ghi giao dịch thanh toán đã cập nhật
 */
export const updateTransactionStatus = async (transactionId, status, callbackData = null) => {
  try {
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid transaction status: ${status}`);
    }
    
    let query = `UPDATE payment_transactions SET status = ?`;
    const params = [status];
    
    // Add callback data if provided
    if (callbackData) {
      let callbackJson = callbackData;
      if (typeof callbackData === 'object') {
        callbackJson = JSON.stringify(callbackData);
      }
      
      query += `, callback_data = ?`;
      params.push(callbackJson);
    }
    
    query += ` WHERE transaction_id = ?`;
    params.push(transactionId);
    
    await pool.execute(query, params);
    
    // Get the updated transaction
    const [rows] = await pool.execute(
      `SELECT * FROM payment_transactions WHERE transaction_id = ?`,
      [transactionId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    // Parse JSON fields
    const transaction = rows[0];
    
    ['payment_details', 'callback_data'].forEach(field => {
      if (transaction[field] && typeof transaction[field] === 'string') {
        try {
          transaction[field] = JSON.parse(transaction[field]);
        } catch (e) {
          // Ignore parse errors, keep as string
        }
      }
    });
    
    return transaction;
  } catch (error) {
    console.error(`❌ Error updating transaction status:`, error);
    throw error;
  }
};

/**
 * Lấy giao dịch thanh toán theo transaction_id
 * @param {string} transactionId - Transaction ID của giao dịch
 * @returns {Object|null} - Bản ghi giao dịch hoặc null nếu không tìm thấy
 */
export const getTransactionById = async (transactionId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM payment_transactions WHERE transaction_id = ?`,
      [transactionId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const transaction = rows[0];
    
    // Parse JSON fields
    ['payment_details', 'callback_data'].forEach(field => {
      if (transaction[field] && typeof transaction[field] === 'string') {
        try {
          transaction[field] = JSON.parse(transaction[field]);
        } catch (e) {
          // Ignore parse errors, keep as string
        }
      }
    });
    
    return transaction;
  } catch (error) {
    console.error('❌ Error getting transaction by ID:', error);
    throw error;
  }
};

/**
 * Lấy danh sách giao dịch thanh toán của một người dùng
 * @param {number} userId - ID của người dùng
 * @param {Object} options - Các tùy chọn lọc và phân trang
 * @returns {Array} - Danh sách các giao dịch thanh toán
 */
export const getUserTransactions = async (userId, options = {}) => {
  try {
    const {
      status,
      startDate,
      endDate,
      limit = 10,
      offset = 0
    } = options;
    
    let query = `
      SELECT t.*, pkg.name as package_name, p.id as payment_id
      FROM payment_transactions t
      LEFT JOIN payments p ON t.payment_id = p.id
      JOIN package pkg ON t.package_id = pkg.id
      WHERE t.user_id = ?
    `;
    
    const queryParams = [userId];
    
    if (status) {
      query += ` AND t.status = ?`;
      queryParams.push(status);
    }
    
    if (startDate) {
      query += ` AND t.created_at >= ?`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ` AND t.created_at <= ?`;
      queryParams.push(endDate);
    }
    
    query += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.execute(query, queryParams);
    
    // Parse JSON fields for each row
    return rows.map(row => {
      ['payment_details', 'callback_data'].forEach(field => {
        if (row[field] && typeof row[field] === 'string') {
          try {
            row[field] = JSON.parse(row[field]);
          } catch (e) {
            // Ignore parse errors, keep as string
          }
        }
      });
      return row;
    });
  } catch (error) {
    console.error('❌ Error getting user transactions:', error);
    throw error;
  }
};

/**
 * Get payment by transaction ID
 */
export const getPaymentByTransactionId = async (transactionId) => {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM payment_transactions 
      WHERE transaction_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [transactionId]);
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('❌ Error getting payment by transaction ID:', error);
    throw error;
  }
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const [result] = await pool.execute(`
      UPDATE payment_transactions 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [status, paymentId]);
    
    if (result.affectedRows === 0) {
      throw new Error(`No payment found with ID: ${paymentId}`);
    }
    
    // Get updated payment
    const [rows] = await pool.execute(`
      SELECT * FROM payment_transactions WHERE id = ?
    `, [paymentId]);
    
    return rows[0];
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    throw error;
  }
};

/**
 * Get user payments
 */
export const getUserPayments = async (userId = null) => {
  try {
    let query = `
      SELECT * FROM payment_transactions 
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    let params = [];
    
    if (userId) {
      query = `
        SELECT * FROM payment_transactions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 50
      `;
      params = [userId];
    }
    
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('❌ Error getting user payments:', error);
    throw error;
  }
};

/**
 * Tạo bản ghi thanh toán trong bảng payments
 * @param {Object} paymentData - Dữ liệu thanh toán
 * @returns {Object} - Bản ghi thanh toán đã được tạo
 */
export const createPayment = async (paymentData) => {
  try {
    const { 
      userId, 
      packageId, 
      amount, 
      paymentMethod, 
      paymentStatus = 'pending',
      transactionId,
      paymentDetails 
    } = paymentData;

    const query = `
      INSERT INTO payments (
        user_id, 
        package_id, 
        amount, 
        payment_method, 
        payment_status,
        transaction_id,
        payment_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    let paymentDetailsJson = null;
    if (paymentDetails) {
      paymentDetailsJson = typeof paymentDetails === 'object' 
        ? JSON.stringify(paymentDetails) 
        : paymentDetails;
    }

    const [result] = await pool.execute(query, [
      userId,
      packageId,
      amount,
      paymentMethod,
      paymentStatus,
      transactionId,
      paymentDetailsJson
    ]);

    // Get the created payment
    const [rows] = await pool.execute(
      `SELECT * FROM payments WHERE id = ?`,
      [result.insertId]
    );

    if (rows.length === 0) {
      throw new Error('Failed to retrieve created payment');
    }

    const payment = rows[0];
    
    // Parse JSON field
    if (payment.payment_details && typeof payment.payment_details === 'string') {
      try {
        payment.payment_details = JSON.parse(payment.payment_details);
      } catch (e) {
        // Keep as string if not valid JSON
      }
    }

    console.log('✅ Payment created successfully:', payment.id);
    return payment;
  } catch (error) {
    console.error('❌ Error creating payment:', error);
    throw error;
  }
};

export default {
  ensurePaymentTransactionsTable,
  createPaymentTransaction,
  updateTransactionStatus,
  getTransactionById,
  getUserTransactions,
  getPaymentByTransactionId,
  updatePaymentStatus,
  getUserPayments,
  createPayment
};
