// Membership model for MySQL database
const { pool } = require('../config/database');

class Membership {
  // Get membership details by type
  static async getByType(membershipType) {
    try {
      const [rows] = await pool.query('SELECT * FROM memberships WHERE type = ?', [membershipType]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Get all membership types
  static async getAllTypes() {
    try {
      const [rows] = await pool.query('SELECT * FROM memberships ORDER BY price ASC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Create a new membership subscription
  static async createSubscription(data) {
    try {
      const { userId, membershipType, startDate, endDate, paymentId, amount } = data;
      
      const query = `
        INSERT INTO membership_subscriptions 
        (user_id, membership_type, start_date, end_date, payment_id, amount, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const [result] = await pool.query(
        query, 
        [userId, membershipType, startDate, endDate, paymentId, amount]
      );
      
      // Update user's membership type
      await pool.query(
        'UPDATE users SET membership_type = ? WHERE id = ?',
        [membershipType, userId]
      );
      
      return { id: result.insertId, userId, membershipType, startDate, endDate };
    } catch (error) {
      throw error;
    }
  }

  // Get active subscription for a user
  static async getUserActiveSubscription(userId) {
    try {
      const query = `
        SELECT * FROM membership_subscriptions 
        WHERE user_id = ? AND end_date >= CURDATE() 
        ORDER BY end_date DESC LIMIT 1
      `;
      
      const [rows] = await pool.query(query, [userId]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Check if user has access to a feature
  static async hasAccessToFeature(userId, requiredMembership) {
    try {
      const query = `
        SELECT membership_type FROM users WHERE id = ?
      `;
      
      const [rows] = await pool.query(query, [userId]);
      
      if (!rows.length) return false;
      
      const userMembership = rows[0].membership_type;
      const membershipLevels = ['free', 'premium', 'pro'];
      
      const userLevel = membershipLevels.indexOf(userMembership);
      const requiredLevel = membershipLevels.indexOf(requiredMembership);
      
      return userLevel >= requiredLevel;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Membership;
