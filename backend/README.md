# NoSmoke Backend API

Backend API cho ứng dụng NoSmoke - Hỗ trợ cai thuốc lá

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- NPM hoặc Yarn

### Installation

1. **Cài đặt dependencies:**
```bash
cd backend
npm install
```

2. **Cấu hình database:**
- Đảm bảo MySQL đang chạy
- Database `nosmoke_db` đã được tạo
- Cập nhật thông tin database trong `.env`

3. **Chạy backend:**
```bash
npm run dev
```

Backend sẽ chạy tại: `http://localhost:3000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Đăng ký user mới | ❌ |
| POST | `/api/auth/login` | Đăng nhập | ❌ |
| GET | `/api/auth/profile` | Lấy thông tin profile | ✅ |
| PUT | `/api/auth/profile` | Cập nhật profile | ✅ |
| POST | `/api/auth/change-password` | Đổi mật khẩu | ✅ |
| POST | `/api/auth/logout` | Đăng xuất | ✅ |
| POST | `/api/auth/refresh-token` | Làm mới token | ❌ |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Kiểm tra server status |

## 🔧 Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nosmoke_db

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

## 📝 Request/Response Examples

### POST `/api/auth/register`
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "fullName": "Test User",
  "phone": "0123456789",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```

### POST `/api/auth/login`
```json
{
  "email": "test@example.com",
  "password": "Password123!"
}
```

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "user": {...},
    "token": "jwt_token_here"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔒 Security Features

- JWT authentication
- Password hashing với bcrypt
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention

## 🛠️ Development

### Scripts
```bash
npm run dev     # Development với nodemon
npm start       # Production
```

### Database Schema
Database sử dụng các bảng:
- `smoker` - Thông tin user
- `smokingstatus` - Trạng thái cai thuốc
- `quitsmokingplan` - Kế hoạch cai thuốc
- `progress` - Tiến trình hàng ngày
- ... (và các bảng khác)

## 📊 API Testing

Sử dụng Postman với collection đã setup:
- Import environment: `NoSmoke Development`
- Base URL: `http://localhost:3000/api`
- Auth sẽ tự động lưu token

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Kiểm tra MySQL service
services.msc → tìm MySQL93 → Start

# Test connection
mysql -u root -p
```

### CORS Issues
- Kiểm tra `ALLOWED_ORIGINS` trong `.env`
- Frontend phải chạy trên port được allow

### Token Issues
- Token expires sau 24h
- Sử dụng refresh token để gia hạn
