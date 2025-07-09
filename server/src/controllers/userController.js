import User from '../models/User.js';
import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';

// Get user profile
export const getProfile = async (req, res) => {
    try {        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: null
            });
        }

        // Remove sensitive information
        delete user.password_hash;
        delete user.refresh_token;
        
        // Đảm bảo membership được trả về đúng
        if (user.membership === null || user.membership === undefined) {
            user.membership = 'free'; // Giá trị mặc định nếu không có
        }
        
        console.log('🔍 Get profile - User membership:', user.membership);
        
        res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
            data: null
        });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        console.log('📝 Update profile request:', req.body);
        
        // Nhận dữ liệu từ request
        const { 
            name, fullName, full_name, 
            email, 
            phone, 
            age, 
            gender, 
            address, 
            dateOfBirth, date_of_birth, 
            quitReason, quit_reason,
            membership
        } = req.body;
        
        const userId = req.user.id;
        console.log('👤 User ID:', userId);
        
        // Check if email already exists for another user
        if (email) {
            const existingUser = await User.findByEmail(email);
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use',
                    data: null
                });
            }
        }
        
        // Prepare update data - hỗ trợ nhiều định dạng đầu vào khác nhau
        const updateData = {};
        
        // Xử lý trường full_name (có thể truyền vào với nhiều tên khác nhau)
        if (name) updateData.full_name = name;
        else if (fullName) updateData.full_name = fullName;
        else if (full_name) updateData.full_name = full_name;
        
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (age !== undefined) updateData.age = parseInt(age);
        if (gender) updateData.gender = gender;
        if (address !== undefined) updateData.address = address;
        
        // Xử lý trường date_of_birth (có thể truyền vào dạng camelCase hoặc snake_case)
        if (dateOfBirth) updateData.date_of_birth = dateOfBirth;
        else if (date_of_birth) updateData.date_of_birth = date_of_birth;
        
        // Xử lý trường quit_reason đặc biệt - đảm bảo xử lý cả khi giá trị rỗng hoặc null
        if (quitReason !== undefined) {
            // Truyền giá trị trực tiếp, kể cả khi là chuỗi rỗng hoặc null
            // Model User.js sẽ xử lý việc chuyển đổi chuỗi rỗng thành null
            updateData.quit_reason = quitReason;
            console.log('📝 Setting quit_reason from quitReason:', quitReason, typeof quitReason);
        } else if (quit_reason !== undefined) {
            // Truyền giá trị trực tiếp, kể cả khi là chuỗi rỗng hoặc null
            updateData.quit_reason = quit_reason;
            console.log('📝 Setting quit_reason from quit_reason:', quit_reason, typeof quit_reason);
        }
        
        // Xử lý membership nếu có
        if (membership !== undefined) {
            // Kiểm tra giá trị membership hợp lệ
            if (['free', 'premium', 'pro'].includes(membership)) {
                updateData.membership = membership;
                console.log('🎭 Setting membership:', membership);
            } else {
                console.log('⚠️ Membership không hợp lệ, sử dụng giá trị mặc định "free"');
                updateData.membership = 'free';
            }
        }
        
        console.log('🔄 Final update data:', updateData);
        
        // Kiểm tra xem có dữ liệu cập nhật không
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No data provided for update',
                data: null
            });
        }
        
        // Update user in database
        const updated = await User.update(userId, updateData);
        console.log('✅ Update result:', updated);
        
        // Kiểm tra kết quả cập nhật
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Failed to update user or user not found',
                data: null
            });
        }
        
        // Đợi một chút để đảm bảo DB đã cập nhật xong
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get updated user
        const updatedUser = await User.findById(userId);
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found after update',
                data: null
            });
        }
        
        // Loại bỏ thông tin nhạy cảm
        delete updatedUser.password_hash;
        delete updatedUser.refresh_token;
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
            data: null
        });
    }
};

// Upload avatar
export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
                data: null
            });
        }
        
        const userId = req.user.id;
        const avatarPath = `/uploads/avatars/${req.file.filename}`;
          // Get user's current avatar
        const currentUser = await User.findById(userId);
        const oldAvatarPath = currentUser.profile_image;
          // Update user's avatar in database
        await User.update(userId, { profile_image: avatarPath });
        
        // Delete old avatar file if it exists and is not a default avatar
        if (oldAvatarPath && !oldAvatarPath.includes('default') && fs.existsSync(path.join(process.cwd(), 'public', oldAvatarPath))) {
            fs.unlinkSync(path.join(process.cwd(), 'public', oldAvatarPath));
        }
        
        res.status(200).json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: { avatarUrl: avatarPath }
        });
    } catch (error) {
        // Delete uploaded file if there's an error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
            data: null
        });
    }
};

// Get smoking status
export const getSmokingStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user's smoking status from database
        const query = `
            SELECT 
                SmokingStatus,
                CigarettesPerDay,
                YearsSmoked,
                QuitDate,
                LastUpdated
            FROM user_smoking_status
            WHERE UserID = ?
        `;
        
        const [rows] = await pool.query(query, [userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Smoking status not found',
                data: null
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Smoking status retrieved successfully',
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
            data: null
        });
    }
};

// Update smoking status
export const updateSmokingStatus = async (req, res) => {
    try {
        const { smokingStatus, cigarettesPerDay, yearsSmoked, quitDate } = req.body;
        const userId = req.user.id;
        
        // Check if user already has a smoking status record
        const checkQuery = `SELECT UserID FROM user_smoking_status WHERE UserID = ?`;
        const [checkRows] = await pool.query(checkQuery, [userId]);
        
        let query, params;
        
        if (checkRows.length === 0) {
            // Insert new record
            query = `
                INSERT INTO user_smoking_status 
                    (UserID, SmokingStatus, CigarettesPerDay, YearsSmoked, QuitDate, LastUpdated) 
                VALUES (?, ?, ?, ?, ?, NOW())
            `;
            params = [userId, smokingStatus, cigarettesPerDay, yearsSmoked, quitDate || null];
        } else {
            // Update existing record
            query = `
                UPDATE user_smoking_status
                SET 
                    SmokingStatus = ?,
                    CigarettesPerDay = ?,
                    YearsSmoked = ?,
                    QuitDate = ?,
                    LastUpdated = NOW()
                WHERE UserID = ?
            `;
            params = [smokingStatus, cigarettesPerDay, yearsSmoked, quitDate || null, userId];
        }
        
        await pool.query(query, params);
        
        // Get updated smoking status
        const getQuery = `
            SELECT 
                SmokingStatus,
                CigarettesPerDay,
                YearsSmoked,
                QuitDate,
                LastUpdated
            FROM user_smoking_status
            WHERE UserID = ?
        `;
        
        const [rows] = await pool.query(getQuery, [userId]);
        
        res.status(200).json({
            success: true,
            message: 'Smoking status updated successfully',
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
            data: null
        });
    }
};

// Delete user account
export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
          // Get user's avatar
        const user = await User.findById(userId);
        const avatarPath = user.profile_image;
        
        // Begin transaction to ensure all related data is deleted
        await pool.query('START TRANSACTION');
        
        // Delete user's smoking status
        await pool.query('DELETE FROM user_smoking_status WHERE UserID = ?', [userId]);
        
        // Delete user's refresh tokens
        await pool.query('DELETE FROM refresh_tokens WHERE UserID = ?', [userId]);
        
        // Delete any other related data...
        // For example:
        // await pool.query('DELETE FROM user_progress WHERE UserID = ?', [userId]);
        // await pool.query('DELETE FROM user_goals WHERE UserID = ?', [userId]);
        
        // Finally delete the user
        await pool.query('DELETE FROM users WHERE UserID = ?', [userId]);
        
        // Commit transaction
        await pool.query('COMMIT');
        
        // Delete avatar file if it exists and is not a default avatar
        if (avatarPath && !avatarPath.includes('default') && fs.existsSync(path.join(process.cwd(), 'public', avatarPath))) {
            fs.unlinkSync(path.join(process.cwd(), 'public', avatarPath));
        }
        
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully',
            data: null
        });
    } catch (error) {
        // Rollback transaction if error
        await pool.query('ROLLBACK');
        
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
            data: null
        });
    }
};
