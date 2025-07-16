import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

/**
 * Middleware để yêu cầu xác thực người dùng
 * Sẽ kiểm tra JWT token trong header Authorization
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Kiểm tra có authorization header hay không
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided',
        data: null
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Xác thực token
    try {
      // In ra token để debug
      console.log('Verifying token:', token ? token.substring(0, 10) + '...' : 'undefined');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
      console.log('Decoded token payload:', decoded);
      
      // Kiểm tra kỹ lưỡng cấu trúc token
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Token verification failed: decoded token is empty',
          data: null
        });
      }
      
      console.log('Token payload structure:', JSON.stringify(decoded));
      
      // Xác định ID người dùng từ nhiều cấu trúc token khác nhau
      let rawUserId;
      
      // Liệt kê tất cả các thuộc tính trong token để debug
      console.log('Token properties:');
      for (const key in decoded) {
        console.log(`  - ${key}:`, decoded[key]);
        if (typeof decoded[key] === 'object' && decoded[key] !== null) {
          for (const subKey in decoded[key]) {
            console.log(`    + ${subKey}:`, decoded[key][subKey]);
          }
        }
      }
      
      // Kiểm tra nhiều khả năng cấu trúc token
      if (decoded.id !== undefined) {
        rawUserId = decoded.id; // Format từ script generate-token
      } else if (decoded.userId !== undefined) {
        rawUserId = decoded.userId; // Possible format
      } else if (decoded.user_id !== undefined) {
        rawUserId = decoded.user_id; // Possible format
      } else if (decoded.sub !== undefined) {
        rawUserId = decoded.sub; // JWT standard subject claim
      } else if (decoded.user && decoded.user.id !== undefined) {
        rawUserId = decoded.user.id; // Nested format
      } else if (decoded.data && decoded.data.id !== undefined) {
        rawUserId = decoded.data.id; // Nested in data format
      } else if (decoded.iat !== undefined && decoded.exp !== undefined) {
        // Đây có thể là token không chứa ID người dùng
        // Cố gắng tìm ID trong các trường khác
        console.log('WARNING: Token looks like standard JWT without explicit user ID');
      }
      
      // Kiểm tra nếu không tìm thấy id trong token
      if (rawUserId === undefined || rawUserId === null) {
console.error('Token payload missing user ID. Payload:', decoded);
        
        // Truy cập CSDL để lấy người dùng dựa vào email nếu có
        if (decoded.email) {
          console.log('Attempting to find user by email:', decoded.email);
          try {
            const [usersByEmail] = await pool.execute(
              'SELECT id FROM users WHERE email = ? LIMIT 1',
              [decoded.email]
            );
            
            if (usersByEmail.length > 0) {
              rawUserId = usersByEmail[0].id;
              console.log('Found user ID by email:', rawUserId);
            }
          } catch (emailLookupError) {
            console.error('Error looking up user by email:', emailLookupError);
          }
        }
        
        // Vẫn không tìm thấy ID
        if (rawUserId === undefined || rawUserId === null) {
          return res.status(401).json({
            success: false,
            message: 'Token format không hợp lệ: không tìm thấy ID người dùng',
            data: null
          });
        }
      }
      
      // Đảm bảo id là số nguyên và hợp lệ
      const userId = Number(rawUserId);
      console.log('User ID extracted from token:', userId, typeof userId);
      
      if (isNaN(userId) || userId <= 0) {
        return res.status(401).json({
          success: false,
          message: `Invalid user ID in token: ${decoded.id}`,
          data: null
        });
      }
      
      // Kiểm tra người dùng có tồn tại không - sử dụng giá trị userId chắc chắn là số
      console.log('Executing SQL query with userId:', userId);
      const [users] = await pool.execute(
        'SELECT id, email, full_name, role FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. User not found',
          data: null
        });
      }
      
      // Thêm thông tin người dùng vào request
      req.user = users[0];
      next();
    } catch (error) {
      console.error('❌ Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: error.message,
        data: null
      });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error in auth middleware',
      error: error.message,
      data: null
    });
  }
};

/**
 * Middleware để yêu cầu quyền admin
 * Phải được sử dụng sau requireAuth
 */
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required',
      data: null
    });
  }
};