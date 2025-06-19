import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );
};

// Format user data for response (remove sensitive info)
const formatUserResponse = (user) => {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        membershipType: user.membership_type,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        updatedAt: user.updated_at
    };
};

// Register User
export const register = async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            fullName,
            phone,
            dateOfBirth,
            gender
        } = req.body;

        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM smoker WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            return sendError(res, 'User with this email or username already exists', 409);
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Insert new user
            const [result] = await connection.execute(
                `INSERT INTO smoker (username, email, password_hash, full_name, phone, date_of_birth, gender, membership_type) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'free')`,
                [username, email, hashedPassword, fullName, phone || null, dateOfBirth || null, gender || null]
            );

            const userId = result.insertId;

            // Create smoking status record
            await connection.execute(
                'INSERT INTO smokingstatus (smoker_id) VALUES (?)',
                [userId]
            );

            // Commit transaction
            await connection.commit();

            // Get created user (without password)
            const [users] = await pool.execute(
                `SELECT id, username, email, full_name, phone, date_of_birth, gender, 
                        membership_type, avatar_url, created_at, updated_at 
                 FROM smoker 
                 WHERE id = ?`,
                [userId]
            );

            const user = users[0];
            const token = generateToken(userId);
            const refreshToken = generateRefreshToken(userId);

            sendSuccess(res, 'User registered successfully', {
                user: formatUserResponse(user),
                token,
                refreshToken
            }, 201);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Register error:', error);

        // Handle specific MySQL errors
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'Email or username already exists', 409);
        }

        sendError(res, 'Registration failed. Please try again.', 500);
    }
};

// Login User
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const [users] = await pool.execute(
            `SELECT id, username, email, password_hash, full_name, phone, date_of_birth, 
                    gender, membership_type, avatar_url, is_active, created_at, updated_at 
             FROM smoker 
             WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return sendError(res, 'Invalid email or password', 401);
        }

        const user = users[0];

        // Check if account is active
        if (!user.is_active) {
            return sendError(res, 'Account is deactivated. Please contact support.', 401);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return sendError(res, 'Invalid email or password', 401);
        }

        // Get smoking status
        const [statusResult] = await pool.execute(
            `SELECT current_streak_days, longest_streak_days, total_days_quit, 
                    total_cigarettes_avoided, money_saved, current_status, health_score 
             FROM smokingstatus 
             WHERE smoker_id = ?`,
            [user.id]
        );

        const smokingStatus = statusResult[0] || {};

        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Update last login
        await pool.execute(
            'UPDATE smoker SET updated_at = NOW() WHERE id = ?',
            [user.id]
        );

        sendSuccess(res, 'Login successful', {
            user: {
                ...formatUserResponse(user),
                smokingStatus: {
                    currentStreakDays: smokingStatus.current_streak_days || 0,
                    longestStreakDays: smokingStatus.longest_streak_days || 0,
                    totalDaysQuit: smokingStatus.total_days_quit || 0,
                    totalCigarettesAvoided: smokingStatus.total_cigarettes_avoided || 0,
                    moneySaved: smokingStatus.money_saved || 0,
                    currentStatus: smokingStatus.current_status || 'smoking',
                    healthScore: smokingStatus.health_score || 0
                }
            },
            token,
            refreshToken
        });

    } catch (error) {
        console.error('Login error:', error);
        sendError(res, 'Login failed. Please try again.', 500);
    }
};

// Get User Profile
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user with smoking status
        const [result] = await pool.execute(
            `SELECT 
                s.id, s.username, s.email, s.full_name, s.phone, s.date_of_birth, 
                s.gender, s.membership_type, s.avatar_url, s.created_at, s.updated_at,
                ss.current_streak_days, ss.longest_streak_days, ss.total_days_quit, 
                ss.total_cigarettes_avoided, ss.money_saved, ss.current_status, ss.health_score
             FROM smoker s
             LEFT JOIN smokingstatus ss ON s.id = ss.smoker_id
             WHERE s.id = ? AND s.is_active = true`,
            [userId]
        );

        if (result.length === 0) {
            return sendError(res, 'User not found', 404);
        }

        const user = result[0];

        sendSuccess(res, 'Profile retrieved successfully', {
            user: {
                ...formatUserResponse(user),
                smokingStatus: {
                    currentStreakDays: user.current_streak_days || 0,
                    longestStreakDays: user.longest_streak_days || 0,
                    totalDaysQuit: user.total_days_quit || 0,
                    totalCigarettesAvoided: user.total_cigarettes_avoided || 0,
                    moneySaved: user.money_saved || 0,
                    currentStatus: user.current_status || 'smoking',
                    healthScore: user.health_score || 0
                }
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        sendError(res, 'Failed to retrieve profile', 500);
    }
};

// Update Profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, phone, dateOfBirth, gender, avatarUrl } = req.body;

        // Update user profile
        await pool.execute(
            `UPDATE smoker 
             SET full_name = ?, phone = ?, date_of_birth = ?, gender = ?, avatar_url = ?, updated_at = NOW() 
             WHERE id = ?`,
            [fullName, phone || null, dateOfBirth || null, gender || null, avatarUrl || null, userId]
        );

        // Get updated user data
        const [users] = await pool.execute(
            `SELECT id, username, email, full_name, phone, date_of_birth, gender, 
                    membership_type, avatar_url, created_at, updated_at 
             FROM smoker 
             WHERE id = ?`,
            [userId]
        );

        const user = users[0];

        sendSuccess(res, 'Profile updated successfully', {
            user: formatUserResponse(user)
        });

    } catch (error) {
        console.error('Update profile error:', error);
        sendError(res, 'Failed to update profile', 500);
    }
};

// Change Password
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Get current password hash
        const [users] = await pool.execute(
            'SELECT password_hash FROM smoker WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return sendError(res, 'User not found', 404);
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!isCurrentPasswordValid) {
            return sendError(res, 'Current password is incorrect', 401);
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await pool.execute(
            'UPDATE smoker SET password_hash = ?, updated_at = NOW() WHERE id = ?',
            [hashedNewPassword, userId]
        );

        sendSuccess(res, 'Password changed successfully');

    } catch (error) {
        console.error('Change password error:', error);
        sendError(res, 'Failed to change password', 500);
    }
};

// Logout (Can be used for token blacklisting in the future)
export const logout = async (req, res) => {
    try {
        // In a production app, you might want to:
        // 1. Blacklist the token
        // 2. Clear refresh tokens from database
        // 3. Log the logout event

        sendSuccess(res, 'Logged out successfully');
    } catch (error) {
        console.error('Logout error:', error);
        sendError(res, 'Logout failed', 500);
    }
};

// Refresh Token
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return sendError(res, 'Refresh token is required', 401);
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        if (decoded.type !== 'refresh') {
            return sendError(res, 'Invalid refresh token', 401);
        }

        // Check if user still exists
        const [users] = await pool.execute(
            'SELECT id FROM smoker WHERE id = ? AND is_active = true',
            [decoded.userId]
        );

        if (users.length === 0) {
            return sendError(res, 'User not found', 401);
        }

        const newToken = generateToken(decoded.userId);
        const newRefreshToken = generateRefreshToken(decoded.userId);

        sendSuccess(res, 'Token refreshed successfully', {
            token: newToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return sendError(res, 'Invalid or expired refresh token', 401);
        }
        console.error('Refresh token error:', error);
        sendError(res, 'Failed to refresh token', 500);
    }
};
