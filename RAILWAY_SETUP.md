# 🚂 Railway Database Setup Guide

## 📋 Tổng quan

Hướng dẫn này giúp bạn setup Railway MySQL database cho dự án NoSmoke một cách nhanh chóng và hiệu quả.

## 🔧 Bước 1: Setup Railway Project

### 1.1 Tạo Railway Account
1. Truy cập [railway.app](https://railway.app)
2. Đăng ký/đăng nhập với GitHub
3. Tạo project mới

### 1.2 Thêm MySQL Service
1. Trong project dashboard, click "New Service"
2. Chọn "Database" → "Add MySQL"
3. Railway sẽ tự động tạo MySQL instance

### 1.3 Lấy Connection String
1. Click vào MySQL service
2. Chuyển sang tab "Connect"
3. Copy **Connection URL** (dạng: `mysql://username:password@host:port/database`)

## 🔧 Bước 2: Cấu hình Backend

### 2.1 Cập nhật .env
Tạo file `.env` từ `.env.example`:

```env
# Railway MySQL Connection (Recommended)
DATABASE_URL=mysql://root:password@containers-us-west-xxx.railway.app:3306/railway

# Alternative individual parameters
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-railway-password
DB_NAME=railway

# Other configurations...
JWT_SECRET=your-jwt-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CLIENT_URL=http://localhost:5173
```

### 2.2 Install Dependencies
```bash
cd backend
npm install
```

## 🗄️ Bước 3: Setup Database Schema

### Phương pháp 1: Automatic Setup (Recommended)
```bash
npm run setup-db
```

Script này sẽ:
- ✅ Kết nối tới Railway database
- ✅ Tạo tất cả tables cần thiết
- ✅ Insert sample data (coaches, achievements, packages)
- ✅ Tạo admin user mặc định
- ✅ Hiển thị thông tin database

### Phương pháp 2: Manual Setup với DBeaver

#### 3.1 Kết nối DBeaver
1. Mở DBeaver
2. New Connection → MySQL
3. Nhập thông tin từ Railway:
   - **Host**: containers-us-west-xxx.railway.app
   - **Port**: 3306
   - **Database**: railway
   - **Username**: root
   - **Password**: [từ Railway Variables]
4. **Quan trọng**: Enable SSL trong Advanced settings

#### 3.2 Chạy Schema Script
1. Mở file `backend/database/railway_schema.sql` trong DBeaver
2. Execute toàn bộ script (Ctrl+Alt+X)
3. Kiểm tra tables đã được tạo

## 🚀 Bước 4: Test Connection

### 4.1 Start Backend
```bash
npm run dev
```

Bạn sẽ thấy:
```
✅ Database connected successfully
📍 Connected to Railway MySQL via connection string
🌐 Database host: containers-us-west-xxx.railway.app
🔍 Database test query successful
🚀 NoSmoke API Server running on port 3000
```

### 4.2 Test API Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Test registration
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

## 📊 Bước 5: Verify Database

### 5.1 Kiểm tra Tables
```sql
-- Trong DBeaver, chạy:
SHOW TABLES;

-- Kiểm tra sample data
SELECT COUNT(*) FROM coach;
SELECT COUNT(*) FROM achievement;
SELECT COUNT(*) FROM package;
```

### 5.2 Admin User
Sau khi chạy setup script, bạn có thể đăng nhập với:
- **Email**: admin@nosmoke.com
- **Password**: admin123

⚠️ **Quan trọng**: Đổi password admin sau lần đăng nhập đầu!

## 🔧 Troubleshooting

### ❌ Connection Failed
```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user
```
**Giải pháp**: 
- Kiểm tra Railway Variables tab để có username/password chính xác
- Đảm bảo SSL được enable

### ❌ SSL Connection Error
```
Error: ER_SSL_CONNECTION_ERROR
```
**Giải pháp**:
- Thêm `ssl: { rejectUnauthorized: false }` trong database config
- Hoặc sử dụng CONNECTION_URL thay vì individual parameters

### ❌ Table Already Exists
```
Error: Table 'smoker' already exists
```
**Giải pháp**: 
- Bình thường, script sử dụng `CREATE TABLE IF NOT EXISTS`
- Có thể ignore error này

### ❌ Railway Service Down
**Giải pháp**:
- Kiểm tra Railway dashboard
- Service có thể sleep sau period không hoạt động
- Thử kết nối lại để wake up service

## 🌐 Environment Variables cần thiết

```env
# Database (Railway)
DATABASE_URL=mysql://user:pass@host:port/db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5
```

## 📋 Database Schema Overview

### Core Tables:
- `smoker` - Users/customers
- `smokingstatus` - Smoking tracking data
- `coach` - Healthcare professionals
- `appointment` - Booking appointments

### Email Verification:
- `pending_registrations` - Temp user data
- `email_verifications` - 6-digit codes

### Plans & Progress:
- `quitsmokingplan` - Quit smoking plans
- `progress` - Daily tracking

### Community:
- `achievement` - Gamification
- `community_post` - User posts
- `blog_post` - Educational content

### Business:
- `package` - Subscription plans
- `feedback` - Reviews and ratings

## 🎯 Next Steps

1. ✅ Railway database setup
2. ✅ Backend API running
3. 🔄 Frontend connection
4. 🔄 Email service setup (Gmail)
5. 🔄 Deploy to production

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra Railway service status
2. Verify .env configuration
3. Check DBeaver connection
4. Review backend console logs

**Happy coding! 🚀**
