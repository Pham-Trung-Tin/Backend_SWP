const User = require('../models/userModel');
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.UserID);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.UserID,
        name: user.Name,
        email: user.Email,
        age: user.Age,
        gender: user.Gender,
        phone: user.Phone,
        address: user.Address,
        membershipType: user.Membership,
        registerDate: user.RegisterDate,
        profileImage: user.ProfileImage
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.UserID;
    
    // Check if email already exists for another user
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.UserID !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }
    
    // Update user in database
    const query = `
      UPDATE users 
      SET ${name ? 'Name = ?' : ''} ${name && email ? ',' : ''} ${email ? 'Email = ?' : ''}
      WHERE UserID = ?
    `;
    
    const values = [];
    if (name) values.push(name);
    if (email) values.push(email);
    values.push(userId);
    
    await pool.query(query, values);
    
    // Get updated user
    const updatedUser = await User.findById(userId);
    
    res.status(200).json({
      success: true,
      data: {
        id: updatedUser.UserID,
        name: updatedUser.Name,
        email: updatedUser.Email,
        age: updatedUser.Age,
        gender: updatedUser.Gender,
        phone: updatedUser.Phone,
        address: updatedUser.Address,
        membershipType: updatedUser.Membership
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.UserID;
    
    // Get user
    const user = await User.findById(userId);
    
    // Check current password
    const isPasswordCorrect = await User.comparePassword(currentPassword, user.Password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await pool.query('UPDATE users SET Password = ? WHERE UserID = ?', [hashedPassword, userId]);
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};