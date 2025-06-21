import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import emailService from '../services/emailService.js';

// Ensure required tables exist
export const ensureTablesExist = async () => {
    try {
        // Create users table if it doesn't exist
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                phone VARCHAR(20),
                date_of_birth DATE,
                gender ENUM('male', 'female', 'other'),
                role ENUM('user', 'admin', 'coach') DEFAULT 'user',
                email_verified BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                refresh_token TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_username (username),
                INDEX idx_active (is_active)
            )
        `);

        // Add missing columns to users table if they don't exist
        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN email_verified BOOLEAN DEFAULT FALSE
            `);
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('email_verified column error:', error.message);
            }
        }

        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN is_active BOOLEAN DEFAULT TRUE
            `);
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('is_active column error:', error.message);
            }
        } try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN refresh_token TEXT
            `);
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('refresh_token column error:', error.message);
            }
        }

        // Fix role column to ensure it has correct ENUM values
        try {
            await pool.execute(`
                ALTER TABLE users 
                MODIFY COLUMN role ENUM('user', 'admin', 'coach') DEFAULT 'user'
            `);
        } catch (error) {
            console.log('role column error:', error.message);
        }

        // Create pending_registrations table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS pending_registrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                phone VARCHAR(20),
                date_of_birth DATE,
                gender ENUM('male', 'female', 'other'),
                role ENUM('user', 'admin', 'coach') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 15 MINUTE)
            )
        `);

        // Create email_verifications table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS email_verifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL,
                verification_code VARCHAR(6) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 15 MINUTE),
                verified BOOLEAN DEFAULT FALSE,
                is_used BOOLEAN DEFAULT FALSE,
                INDEX idx_email_code (email, verification_code),
                INDEX idx_expires_at (expires_at)
            )
        `);

        // Clean up expired records periodically
        setInterval(async () => {
            try {
                await pool.execute('DELETE FROM pending_registrations WHERE expires_at < NOW()');
                await pool.execute('DELETE FROM email_verifications WHERE expires_at < NOW()');
            } catch (error) {
                console.error('Error cleaning up expired records:', error);
            }
        }, 10 * 60 * 1000); // Every 10 minutes

        console.log('✅ Database tables verified and updated');
    } catch (error) {
        console.error('❌ Error ensuring tables exist:', error);
        throw error;
    }
};

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
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
        role: user.role,
        emailVerified: user.email_verified,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at
    };
};

// Register User - Step 1: Create pending registration
export const register = async (req, res) => {
    try {
        console.log('📝 Registration request received:', req.body);

        const {
            username,
            email,
            password,
            fullName,
            phone,
            dateOfBirth,
            gender,
            role
        } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            console.log('❌ Missing required fields');
            return sendError(res, 'Username, email, and password are required', 400);
        }

        console.log('🔍 Checking for existing users...');
        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            console.log('❌ User already exists');
            return sendError(res, 'User with this email or username already exists', 409);
        } console.log('🔍 Checking for pending registrations...');
        // Check pending registrations
        const [pendingUsers] = await pool.execute(
            'SELECT id FROM pending_registrations WHERE email = ? OR username = ?',
            [email, username]
        );

        if (pendingUsers.length > 0) {
            console.log('⚠️ Found existing pending registration, cleaning up...');
            // Delete existing pending registration and verification codes for this email/username
            await pool.execute('DELETE FROM pending_registrations WHERE email = ? OR username = ?', [email, username]);
            await pool.execute('DELETE FROM email_verifications WHERE email = ?', [email]);
            console.log('✅ Cleaned up previous pending registration');
        }

        console.log('🔐 Hashing password...');
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        console.log('💾 Creating pending registration...');
        // Create pending registration
        await pool.execute(
            `INSERT INTO pending_registrations 
             (username, email, password_hash, full_name, phone, date_of_birth, gender, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [username, email, hashedPassword, fullName, phone || null, dateOfBirth || null, gender || null, role || 'user']
        );

        console.log('🔢 Generating verification code...');
        // Generate verification code and send via email
        const verificationCode = emailService.generateVerificationCode();

        console.log('📧 Attempting to send verification email...');
        try {
            await emailService.sendVerificationEmail(email, fullName, verificationCode);
            console.log(`📧 Verification email sent to ${email}`);
        } catch (emailError) {
            console.error('📧 Failed to send email:', emailError.message);
            // For development, continue without email but log the code
            console.log(`⚠️ Development mode - Verification code: ${verificationCode}`);
        }

        console.log('✅ Registration successful');
        sendSuccess(res, 'Registration pending. Verification code sent to your email.', {
            email: email,
            message: 'Please enter the 6-digit code sent to your email to complete registration',
            verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
        });

    } catch (error) {
        console.error('❌ Register error:', error);

        const errorMessage = error.code === 'ER_DUP_ENTRY'
            ? 'Email or username already exists'
            : 'Registration failed. Please try again.';

        sendError(res, errorMessage, 500);
    }
};

// Login User
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await pool.execute(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return sendError(res, 'Invalid email or password', 401);
        }

        const user = users[0];

        if (!user.is_active) {
            return sendError(res, 'Account is deactivated. Please contact support.', 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return sendError(res, 'Invalid email or password', 401);
        }

        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        await pool.execute(
            'UPDATE users SET updated_at = NOW() WHERE id = ?',
            [user.id]
        );

        sendSuccess(res, 'Login successful', {
            user: formatUserResponse(user),
            token,
            refreshToken
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        sendError(res, 'Login failed. Please try again.', 500);
    }
};

// Verify Email (simple version)
export const verifyEmail = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        // Validation
        if (!email || !verificationCode) {
            return sendError(res, 'Email and verification code are required', 400);
        }        // Check if verification code is valid using emailService
        const isCodeValid = await emailService.verifyCode(email, verificationCode);

        if (!isCodeValid) {
            return sendError(res, 'Invalid or expired verification code', 400);
        }

        // Get pending registration data
        const [pendingRegistrations] = await pool.execute(
            'SELECT * FROM pending_registrations WHERE email = ? AND expires_at > NOW()',
            [email]
        );

        if (pendingRegistrations.length === 0) {
            return sendError(res, 'No pending registration found or registration expired', 400);
        }

        const pendingUser = pendingRegistrations[0];

        // Move data from pending_registrations to users table
        const [result] = await pool.execute(
            `INSERT INTO users 
             (username, email, password_hash, full_name, phone, date_of_birth, gender, role, email_verified, is_active, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, TRUE, NOW())`,
            [
                pendingUser.username,
                pendingUser.email,
                pendingUser.password_hash,
                pendingUser.full_name,
                pendingUser.phone,
                pendingUser.date_of_birth,
                pendingUser.gender,
                pendingUser.role || 'user'
            ]
        );

        const userId = result.insertId;

        // Mark verification as completed
        await pool.execute(
            'UPDATE email_verifications SET verified = TRUE WHERE email = ? AND verification_code = ?',
            [email, verificationCode]
        );

        // Clean up pending registration and verification records
        await pool.execute('DELETE FROM pending_registrations WHERE email = ?', [email]);
        await pool.execute('DELETE FROM email_verifications WHERE email = ?', [email]);        // Generate JWT tokens
        const accessToken = generateToken(userId);
        const refreshToken = generateRefreshToken(userId);

        // Store refresh token
        await pool.execute(
            'UPDATE users SET refresh_token = ? WHERE id = ?',
            [refreshToken, userId]
        ); sendSuccess(res, 'Email verified and account created successfully', {
            user: {
                id: userId,
                username: pendingUser.username,
                email: pendingUser.email,
                fullName: pendingUser.full_name,
                role: pendingUser.role || 'user',
                emailVerified: true
            },
            token: accessToken,  // Frontend expects 'token', not 'accessToken'
            refreshToken: refreshToken
        });
    } catch (error) {
        console.error('❌ Verify email error:', error);
        sendError(res, 'Email verification failed. Please try again.', 500);
    }
};

// Resend Verification Code
export const resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return sendError(res, 'Email is required', 400);
        }

        // Check if there's a pending registration for this email
        const [pendingRegistrations] = await pool.execute(
            'SELECT * FROM pending_registrations WHERE email = ? AND expires_at > NOW()',
            [email]
        );

        if (pendingRegistrations.length === 0) {
            return sendError(res, 'No pending registration found for this email or registration expired. Please register again.', 400);
        }

        const pendingUser = pendingRegistrations[0];

        // Delete old verification codes for this email
        await pool.execute('DELETE FROM email_verifications WHERE email = ?', [email]);

        // Generate new verification code
        const verificationCode = emailService.generateVerificationCode();

        // Send verification email (this will also store the code)
        try {
            await emailService.sendVerificationEmail(email, pendingUser.full_name, verificationCode);
            console.log(`📧 Verification email resent to ${email}`);
        } catch (emailError) {
            console.error('📧 Failed to resend email:', emailError.message);
            console.log(`⚠️ Development mode - New verification code: ${verificationCode}`);
        }

        sendSuccess(res, 'New verification code sent to your email', {
            email: email,
            message: 'Please check your email for the new verification code',
            verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
        });

    } catch (error) {
        console.error('❌ Resend verification error:', error);
        sendError(res, 'Failed to resend verification code', 500);
    }
};

// Get User Profile
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return sendError(res, 'User not found', 404);
        }

        sendSuccess(res, 'User profile fetched successfully', formatUserResponse(users[0]));
    } catch (error) {
        console.error('❌ Get profile error:', error);
        sendError(res, 'Failed to fetch profile', 500);
    }
};

// Update User Profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            fullName,
            phone,
            dateOfBirth,
            gender,
            role
        } = req.body;
        await pool.execute(
            `UPDATE users SET 
                full_name = ?, 
                phone = ?, 
                date_of_birth = ?, 
                gender = ?, 
                role = ?,
                updated_at = NOW() 
             WHERE id = ?`,
            [fullName, phone || null, dateOfBirth || null, gender || null, role || 'user', userId]
        );

        sendSuccess(res, 'Profile updated successfully');
    } catch (error) {
        console.error('❌ Update profile error:', error);
        sendError(res, 'Failed to update profile', 500);
    }
};

// Change Password
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;        // Get current password hash
        const [users] = await pool.execute(
            'SELECT password_hash FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return sendError(res, 'User not found', 404);
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!isPasswordValid) {
            return sendError(res, 'Current password is incorrect', 401);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);        // Update password
        await pool.execute(
            'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
            [hashedPassword, userId]
        );

        sendSuccess(res, 'Password changed successfully');
    } catch (error) {
        console.error('❌ Change password error:', error);
        sendError(res, 'Failed to change password', 500);
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
        }        // Check if user still exists and is active
        const [users] = await pool.execute(
            'SELECT id FROM users WHERE id = ? AND is_active = true',
            [decoded.userId]
        );

        if (users.length === 0) {
            return sendError(res, 'User not found or account deactivated', 401);
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
        console.error('❌ Refresh token error:', error);
        sendError(res, 'Failed to refresh token', 500);
    }
};

// Logout
export const logout = async (req, res) => {
    try {
        sendSuccess(res, 'Logged out successfully');
    } catch (error) {
        console.error('❌ Logout error:', error);
        sendError(res, 'Logout failed', 500);
    }
};

// Export alias for convenience
export const verify = verifyEmail;
