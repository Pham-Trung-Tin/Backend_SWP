# NoSmoke Backend API

A comprehensive backend service for the NoSmoke application - helping people quit smoking.

## Features

- 🔐 User authentication with JWT tokens
- 📧 Email verification system
- 👤 User profile management
- 🚭 Smoking tracking and progress monitoring
- 💰 Membership system (free/premium)
- 🏥 Health score tracking

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env`
   - Update database and email configurations

3. **Start the server**
   ```bash
   npm start
   ```

4. **Health Check**
   Visit: `http://localhost:5000/health`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/resend-verification` - Resend verification code

### User Management
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

## Database

Uses MySQL with Railway hosting. Tables are automatically created on startup:
- `smoker` - User accounts
- `pending_registrations` - Users awaiting email verification
- `email_verifications` - Email verification codes
- `smokingstatus` - User smoking progress and statistics

## Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email (Gmail SMTP)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password

# Server
PORT=5000
NODE_ENV=production
```

## Development

- Uses ES6 modules
- Automatic table creation on startup
- Comprehensive error handling and logging
- Rate limiting for security
- CORS configured for frontend integration

## Tech Stack

- Node.js + Express.js
- MySQL with mysql2
- JWT for authentication
- Nodemailer for emails
- bcryptjs for password hashing
- express-validator for input validation
