# API Documentation - Auth Routes

## Summary of Recent Updates ✅

### Frontend Navigation Updates:
- **After Login**: Now redirects to **home page** (`/`) instead of profile page
- **After Registration**: Now redirects to **home page** (`/`) instead of profile page  
- **After Booking Appointment**: Now redirects to **home page** (`/`) instead of profile page
- **CSS Theme**: Forgot Password page now uses **blue color scheme** instead of purple
- **Remember Me**: Fully implemented - supports persistent login across browser sessions

### Files Updated:
- `Login.jsx` - Changed redirect destination to home
- `Register.jsx` - Changed redirect destination to home  
- `LoginModal.jsx` - Changed redirect destination to home
- `BookAppointment.jsx` - Changed redirect destination to home
- `ForgotPassword.css` - Changed color scheme to blue
- `AuthContext.jsx` - Added full remember me support with localStorage

---

## 1. POST /api/auth/refresh-token

Tạo lại access token mới từ refresh token.

### Request
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response
**Success (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "data": null
}
```

---

## 2. POST /api/auth/forgot-password

Gửi mã đặt lại mật khẩu 6 chữ số về email người dùng.

### Request
```json
{
  "email": "user@example.com"
}
```

### Response
**Success (200):**
```json
{
  "success": true,
  "message": "Reset code has been sent to your email",
  "data": null
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Email is required",
  "data": null
}
```

### Lưu ý:
- Mã reset có hiệu lực trong 15 phút
- Mã gồm 6 chữ số (VD: 123456)
- Email sẽ không báo lỗi nếu email không tồn tại (bảo mật)
- Mỗi lần gọi API sẽ tạo mã mới và hủy mã cũ

---

## 3. POST /api/auth/reset-password

Xác nhận mã reset và đặt lại mật khẩu mới.

### Request
```json
{
  "email": "user@example.com",
  "resetCode": "123456",
  "newPassword": "newPassword123"
}
```

### Response
**Success (200):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. Please login with your new password.",
  "data": null
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Invalid or expired reset code",
  "data": null
}
```

**Error (400) - Validation:**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "newPassword",
        "message": "New password must be at least 6 characters long"
      }
    ]
  }
}
```

### Lưu ý:
- Mã reset chỉ sử dụng được 1 lần
- Mật khẩu mới phải có ít nhất 6 ký tự
- Sau khi đổi mật khẩu thành công, tất cả refresh token sẽ bị xóa
- Người dùng cần đăng nhập lại với mật khẩu mới

---

## Rate Limiting

Tất cả các endpoint auth đều có rate limiting:
- **Auth general**: 100 requests per 15 minutes
- **Login**: 5 requests per 15 minutes

## Testing Examples

### Test Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your_refresh_token_here"
  }'
```

### Test Forgot Password
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Test Reset Password
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "resetCode": "123456",
    "newPassword": "newpassword123"
  }'
```

## Validation Rules

### validateRefreshToken
- `refreshToken`: Required, không được để trống

### validateForgotPassword  
- `email`: Required, phải là email hợp lệ

### validateResetPassword
- `email`: Required, phải là email hợp lệ
- `resetCode`: Required, phải là 6 chữ số
- `newPassword`: Required, ít nhất 6 ký tự

## Database Tables

### password_resets
```sql
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    reset_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 15 MINUTE),
    is_used BOOLEAN DEFAULT FALSE,
    INDEX idx_email_code (email, reset_code),
    INDEX idx_expires_at (expires_at)
);
```

### Flow Forgot Password:
1. User gọi `/forgot-password` với email
2. Hệ thống tạo mã 6 số và lưu vào `password_resets`
3. Gửi email chứa mã reset
4. User nhập mã và mật khẩu mới vào `/reset-password`
5. Hệ thống verify mã và cập nhật mật khẩu
6. Xóa tất cả refresh token để force login lại
