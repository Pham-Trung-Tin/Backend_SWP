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
        }        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN is_active BOOLEAN DEFAULT TRUE
            `);
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('is_active column error:', error.message);
            }
        }
        
        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN refresh_token TEXT
            `);
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('refresh_token column error:', error.message);
            }
        }
        
        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN profile_image VARCHAR(255) DEFAULT '/uploads/avatars/default.png'
            `);
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('profile_image column error:', error.message);
            }
        }
        
        // Thêm cột age nếu chưa có
        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN age INT NULL
            `);
            console.log('✅ Added age column to users table');
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('age column error:', error.message);
            }
        }
        
        // Thêm cột quit_reason nếu chưa có
        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN quit_reason TEXT NULL
            `);
            console.log('✅ Added quit_reason column to users table');
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('quit_reason column error:', error.message);
            }
        }
        
        // Thêm cột address nếu chưa có
        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN address VARCHAR(255) NULL
            `);
            console.log('✅ Added address column to users table');
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('address column error:', error.message);
            }
        }
        
        // Thêm cột membership nếu chưa có
        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN membership ENUM('free', 'premium', 'pro') DEFAULT 'free'
            `);
            console.log('✅ Added membership column to users table');
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('membership column error:', error.message);
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
        `);        // Create user_smoking_status table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS user_smoking_status (
                id INT AUTO_INCREMENT PRIMARY KEY,
                UserID INT NOT NULL,
                SmokingStatus ENUM('active', 'quitting', 'quit') NOT NULL DEFAULT 'active',
                CigarettesPerDay INT,
                YearsSmoked INT,
                QuitDate DATE,
                LastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (UserID) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (UserID)
            )
        `);

        // Create password_resets table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS password_resets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL,
                reset_code VARCHAR(6) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 15 MINUTE),
                is_used BOOLEAN DEFAULT FALSE,
                INDEX idx_email_code (email, reset_code),
                INDEX idx_expires_at (expires_at)
            )
        `);

        // Clean up expired records periodically
        setInterval(async () => {
            try {
                await pool.execute('DELETE FROM pending_registrations WHERE expires_at < NOW()');
                await pool.execute('DELETE FROM email_verifications WHERE expires_at < NOW()');
                await pool.execute('DELETE FROM password_resets WHERE expires_at < NOW()');
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
        { userId, id: userId },  // Include both userId and id for compatibility
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, id: userId, type: 'refresh' },  // Include both userId and id for compatibility
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
};

// Format user data for response (remove sensitive info)
const formatUserResponse = (user) => {
    console.log('🔄 Formatting user data for response:', user);
    
    // Ghi log chi tiết cho các trường quan trọng để debug
    console.log('Debug field details:');
    console.log('- id:', user.id);
    console.log('- full_name:', user.full_name);
    console.log('- address:', user.address, typeof user.address);
    console.log('- age:', user.age, typeof user.age);
    console.log('- quit_reason:', user.quit_reason, typeof user.quit_reason);
    console.log('- membership:', user.membership, typeof user.membership);
    
    // Ensure all fields are mapped for frontend and backend compatibility
    const formattedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        full_name: user.full_name,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        role: user.role,
        emailVerified: user.email_verified,
        isActive: user.is_active,
        profile_image: user.profile_image,
        profileImage: user.profile_image,
        // Xử lý đặc biệt cho các trường quan trọng
        quit_reason: user.quit_reason,
        quitReason: user.quit_reason,
        age: user.age !== undefined ? user.age : null,
        address: user.address,
        membership: user.membership || 'free',  // Thêm membership với giá trị mặc định là 'free'
        membershipType: user.membership || 'free',  // Thêm membershipType cho frontend
        createdAt: user.created_at,
        updatedAt: user.updated_at
    };
    
    console.log('✅ Formatted user data:', formattedUser);
    return formattedUser;
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
        // Hỗ trợ đăng nhập bằng email hoặc username
        const { email, username, password } = req.body;
        
        // Xác định username hay email được sử dụng
        const loginIdentifier = email || username;
        console.log('🔑 Login attempt for:', loginIdentifier);
        
        if (!loginIdentifier) {
            return sendError(res, 'Username or email is required', 400);
        }
        
        // Đảm bảo truy vấn lấy tất cả các trường, bao gồm address, age, quit_reason, membership
        const [users] = await pool.execute(
            `SELECT 
                id, username, email, password_hash, full_name, phone, 
                date_of_birth, gender, role, email_verified, is_active,
                profile_image, refresh_token, created_at, updated_at,
                address, age, quit_reason, membership
             FROM users 
             WHERE email = ? OR username = ?`,
            [loginIdentifier, loginIdentifier]
        );

        if (users.length === 0) {
            console.log('❌ User not found:', loginIdentifier);
            return sendError(res, 'Invalid username, email or password', 401);
        }

        const user = users[0];
        console.log('👤 Found user:', { id: user.id, email: user.email });

        if (!user.is_active) {
            console.log('❌ Account deactivated:', user.id);
            return sendError(res, 'Account is deactivated. Please contact support.', 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            console.log('❌ Invalid password for user:', user.id);
            return sendError(res, 'Invalid username, email or password', 401);
        }

        // Tạo tokens
        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        
        // Log token structure for debugging
        console.log('🔐 Generated token structure:', jwt.decode(token));
        
        // Cập nhật thời gian đăng nhập
        await pool.execute(
            'UPDATE users SET updated_at = NOW(), refresh_token = ? WHERE id = ?',
            [refreshToken, user.id]
        );
        
        // Lấy dữ liệu mới nhất của người dùng với tất cả các trường
        console.log('🔄 Fetching updated user data...');
        const [updatedUsers] = await pool.execute(
            `SELECT 
                id, username, email, password_hash, full_name, phone, 
                date_of_birth, gender, role, email_verified, is_active,
                profile_image, refresh_token, created_at, updated_at,
                address, age, quit_reason, membership
             FROM users 
             WHERE id = ?`,
            [user.id]
        );
        
        const updatedUser = updatedUsers[0];
        console.log('📊 User data for response:', {
            id: updatedUser.id,
            name: updatedUser.full_name,
            quit_reason: updatedUser.quit_reason,
            age: updatedUser.age,
            profile_image: updatedUser.profile_image,
            membership: updatedUser.membership // Thêm log membership để debug
        });
        
        // Check if membership exists in the database
        if (updatedUser.membership === undefined || updatedUser.membership === null) {
            console.log('⚠️ Membership field is missing in user data. Adding default value "free"');
            updatedUser.membership = 'free';
        } else {
            console.log('✅ Membership found in user data:', updatedUser.membership);
        }
        
        // Format và trả về dữ liệu
        const formattedUser = formatUserResponse(updatedUser);
        console.log('✅ Login successful for user:', updatedUser.id);
        
        sendSuccess(res, 'Login successful', {
            user: formattedUser,
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
             (username, email, password_hash, full_name, phone, date_of_birth, gender, role, email_verified, is_active, created_at, age, address, quit_reason, membership) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, TRUE, NOW(), ?, ?, ?, ?)`,
            [
                pendingUser.username,
                pendingUser.email,
                pendingUser.password_hash,
                pendingUser.full_name,
                pendingUser.phone,
                pendingUser.date_of_birth,
                pendingUser.gender,
                pendingUser.role || 'user',
                null, // age
                null, // address
                null, // quit_reason
                'free' // membership - mặc định là free cho người dùng mới
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
        );

        console.log('✅ Registration successful');
        sendSuccess(res, 'Email verified and account created successfully', {
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
        console.log('🔍 Getting profile for user ID:', userId);
        
        // Lấy thông tin chi tiết của người dùng với tất cả các trường
        const [users] = await pool.execute(
            `SELECT 
                id, username, email, password_hash, full_name, phone, 
                date_of_birth, gender, role, email_verified, is_active,
                profile_image, refresh_token, created_at, updated_at,
                address, age, quit_reason, membership
             FROM users 
             WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            console.log('❌ User not found:', userId);
            return sendError(res, 'User not found', 404);
        }
        
        const user = users[0];
        console.log('✅ User profile found:', {
            id: user.id,
            name: user.full_name,
            quit_reason: user.quit_reason,
            age: user.age
        });
        
        // Format dữ liệu trước khi trả về
        const formattedUser = formatUserResponse(user);
        sendSuccess(res, 'User profile fetched successfully', formattedUser);
    } catch (error) {
        console.error('❌ Get profile error:', error);
        sendError(res, 'Failed to fetch profile', 500);
    }
};

// Update User Profile
export const updateProfile = async (req, res) => {
    try {
        console.log('📝 Update profile request:', req.body);
        const userId = req.user.id;
        const {
            fullName,
            phone,
            dateOfBirth,
            gender,
            role,
            // Thêm các trường mới
            address,
            age,
            quitReason,
            quit_reason,
            membership
        } = req.body;
        
        // Format age thành số nếu có
        let formattedAge = null;
        if (age !== undefined && age !== null && age !== '') {
            formattedAge = parseInt(age);
            if (isNaN(formattedAge)) formattedAge = null;
        }
        
        // Xử lý quit_reason - ưu tiên quitReason nếu có cả hai
        const finalQuitReason = quitReason !== undefined ? quitReason : quit_reason;
        
        console.log('🔄 Prepared update data:', {
            fullName, phone, dateOfBirth, gender, role,
            address, age: formattedAge, quitReason: finalQuitReason, membership
        });
        
        await pool.execute(
            `UPDATE users SET 
                full_name = ?, 
                phone = ?, 
                date_of_birth = ?, 
                gender = ?, 
                role = ?,
                address = ?,
                age = ?,
                quit_reason = ?,
                membership = ?,
                updated_at = NOW() 
             WHERE id = ?`,
            [
                fullName, 
                phone || null, 
                dateOfBirth || null, 
                gender || null, 
                role || 'user', 
                address || null,
                formattedAge,
                finalQuitReason,
                membership || 'free', // Giữ lại trường membership, mặc định 'free' nếu null
                userId
            ]
        );
        
        // Fetch updated user data to return
        const [updatedUsers] = await pool.execute(
            `SELECT 
                id, username, email, full_name, phone, 
                date_of_birth, gender, role, email_verified, is_active,
                profile_image, created_at, updated_at,
                address, age, quit_reason, membership
             FROM users 
             WHERE id = ?`,
            [userId]
        );
        
        if (updatedUsers.length === 0) {
            return sendError(res, 'User not found after update', 404);
        }
        
        const formattedUser = formatUserResponse(updatedUsers[0]);
        console.log('✅ Profile updated successfully:', formattedUser);

        sendSuccess(res, 'Profile updated successfully', formattedUser);
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

// Forgot Password - Send reset code to email
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return sendError(res, 'Email is required', 400);
        }

        console.log('🔍 Processing forgot password for:', email);

        // Check if user exists
        const [users] = await pool.execute(
            'SELECT id, email, full_name FROM users WHERE email = ? AND is_active = TRUE',
            [email]
        ); if (users.length === 0) {
            // Return error if email doesn't exist
            return sendError(res, 'Email này chưa được đăng ký tài khoản', 404);
        }

        const user = users[0];

        // Generate 6-digit reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();        // Store reset code in database
        const expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Delete any existing reset codes for this email first
        await pool.execute(
            'DELETE FROM password_resets WHERE email = ?',
            [email]
        );

        // Insert new reset code
        await pool.execute(
            `INSERT INTO password_resets (email, reset_code, expires_at)
             VALUES (?, ?, ?)`,
            [email, resetCode, expiredAt]
        );        // Send reset code via email
        console.log('📧 Sending password reset email to:', email);
        await emailService.sendPasswordResetEmail(email, user.full_name, resetCode);

        console.log('✅ Password reset code sent to:', email);
        sendSuccess(res, 'Reset code has been sent to your email', null);

    } catch (error) {
        console.error('❌ Forgot password error:', error);
        console.error('Error stack:', error.stack);
        sendError(res, 'Failed to process forgot password request', 500);
    }
};

// Reset Password - Verify code and set new password
export const resetPassword = async (req, res) => {
    try {
        const { email, resetCode, newPassword } = req.body;

        if (!email || !resetCode || !newPassword) {
            return sendError(res, 'Email, reset code, and new password are required', 400);
        }

        if (newPassword.length < 6) {
            return sendError(res, 'New password must be at least 6 characters long', 400);
        }

        console.log('🔍 Processing password reset for:', email);

        // Verify reset code
        const [resetRecords] = await pool.execute(
            `SELECT id FROM password_resets 
             WHERE email = ? AND reset_code = ? 
             AND expires_at > NOW() AND is_used = FALSE
             ORDER BY created_at DESC
             LIMIT 1`,
            [email, resetCode]
        );

        if (resetRecords.length === 0) {
            return sendError(res, 'Invalid or expired reset code', 400);
        }

        // Check if user still exists and is active
        const [users] = await pool.execute(
            'SELECT id FROM users WHERE email = ? AND is_active = TRUE',
            [email]
        );

        if (users.length === 0) {
            return sendError(res, 'User not found', 404);
        }

        const userId = users[0].id;
        const resetRecordId = resetRecords[0].id;

        // Hash new password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Update user password
            await connection.execute(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                [passwordHash, userId]
            );

            // Mark reset code as used
            await connection.execute(
                'UPDATE password_resets SET is_used = TRUE WHERE id = ?',
                [resetRecordId]
            );

            // Clear any existing refresh tokens for security
            await connection.execute(
                'UPDATE users SET refresh_token = NULL WHERE id = ?',
                [userId]
            );

            await connection.commit();
            console.log('✅ Password reset successfully for user:', userId);

            sendSuccess(res, 'Password has been reset successfully. Please login with your new password.', null);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('❌ Reset password error:', error);
        sendError(res, 'Failed to reset password', 500);
    }
};

// Logout - Clear refresh token
export const logout = async (req, res) => {
    try {
        const userId = req.user.id;

        // Add validation to ensure userId exists
        if (!userId) {
            return sendError(res, 'User ID not found in token', 400);
        }

        // Clear refresh token from database
        await pool.execute(
            'UPDATE users SET refresh_token = NULL WHERE id = ?',
            [userId]
        );

        console.log('✅ User logged out successfully:', userId);
        sendSuccess(res, 'Logged out successfully', null);

    } catch (error) {
        console.error('❌ Logout error:', error);
        sendError(res, 'Failed to logout', 500);
    }
};
