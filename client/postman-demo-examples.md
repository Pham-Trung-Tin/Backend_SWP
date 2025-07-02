# 🔧 Postman Demo Examples cho NoSmoke Project

## 📋 Các API Endpoints đã tạo:

### 1. **POST /api/auth/register** - Đăng ký user mới
```json
Request Body:
{
  "email": "test@example.com",
  "password": "123456",
  "full_name": "Test User",
  "phone": "0123456789",
  "quit_date": "2025-01-01"
}

Response Success (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 3,
      "email": "test@example.com",
      "full_name": "Test User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. **POST /api/auth/login** - Đăng nhập
```json
Request Body:
{
  "email": "test@example.com",
  "password": "123456"
}

Response Success (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 3,
      "email": "test@example.com",
      "full_name": "Test User",
      "quit_date": "2025-01-01"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. **GET /api/auth/profile** - Lấy thông tin profile
```json
Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response Success (200):
{
  "success": true,
  "data": {
    "user": {
      "id": 3,
      "email": "test@example.com",
      "full_name": "Test User",
      "phone": "0123456789",
      "quit_date": "2025-01-01",
      "created_at": "2024-12-19T10:30:00.000Z"
    }
  }
}
```

## 🎯 Tác dụng của Postman:

### 1. **Testing & Debugging:**
- Kiểm tra API có hoạt động đúng không
- Test các trường hợp lỗi (sai password, email trùng, v.v.)
- Debug khi frontend gặp lỗi

### 2. **Development Workflow:**
```
1. Viết API backend ✅
2. Test với Postman ✅
3. Tích hợp vào frontend ✅
4. Deploy production 🔄
```

### 3. **Documentation:**
- Lưu trữ tất cả API endpoints
- Chia sẻ với team members
- Tạo tài liệu API cho frontend developers

### 4. **Environment Management:**
```
Development: http://localhost:3001
Production: https://your-api.com
```

## 🔍 Ví dụ sử dụng thực tế:

### Scenario 1: User đăng ký tài khoản mới
```
1. Frontend gửi form đăng ký
2. Postman test: POST /api/auth/register
3. Backend lưu vào MySQL database
4. Trả về JWT token
5. Frontend lưu token và chuyển trang
```

### Scenario 2: User đăng nhập
```
1. Frontend gửi email/password
2. Postman test: POST /api/auth/login
3. Backend kiểm tra trong MySQL
4. Trả về user info + token
5. Frontend cập nhật AuthContext
```

### Scenario 3: Debug lỗi
```
1. Frontend báo lỗi "Cannot login"
2. Dùng Postman test API trực tiếp
3. Kiểm tra response, status code
4. Fix bug trong backend
5. Test lại với Postman
```
