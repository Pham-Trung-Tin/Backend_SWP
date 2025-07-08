import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for avatar uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads/avatars';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Get user profile
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [users] = await pool.execute(
            `SELECT 
                id, username, email, full_name, phone, date_of_birth, 
                gender, role, email_verified, avatar_url, 
                created_at, updated_at 
             FROM users WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        // Get smoking status
        const [smokingStatus] = await pool.execute(
            `SELECT * FROM user_smoking_status WHERE UserID = ? ORDER BY LastUpdated DESC LIMIT 1`,
            [userId]
        );

        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: {
                user,
                smokingStatus: smokingStatus[0] || null
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving profile'
        });
    }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, phone, date_of_birth, gender } = req.body;

        // Validate input
        if (date_of_birth && isNaN(Date.parse(date_of_birth))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }

        if (gender && !['male', 'female', 'other'].includes(gender)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gender value'
            });
        }

        const updateFields = [];
        const updateValues = [];

        if (full_name !== undefined) {
            updateFields.push('full_name = ?');
            updateValues.push(full_name);
        }

        if (phone !== undefined) {
            updateFields.push('phone = ?');
            updateValues.push(phone);
        }

        if (date_of_birth !== undefined) {
            updateFields.push('date_of_birth = ?');
            updateValues.push(date_of_birth);
        }

        if (gender !== undefined) {
            updateFields.push('gender = ?');
            updateValues.push(gender);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateValues.push(userId);

        await pool.execute(
            `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            updateValues
        );

        // Get updated user data
        const [users] = await pool.execute(
            `SELECT 
                id, username, email, full_name, phone, date_of_birth, 
                gender, role, email_verified, avatar_url, 
                created_at, updated_at 
             FROM users WHERE id = ?`,
            [userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: users[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

// Upload avatar
export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const userId = req.user.id;
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        // Get old avatar to delete
        const [users] = await pool.execute(
            'SELECT avatar_url FROM users WHERE id = ?',
            [userId]
        );

        const oldAvatarUrl = users[0]?.avatar_url;

        // Update avatar URL in database
        await pool.execute(
            'UPDATE users SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [avatarUrl, userId]
        );

        // Delete old avatar file if exists
        if (oldAvatarUrl && oldAvatarUrl !== avatarUrl) {
            const oldFilePath = path.join('public', oldAvatarUrl);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: {
                avatarUrl
            }
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading avatar'
        });
    }
};

// Get smoking status
export const getSmokingStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const [results] = await pool.execute(
            `SELECT * FROM user_smoking_status WHERE UserID = ? ORDER BY LastUpdated DESC LIMIT 1`,
            [userId]
        );

        res.json({
            success: true,
            message: 'Smoking status retrieved successfully',
            data: results[0] || null
        });
    } catch (error) {
        console.error('Get smoking status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving smoking status'
        });
    }
};

// Update smoking status
export const updateSmokingStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            is_smoker,
            cigarettes_per_day,
            years_smoking,
            quit_date,
            quit_attempts,
            motivation_level,
            quit_reasons
        } = req.body;

        console.log('Update Smoking Status Request:', JSON.stringify(req.body));

        // Validate required fields
        if (is_smoker === undefined) {
            return res.status(400).json({
                success: false,
                message: 'is_smoker field is required'
            });
        }

        // Create or update smoking status
        const [existing] = await pool.execute(
            'SELECT id FROM user_smoking_status WHERE UserID = ?',
            [userId]
        );

        // Set smoking status based on is_smoker
        const smokingStatus = is_smoker ? 'active' : 'quit';

        // Use null for any undefined values
        const cpd = cigarettes_per_day || null;
        const ys = years_smoking || null;
        const qd = quit_date || null;

        console.log('Parameters for SQL:', {
            userId,
            smokingStatus,
            cpd,
            ys,
            qd
        });

        if (existing.length > 0) {
            // Update existing record
            console.log('Updating existing record');
            await pool.execute(
                `UPDATE user_smoking_status SET 
                    SmokingStatus = ?, 
                    CigarettesPerDay = ?, 
                    YearsSmoked = ?, 
                    QuitDate = ?,
                    LastUpdated = CURRENT_TIMESTAMP 
                 WHERE UserID = ?`,
                [smokingStatus, cpd, ys, qd, userId]
            );
        } else {
            // Insert new record
            console.log('Inserting new record');
            await pool.execute(
                `INSERT INTO user_smoking_status 
                    (UserID, SmokingStatus, CigarettesPerDay, YearsSmoked, QuitDate, LastUpdated) 
                 VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [userId, smokingStatus, cpd, ys, qd]
            );
        }

        // Get updated smoking status
        const [results] = await pool.execute(
            'SELECT * FROM user_smoking_status WHERE UserID = ? ORDER BY LastUpdated DESC LIMIT 1',
            [userId]
        );

        res.json({
            success: true,
            message: 'Smoking status updated successfully',
            data: results[0]
        });
    } catch (error) {
        console.error('Update smoking status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating smoking status'
        });
    }
};

// Delete user account
export const deleteUserAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required to delete account'
            });
        }

        // Verify password
        const [users] = await pool.execute(
            'SELECT password_hash, avatar_url FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isValidPassword = await bcrypt.compare(password, users[0].password_hash);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Delete avatar file if exists
        const avatarUrl = users[0].avatar_url;
        if (avatarUrl) {
            const filePath = path.join('public', avatarUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete user account (cascade delete will handle related records)
        await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting account'
        });
    }
};
