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

        // Add membership columns
        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN membership VARCHAR(50) DEFAULT 'free'
            `);
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('membership column error:', error.message);
            }
        }
        
        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN membership_type VARCHAR(50) DEFAULT 'free'
            `);
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('membership_type column error:', error.message);
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
        membership: user.membership || 'free', // Include membership field
        membershipType: user.membership_type || user.membership || 'free', // Include membership_type field
        avatar: user.profile_image, // Include avatar/profile image
        createdAt: user.created_at,
        updatedAt: user.updated_at
    };
};

// Register User - Step 1: Create pending registration
export const register = async (req, res) => {
    try {
        console.log('\n� ═══════════════════════════════════════');
        console.log('�📝  NEW REGISTRATION REQUEST');
        console.log('👤 ═══════════════════════════════════════');
        console.log('📧  Email:', req.body.email);
        console.log('👤  Username:', req.body.username);
        console.log('🏷️  Full Name:', req.body.fullName);

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
            console.log('❌  Validation Failed: Missing required fields\n');
            return sendError(res, 'Username, email, and password are required', 400);
        }

        console.log('🔍  Checking existing users...');
        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            console.log('❌  User already exists');
            console.log('👤 ═══════════════════════════════════════\n');
            return sendError(res, 'User with this email or username already exists', 409);
        }

        console.log('🔍  Checking pending registrations...');
        // Check pending registrations
        const [pendingUsers] = await pool.execute(
            'SELECT id FROM pending_registrations WHERE email = ? OR username = ?',
            [email, username]
        );

        if (pendingUsers.length > 0) {
            console.log('⚠️   Found existing pending registration');
            console.log('🧹  Cleaning up previous registration...');
            // Delete existing pending registration and verification codes for this email/username
            await pool.execute('DELETE FROM pending_registrations WHERE email = ? OR username = ?', [email, username]);
            await pool.execute('DELETE FROM email_verifications WHERE email = ?', [email]);
            console.log('✅  Cleanup completed');
        }

        console.log('🔐  Hashing password...');
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        console.log('💾  Creating pending registration...');
        // Create pending registration
        await pool.execute(
            `INSERT INTO pending_registrations 
             (username, email, password_hash, full_name, phone, date_of_birth, gender, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [username, email, hashedPassword, fullName, phone || null, dateOfBirth || null, gender || null, role || 'user']
        );

        console.log('🎲  Generating verification code...');
        // Generate verification code and send via email
        const verificationCode = emailService.generateVerificationCode();

        console.log('📧  Sending verification email...');
        try {
            await emailService.sendVerificationEmail(email, fullName, verificationCode);
            console.log('✅  Verification email sent successfully');
        } catch (emailError) {
            console.error('❌  Email failed:', emailError.message);
            // For development, continue without email but log the code
            console.log(`🔧  Development Code: ${verificationCode}`);
        }

        console.log('✅  Registration process completed');
        console.log('👤 ═══════════════════════════════════════\n');

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
        console.log('\n🔐 ═══════════════════════════════════════');
        console.log('🚪  LOGIN REQUEST');
        console.log('🔐 ═══════════════════════════════════════');

        const { email, password } = req.body;
        console.log('📧  Email/Username:', email);

        console.log('🔍  Finding user account...');
        // Check if login input is email or username
        const [users] = await pool.execute(
            `SELECT * FROM users WHERE email = ? OR username = ?`,
            [email, email]
        );

        if (users.length === 0) {
            console.log('❌  User not found');
            console.log('🔐 ═══════════════════════════════════════\n');
            return sendError(res, 'Invalid email/username or password', 401);
        }

        const user = users[0];
        console.log('✅  User found:', user.username);
        console.log('🔍  Account Status:', user.is_active ? 'Active' : 'Inactive');

        if (!user.is_active) {
            console.log('❌  Account is deactivated');
            console.log('🔐 ═══════════════════════════════════════\n');
            return sendError(res, 'Account is deactivated. Please contact support.', 401);
        }

        console.log('🔑  Verifying password...');
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            console.log('❌  Invalid password');
            console.log('🔐 ═══════════════════════════════════════\n');
            return sendError(res, 'Invalid email or password', 401);
        }

        console.log('✅  Password verified');
        console.log('🎫  Generating authentication tokens...');

        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        console.log('📝  Updating user last login...');
        await pool.execute(
            'UPDATE users SET updated_at = NOW() WHERE id = ?',
            [user.id]
        );

        console.log('✅  Login successful');
        console.log('🎉  Welcome back:', user.username);
        console.log('🔐 ═══════════════════════════════════════\n');

        sendSuccess(res, 'Login successful', {
            user: formatUserResponse(user),
            token,
            refreshToken
        });
    } catch (error) {
        console.log('\n❌ ═══════════════════════════════════════');
        console.log('💥  LOGIN ERROR');
        console.log('❌ ═══════════════════════════════════════');
        console.error('🚨  Error:', error.message);
        console.log('❌ ═══════════════════════════════════════\n');
        sendError(res, 'Login failed. Please try again.', 500);
    }
};

// Verify Email (simple version)
export const verifyEmail = async (req, res) => {
    try {
        console.log('\n✉️  ═══════════════════════════════════════');
        console.log('🔍  EMAIL VERIFICATION REQUEST');
        console.log('✉️  ═══════════════════════════════════════');

        const { email, verificationCode } = req.body;
        console.log('📧  Email:', email);
        console.log('🔢  Code:', verificationCode);

        // Validation
        if (!email || !verificationCode) {
            console.log('❌  Missing email or verification code');
            console.log('✉️  ═══════════════════════════════════════\n');
            return sendError(res, 'Email and verification code are required', 400);
        }

        console.log('🔍  Verifying code...');
        // Check if verification code is valid using emailService
        const isCodeValid = await emailService.verifyCode(email, verificationCode);

        if (!isCodeValid) {
            console.log('❌  Invalid or expired verification code');
            console.log('✉️  ═══════════════════════════════════════\n');
            return sendError(res, 'Invalid or expired verification code', 400);
        }

        console.log('✅  Code verified successfully');
        console.log('🔍  Finding pending registration...');

        // Get pending registration data
        const [pendingRegistrations] = await pool.execute(
            'SELECT * FROM pending_registrations WHERE email = ? AND expires_at > NOW()',
            [email]
        );

        if (pendingRegistrations.length === 0) {
            console.log('❌  No pending registration found');
            console.log('✉️  ═══════════════════════════════════════\n');
            return sendError(res, 'No pending registration found or registration expired', 400);
        }

        const pendingUser = pendingRegistrations[0];
        console.log('✅  Pending registration found');
        console.log('👤  Username:', pendingUser.username);

        console.log('📝  Creating user account...');
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
        console.log('✅  User account created (ID:', userId + ')');

        console.log('🧹  Cleaning up verification records...');
        // Mark verification as completed
        await pool.execute(
            'UPDATE email_verifications SET verified = TRUE WHERE email = ? AND verification_code = ?',
            [email, verificationCode]
        );

        // Clean up pending registration and verification records
        await pool.execute('DELETE FROM pending_registrations WHERE email = ?', [email]);
        await pool.execute('DELETE FROM email_verifications WHERE email = ?', [email]);

        console.log('🔑  Generating authentication tokens...');
        // Generate JWT tokens
        const accessToken = generateToken(userId);
        const refreshToken = generateRefreshToken(userId);

        // Store refresh token
        await pool.execute(
            'UPDATE users SET refresh_token = ? WHERE id = ?',
            [refreshToken, userId]
        );

        console.log('✅  Registration completed successfully');
        console.log('🎉  Welcome user:', pendingUser.username);
        console.log('✉️  ═══════════════════════════════════════\n');
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
        console.log('\n📮 ═══════════════════════════════════════');
        console.log('🔄  RESEND VERIFICATION CODE');
        console.log('📮 ═══════════════════════════════════════');

        const { email } = req.body;
        console.log('📧  Email:', email);

        if (!email) {
            console.log('❌  Email is required');
            console.log('📮 ═══════════════════════════════════════\n');
            return sendError(res, 'Email is required', 400);
        }

        console.log('🔍  Checking pending registration...');
        // Check if there's a pending registration for this email
        const [pendingRegistrations] = await pool.execute(
            'SELECT * FROM pending_registrations WHERE email = ? AND expires_at > NOW()',
            [email]
        );

        if (pendingRegistrations.length === 0) {
            console.log('❌  No valid pending registration found');
            console.log('📮 ═══════════════════════════════════════\n');
            return sendError(res, 'No pending registration found for this email or registration expired. Please register again.', 400);
        }

        const pendingUser = pendingRegistrations[0];
        console.log('✅  Pending registration found');
        console.log('👤  User:', pendingUser.username);

        console.log('🧹  Clearing old verification codes...');
        // Delete old verification codes for this email
        await pool.execute('DELETE FROM email_verifications WHERE email = ?', [email]);

        console.log('🎲  Generating new verification code...');
        // Generate new verification code
        const verificationCode = emailService.generateVerificationCode();

        console.log('📧  Sending new verification email...');
        // Send verification email (this will also store the code)
        try {
            await emailService.sendVerificationEmail(email, pendingUser.full_name, verificationCode);
            console.log('✅  Verification email resent successfully');
        } catch (emailError) {
            console.error('❌  Email sending failed:', emailError.message);
            console.log(`🔧  Development Code: ${verificationCode}`);
        }

        console.log('✅  Resend process completed');
        console.log('📮 ═══════════════════════════════════════\n');

        sendSuccess(res, 'New verification code sent to your email', {
            email: email,
            message: 'Please check your email for the new verification code',
            verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
        });

    } catch (error) {
        console.log('\n❌ ═══════════════════════════════════════');
        console.log('💥  RESEND VERIFICATION ERROR');
        console.log('❌ ═══════════════════════════════════════');
        console.error('🚨  Error:', error.message);
        console.log('❌ ═══════════════════════════════════════\n');
        sendError(res, 'Failed to resend verification code', 500);
    }
};

// Get User Profile
export const getProfile = async (req, res) => {
    try {
        console.log('\n👤 ═══════════════════════════════════════');
        console.log('📋  GET USER PROFILE');
        console.log('👤 ═══════════════════════════════════════');

        const userId = req.user.id;
        console.log('🆔  User ID:', userId);

        console.log('🔍  Fetching user profile...');
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            console.log('❌  User not found');
            console.log('👤 ═══════════════════════════════════════\n');
            return sendError(res, 'User not found', 404);
        }

        const user = users[0];
        console.log('✅  Profile found');
        console.log('👤  Username:', user.username);
        console.log('📧  Email:', user.email);
        console.log('🏷️  Role:', user.role);
        console.log('👤 ═══════════════════════════════════════\n');

        sendSuccess(res, 'User profile fetched successfully', formatUserResponse(user));
    } catch (error) {
        console.log('\n❌ ═══════════════════════════════════════');
        console.log('💥  GET PROFILE ERROR');
        console.log('❌ ═══════════════════════════════════════');
        console.error('🚨  Error:', error.message);
        console.log('❌ ═══════════════════════════════════════\n');
        sendError(res, 'Failed to fetch profile', 500);
    }
};

// Update User Profile
export const updateProfile = async (req, res) => {
    try {
        console.log('\n✏️  ═══════════════════════════════════════');
        console.log('📝  UPDATE USER PROFILE');
        console.log('✏️  ═══════════════════════════════════════');

        const userId = req.user.id;
        const { fullName, phone, dateOfBirth, gender, role } = req.body;

        console.log('🆔  User ID:', userId);
        console.log('📝  Updates:');
        console.log('    🏷️  Full Name:', fullName);
        console.log('    📞  Phone:', phone);
        console.log('    📅  DOB:', dateOfBirth);
        console.log('    ⚧️   Gender:', gender);
        console.log('    🏆  Role:', role);

        console.log('💾  Updating profile...');
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

        console.log('✅  Profile updated successfully');
        console.log('✏️  ═══════════════════════════════════════\n');

        sendSuccess(res, 'Profile updated successfully');
    } catch (error) {
        console.log('\n❌ ═══════════════════════════════════════');
        console.log('💥  UPDATE PROFILE ERROR');
        console.log('❌ ═══════════════════════════════════════');
        console.error('🚨  Error:', error.message);
        console.log('❌ ═══════════════════════════════════════\n');
        sendError(res, 'Failed to update profile', 500);
    }
};

// Change Password
export const changePassword = async (req, res) => {
    try {
        console.log('\n🔐 ═══════════════════════════════════════');
        console.log('🔑  CHANGE PASSWORD');
        console.log('🔐 ═══════════════════════════════════════');

        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        console.log('🆔  User ID:', userId);
        console.log('🔍  Validating current password...');

        // Get current password hash
        const [users] = await pool.execute(
            'SELECT password_hash FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            console.log('❌  User not found');
            console.log('🔐 ═══════════════════════════════════════\n');
            return sendError(res, 'User not found', 404);
        }

        console.log('🔑  Verifying current password...');
        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!isPasswordValid) {
            console.log('❌  Current password is incorrect');
            console.log('🔐 ═══════════════════════════════════════\n');
            return sendError(res, 'Current password is incorrect', 401);
        }

        console.log('✅  Current password verified');
        console.log('🔐  Hashing new password...');
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        console.log('💾  Updating password...');
        // Update password
        await pool.execute(
            'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
            [hashedPassword, userId]
        );

        console.log('✅  Password changed successfully');
        console.log('🔐 ═══════════════════════════════════════\n');

        sendSuccess(res, 'Password changed successfully');
    } catch (error) {
        console.log('\n❌ ═══════════════════════════════════════');
        console.log('💥  CHANGE PASSWORD ERROR');
        console.log('❌ ═══════════════════════════════════════');
        console.error('🚨  Error:', error.message);
        console.log('❌ ═══════════════════════════════════════\n');
        sendError(res, 'Failed to change password', 500);
    }
};

// Refresh Token
export const refreshToken = async (req, res) => {
    try {
        console.log('\n🔄 ═══════════════════════════════════════');
        console.log('🎫  REFRESH TOKEN');
        console.log('🔄 ═══════════════════════════════════════');

        const { refreshToken } = req.body;
        console.log('🔍  Verifying refresh token...');

        if (!refreshToken) {
            console.log('❌  Refresh token is required');
            console.log('🔄 ═══════════════════════════════════════\n');
            return sendError(res, 'Refresh token is required', 401);
        }

        console.log('🔑  Decoding token...');
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        if (decoded.type !== 'refresh') {
            console.log('❌  Invalid refresh token type');
            console.log('🔄 ═══════════════════════════════════════\n');
            return sendError(res, 'Invalid refresh token', 401);
        }

        console.log('✅  Token decoded successfully');
        console.log('🆔  User ID:', decoded.userId);
        console.log('🔍  Verifying user status...');

        // Check if user still exists and is active
        const [users] = await pool.execute(
            'SELECT id FROM users WHERE id = ? AND is_active = true',
            [decoded.userId]
        );

        if (users.length === 0) {
            console.log('❌  User not found or account deactivated');
            console.log('🔄 ═══════════════════════════════════════\n');
            return sendError(res, 'User not found or account deactivated', 401);
        }

        console.log('✅  User verified');
        console.log('🎫  Generating new tokens...');

        const newToken = generateToken(decoded.userId);
        const newRefreshToken = generateRefreshToken(decoded.userId);

        console.log('✅  New tokens generated successfully');
        console.log('🔄 ═══════════════════════════════════════\n');

        sendSuccess(res, 'Token refreshed successfully', {
            token: newToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.log('\n❌ ═══════════════════════════════════════');
        console.log('💥  REFRESH TOKEN ERROR');
        console.log('❌ ═══════════════════════════════════════');

        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            console.log('🚨  Invalid or expired token');
            console.log('❌ ═══════════════════════════════════════\n');
            return sendError(res, 'Invalid or expired refresh token', 401);
        }

        console.error('🚨  Error:', error.message);
        console.log('❌ ═══════════════════════════════════════\n');
        sendError(res, 'Failed to refresh token', 500);
    }
};

// Forgot Password - Send reset code to email
export const forgotPassword = async (req, res) => {
    try {
        console.log('\n🔐 ═══════════════════════════════════════');
        console.log('📧  FORGOT PASSWORD REQUEST');
        console.log('🔐 ═══════════════════════════════════════');

        const { email } = req.body;
        console.log('📧  Email:', email);

        if (!email) {
            console.log('❌  Email is required');
            console.log('🔐 ═══════════════════════════════════════\n');
            return sendError(res, 'Email is required', 400);
        }

        console.log('🔍  Checking user account...');
        // Check if user exists
        const [users] = await pool.execute(
            'SELECT id, email, full_name FROM users WHERE email = ? AND is_active = TRUE',
            [email]
        );

        if (users.length === 0) {
            console.log('❌  Email not found or account inactive');
            console.log('🔐 ═══════════════════════════════════════\n');
            // Return error if email doesn't exist
            return sendError(res, 'Email này chưa được đăng ký tài khoản', 404);
        }

        const user = users[0];
        console.log('✅  User found:', user.full_name);
        console.log('🎲  Generating reset code...');

        // Generate 6-digit reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Store reset code in database
        const expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        console.log('🧹  Cleaning old reset codes...');
        // Delete any existing reset codes for this email first
        await pool.execute(
            'DELETE FROM password_resets WHERE email = ?',
            [email]
        );

        console.log('💾  Storing new reset code...');
        // Insert new reset code
        await pool.execute(
            `INSERT INTO password_resets (email, reset_code, expires_at)
             VALUES (?, ?, ?)`,
            [email, resetCode, expiredAt]
        );

        console.log('📧  Sending password reset email...');
        // Send reset code via email
        try {
            await emailService.sendPasswordResetEmail(email, user.full_name, resetCode);
            console.log('✅  Password reset email sent successfully');
        } catch (emailError) {
            console.error('❌  Email sending failed:', emailError.message);
            console.log(`🔧  Development Code: ${resetCode}`);
        }

        console.log('✅  Password reset request processed');
        console.log('🔐 ═══════════════════════════════════════\n');

        sendSuccess(res, 'Reset code has been sent to your email', {
            message: 'Please check your email for the reset code',
            resetCode: process.env.NODE_ENV === 'development' ? resetCode : undefined
        });

    } catch (error) {
        console.log('\n❌ ═══════════════════════════════════════');
        console.log('💥  FORGOT PASSWORD ERROR');
        console.log('❌ ═══════════════════════════════════════');
        console.error('🚨  Error:', error.message);
        console.error('📋  Stack:', error.stack);
        console.log('❌ ═══════════════════════════════════════\n');
        sendError(res, 'Failed to process forgot password request', 500);
    }
};

// Reset Password - Verify code and set new password
export const resetPassword = async (req, res) => {
    try {
        console.log('\n🔐 ═══════════════════════════════════════');
        console.log('🔑  RESET PASSWORD');
        console.log('🔐 ═══════════════════════════════════════');

        const { email, resetCode, newPassword } = req.body;
        console.log('📧  Email:', email);
        console.log('🔢  Reset Code:', resetCode);

        if (!email || !resetCode || !newPassword) {
            console.log('❌  Missing required fields');
            console.log('🔐 ═══════════════════════════════════════\n');
            return sendError(res, 'Email, reset code, and new password are required', 400);
        }

        if (newPassword.length < 6) {
            console.log('❌  Password too short');
            console.log('🔐 ═══════════════════════════════════════\n');
            return sendError(res, 'New password must be at least 6 characters long', 400);
        }

        console.log('🔍  Verifying reset code...');
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
            console.log('❌  Invalid or expired reset code');
            console.log('🔐 ═══════════════════════════════════════\n');
            return sendError(res, 'Invalid or expired reset code', 400);
        }

        console.log('✅  Reset code verified');
        console.log('🔍  Checking user account...');

        // Check if user still exists and is active
        const [users] = await pool.execute(
            'SELECT id FROM users WHERE email = ? AND is_active = TRUE',
            [email]
        );

        if (users.length === 0) {
            console.log('❌  User not found or inactive');
            console.log('🔐 ═══════════════════════════════════════\n');
            return sendError(res, 'User not found', 404);
        }

        const userId = users[0].id;
        const resetRecordId = resetRecords[0].id;

        console.log('✅  User account verified');
        console.log('🔐  Hashing new password...');

        // Hash new password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        console.log('💾  Starting database transaction...');
        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            console.log('📝  Updating user password...');
            // Update user password
            await connection.execute(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                [passwordHash, userId]
            );

            console.log('✅  Marking reset code as used...');
            // Mark reset code as used
            await connection.execute(
                'UPDATE password_resets SET is_used = TRUE WHERE id = ?',
                [resetRecordId]
            );

            console.log('🔒  Clearing refresh tokens for security...');
            // Clear any existing refresh tokens for security
            await connection.execute(
                'UPDATE users SET refresh_token = NULL WHERE id = ?',
                [userId]
            );

            await connection.commit();
            console.log('✅  Password reset completed successfully');
            console.log('👤  User ID:', userId);
            console.log('🔐 ═══════════════════════════════════════\n');

            sendSuccess(res, 'Password has been reset successfully. Please login with your new password.', null);

        } catch (error) {
            await connection.rollback();
            console.log('🔄  Transaction rolled back');
            throw error;
        } finally {
            connection.release();
            console.log('📤  Database connection released');
        }

    } catch (error) {
        console.log('\n❌ ═══════════════════════════════════════');
        console.log('💥  RESET PASSWORD ERROR');
        console.log('❌ ═══════════════════════════════════════');
        console.error('🚨  Error:', error.message);
        console.log('❌ ═══════════════════════════════════════\n');
        sendError(res, 'Failed to reset password', 500);
    }
};

// Logout - Clear refresh token
export const logout = async (req, res) => {
    try {
        console.log('\n🚪 ═══════════════════════════════════════');
        console.log('👋  LOGOUT REQUEST');
        console.log('🚪 ═══════════════════════════════════════');

        const userId = req.user.id;
        console.log('🆔  User ID:', userId);

        // Add validation to ensure userId exists
        if (!userId) {
            console.log('❌  User ID not found in token');
            console.log('🚪 ═══════════════════════════════════════\n');
            return sendError(res, 'User ID not found in token', 400);
        }

        console.log('🔒  Clearing refresh token...');
        // Clear refresh token from database
        await pool.execute(
            'UPDATE users SET refresh_token = NULL WHERE id = ?',
            [userId]
        );

        console.log('✅  User logged out successfully');
        console.log('👋  Goodbye user:', userId);
        console.log('🚪 ═══════════════════════════════════════\n');

        sendSuccess(res, 'Logged out successfully', null);

    } catch (error) {
        console.log('\n❌ ═══════════════════════════════════════');
        console.log('💥  LOGOUT ERROR');
        console.log('❌ ═══════════════════════════════════════');
        console.error('🚨  Error:', error.message);
        console.log('❌ ═══════════════════════════════════════\n');
        sendError(res, 'Failed to logout', 500);
    }
};
