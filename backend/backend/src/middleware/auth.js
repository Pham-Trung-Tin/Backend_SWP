import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware xác thực JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token không được cung cấp'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Lấy thông tin user từ database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc user không tồn tại'
      });
    }
    
    // Thêm user vào request object
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực'
    });
  }
};

// Middleware kiểm tra membership
export const requireMembership = (allowedMemberships = ['premium', 'pro']) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Chưa đăng nhập'
        });
      }
      
      // Kiểm tra membership level
      const membershipLevels = { 'free': 0, 'premium': 1, 'pro': 2 };
      const userLevel = membershipLevels[user.membership] || 0;
      const minRequiredLevel = Math.min(...allowedMemberships.map(m => membershipLevels[m] || 0));
      
      if (userLevel < minRequiredLevel) {
        return res.status(403).json({
          success: false,
          message: 'Tính năng này yêu cầu gói thành viên cao hơn',
          data: {
            currentMembership: user.membership,
            requiredMembership: allowedMemberships,
            upgradeRequired: true
          }
        });
      }
      
      // Kiểm tra hạn sử dụng membership (nếu không phải free)
      if (user.membership !== 'free' && user.membershipExpiry) {
        if (new Date() > user.membershipExpiry) {
          return res.status(403).json({
            success: false,
            message: 'Gói thành viên đã hết hạn',
            data: {
              currentMembership: user.membership,
              expiredAt: user.membershipExpiry,
              renewalRequired: true
            }
          });
        }
      }
      
      next();
      
    } catch (error) {
      console.error('Membership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi kiểm tra quyền truy cập'
      });
    }
  };
};

// Middleware kiểm tra admin role (cho tương lai)
export const requireAdmin = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập'
      });
    }
    
    // Kiểm tra role admin (cần thêm trường role vào User model)
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền truy cập'
      });
    }
    
    next();
    
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra quyền admin'
    });
  }
};

// Middleware optional authentication (không bắt buộc đăng nhập)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (tokenError) {
        // Ignore token errors for optional auth
        console.log('Optional auth - invalid token ignored');
      }
    }
    
    next();
    
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue even if there's an error
  }
};

// Utility function để tạo JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Utility function để tạo refresh token (cho tương lai)
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_SECRET + '_REFRESH',
    { expiresIn: '30d' }
  );
};

// Export alias for convenience
export const authenticate = authenticateToken;
