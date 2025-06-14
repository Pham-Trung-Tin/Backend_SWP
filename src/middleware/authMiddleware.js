// Authentication middleware
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Protect routes - Verify if the user is authenticated
exports.protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header is present
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract token from Bearer
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token - using decoded.id which contains UserID
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Check if user has required membership
exports.requireMembership = (requiredMembership) => {
  return async (req, res, next) => {
    const membershipLevels = ['free', 'premium', 'pro'];
    const userLevel = membershipLevels.indexOf(req.user.Membership);
    const requiredLevel = membershipLevels.indexOf(requiredMembership);

    // If membership level is not found or user level is less than required
    if (userLevel === -1 || requiredLevel === -1 || userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        message: `This resource requires a ${requiredMembership} membership`,
        requiredMembership
      });
    }

    next();
  };
};
