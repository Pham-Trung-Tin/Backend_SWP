# 📧 Email Verification Setup Guide

## 🔧 Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install nodemailer
```

### 2. Database Setup
Run the SQL script to create required tables:
```sql
-- Run this in your MySQL database
source backend/database/email_verification.sql
```

Or manually create tables:
```sql
-- Table for pending registrations
CREATE TABLE IF NOT EXISTS pending_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Table for verification codes
CREATE TABLE IF NOT EXISTS email_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    expired_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email)
);

-- Add email_verified column to smoker table
ALTER TABLE smoker ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and update values:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CLIENT_URL=http://localhost:5173
```

### 4. Gmail Setup (Recommended)
1. Enable 2-Factor Authentication in your Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an App Password for "Mail"
4. Use this app password in `EMAIL_PASSWORD` (not your regular Gmail password)

### 5. Start Backend Server
```bash
npm run dev
```

## 🎨 Frontend Setup

### 1. New Routes Added
- `/verify-email` - Email verification page
- Automatic redirect from `/register` after successful registration

### 2. Updated Components
- `Register.jsx` - Now redirects to verification page
- `AuthContext.jsx` - Added email verification functions
- `EmailVerification.jsx` - New verification component

### 3. No Additional Dependencies Required
All frontend features use existing React Router and fetch API.

## 🚀 How It Works

### Registration Flow:
1. **User fills registration form** → `Register.jsx`
2. **Form submitted** → `AuthContext.register()`
3. **API call** → `POST /api/auth/register`
4. **Backend generates 6-digit code** → Stored in database
5. **Email sent** → Using nodemailer
6. **User redirected** → `/verify-email` page
7. **User enters code** → `EmailVerification.jsx`
8. **Code verified** → `POST /api/auth/verify-email`
9. **Account created** → User data moved to `smoker` table
10. **Login automatically** → User authenticated

### API Endpoints:
```
POST /api/auth/register          - Send verification code
POST /api/auth/verify-email      - Verify code and create account
POST /api/auth/resend-verification - Resend verification code
```

## 🔧 Testing

### 1. Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "confirmPassword": "password123"
  }'
```

### 2. Test Verification
```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "verificationCode": "123456"
  }'
```

## 🛠️ Troubleshooting

### Email Not Sending
1. Check Gmail app password is correct
2. Verify EMAIL_USER and EMAIL_PASSWORD in .env
3. Check console logs for nodemailer errors
4. Try different email service if needed

### Database Errors
1. Ensure all tables are created
2. Check database connection
3. Verify user permissions

### Frontend Issues
1. Check API_BASE_URL in AuthContext
2. Verify routes are properly configured
3. Check browser console for errors

## 📱 Features

### ✅ Implemented
- 6-digit verification codes
- 10-minute expiration
- Resend functionality with cooldown
- Responsive UI design
- Error handling
- Welcome email after verification
- Automatic cleanup of expired codes

### 🔮 Future Enhancements
- SMS verification option
- Multiple email providers
- Email templates customization
- Admin panel for verification management
- Rate limiting per email
- Internationalization

## 🎯 Security Features
- Codes expire after 10 minutes
- One-time use codes
- Rate limiting on endpoints
- Secure password hashing
- Input validation
- CSRF protection
- XSS prevention
