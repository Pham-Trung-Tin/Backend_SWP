const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Tạo user mới
  static async create(userData) {
    try {
      const {
        name, email, password, age, gender, phone, address
      } = userData;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const query = `
        INSERT INTO users 
        (Name, Email, Password, Age, Gender, Phone, Address, RegisterDate, RoleID, IsActive, Membership)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
      `;

      const [result] = await pool.query(query, [
        name,
        email,
        hashedPassword,
        age,
        gender,
        phone,
        address,
        2,          // RoleID mặc định là user
        true,       // IsActive = true
        'free'      // Membership mặc định
      ]);

      return {
        UserID: result.insertId,
        Name: name,
        Email: email,
        Phone: phone,
        Membership: 'free'
      };
    } catch (error) {
      throw error;
    }
  }

  // Tìm theo email
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE Email = ?', [email]);
    return rows.length ? rows[0] : null;
  }

  // Tìm theo ID
  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE UserID = ?', [id]);
    return rows.length ? rows[0] : null;
  }

  // Tìm user theo điều kiện (cho Sequelize compatibility)
  static async findOne(options) {
    try {
      if (options && options.where) {
        const whereConditions = options.where;
        const keys = Object.keys(whereConditions);
        
        if (keys.length > 0) {
          // Xử lý trường hợp Email
          if (keys[0] === 'Email') {
            return await this.findByEmail(whereConditions.Email);
          }
          
          // Xử lý các trường hợp khác nếu cần
          const fieldName = keys[0];
          const value = whereConditions[fieldName];
          
          const [rows] = await pool.query(`SELECT * FROM users WHERE ${fieldName} = ?`, [value]);
          return rows.length ? rows[0] : null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error in findOne:', error);
      throw error;
    }
  }

  // So sánh mật khẩu
  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  // Cập nhật Membership
  static async updateMembership(userId, membershipType) {
    await pool.query('UPDATE users SET Membership = ? WHERE UserID = ?', [membershipType, userId]);
    return { success: true };
  }
}

module.exports = User;
