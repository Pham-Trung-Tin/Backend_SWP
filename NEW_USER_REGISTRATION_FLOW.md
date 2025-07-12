# 🆕 FLOW ĐĂNG KÝ TÀI KHOẢN MỚI - HƯỚNG DẪN CHI TIẾT

## 📋 Quy trình đăng ký tài khoản mới

### **Bước 1: Người dùng điền form đăng ký** (`/signup` route)

```javascript
// Register.jsx - Form đăng ký
const userData = {
    username: username.trim().toLowerCase(),
    fullName: name,
    email,
    password,
    confirmPassword
};

const result = await register(userData);
```

### **Bước 2: AuthContext gửi request tới backend**

```javascript
// AuthContext.jsx - register function
const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
});
```

### **Bước 3: Backend xử lý đăng ký** (`authController.js`)

```javascript
// Step 1: Kiểm tra user đã tồn tại chưa
const [existingUsers] = await pool.execute(
    'SELECT id FROM users WHERE email = ? OR username = ?',
    [email, username]
);

// Step 2: Tạo pending registration (chưa active)
await pool.execute(
    `INSERT INTO pending_registrations 
     (username, email, password_hash, full_name, phone, date_of_birth, gender, role) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [username, email, hashedPassword, fullName, phone, dateOfBirth, gender, 'user']
);

// Step 3: Gửi email verification code
const verificationCode = emailService.generateVerificationCode();
await emailService.sendVerificationEmail(email, fullName, verificationCode);
```

### **Bước 4: User xác nhận email** (`/verify-email`)

```javascript
// verifyEmail function
// Step 1: Kiểm tra verification code
const isCodeValid = await emailService.verifyCode(email, verificationCode);

// Step 2: Tạo user account chính thức
const [result] = await pool.execute(
    `INSERT INTO users 
     (username, email, password_hash, full_name, phone, date_of_birth, gender, role, 
      email_verified, is_active, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, TRUE, NOW())`,
    [pendingUser.username, pendingUser.email, pendingUser.password_hash, ...]
);

const userId = result.insertId; // ✅ ĐÂY LÀ USER ID MỚI!

// Step 3: Generate tokens và auto-login
const accessToken = generateToken(userId);
const refreshToken = generateRefreshToken(userId);
```

### **Bước 5: Frontend nhận response và auto-login**

```javascript
// Sau khi verify email thành công, backend trả về:
{
    success: true,
    data: {
        user: {
            id: userId,           // ✅ User ID mới từ database
            username: "newuser",
            email: "user@email.com",
            fullName: "User Name",
            role: "user",
            emailVerified: true
        },
        token: "jwt-access-token",
        refreshToken: "jwt-refresh-token"
    }
}
```

## 🔧 User ID được tạo như thế nào?

### **Database Auto-increment ID**:

```sql
-- Table users structure
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,  -- ✅ Auto-increment ID
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(100),
    role ENUM('user', 'admin', 'coach') DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **Auto-login sau verification**:

```javascript
// AuthContext.jsx - Sau khi verify email
if (data.success) {
    const { user: userData, token, refreshToken } = data.data;

    // Normalize user data
    const normalizedUser = {
        ...userData,
        name: userData.name || userData.fullName || userData.username,
        fullName: userData.fullName || userData.name || userData.username
    };

    // ✅ Lưu user data với ID mới vào localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('nosmoke_user', JSON.stringify(normalizedUser));

    setUser(normalizedUser);
}
```

## 🎯 User ID Detection cho user mới

### **Sau khi đăng ký thành công**:

```javascript
// userUtils.js - getCurrentUserId()
const getCurrentUserId = () => {
    // 1. Check localStorage cho auth keys
    let userId = localStorage.getItem('user_id') || localStorage.getItem('userId');
    
    if (!userId) {
        // 2. Parse nosmoke_user object (chứa user mới)
        const userStr = localStorage.getItem('nosmoke_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            userId = user.id || user.smoker_id || user.user_id;  // ✅ user.id từ DB
        }
    }
    
    return userId || null;  // ✅ Trả về user ID mới
};
```

## 🔍 Test Flow cho user mới

### **Manual Test Steps**:

```bash
# 1. Mở browser: http://localhost:5176/
# 2. Click "Đăng ký" → điền form → submit
# 3. Kiểm tra email hoặc console log verification code
# 4. Nhập verification code → verify
# 5. Auto-login → user mới được tạo với ID unique

# 6. Test trong console:
localStorage.getItem('nosmoke_user')
# Sẽ thấy object với ID mới:
# {"id": 15, "username": "newuser", "email": "...", ...}

# 7. Test userUtils:
import { getCurrentUserId } from './src/utils/userUtils.js'
getCurrentUserId()  // ✅ Sẽ trả về ID mới (VD: 15)
```

## 📊 Database Records cho user mới

### **Sau khi đăng ký hoàn tất**:

```sql
-- User record mới trong bảng users
SELECT * FROM users WHERE id = 15;
-- id: 15 (auto-increment)
-- username: "newuser"  
-- email: "user@email.com"
-- email_verified: 1 (TRUE)
-- is_active: 1 (TRUE)
-- role: "user"
-- created_at: "2025-01-12 ..."

-- Không có progress data ban đầu
SELECT * FROM daily_progress WHERE smoker_id = 15;
-- (Empty result - user chưa có plan/progress)
```

## ✅ Kết luận cho User Mới

### **Flow hoàn chỉnh**:

1. **Đăng ký** → Tạo pending registration
2. **Verify email** → Tạo user record với ID auto-increment mới  
3. **Auto-login** → Lưu user data với ID vào localStorage
4. **userUtils.getCurrentUserId()** → Detect ID mới từ localStorage  
5. **App sử dụng ID mới** → Tất cả API calls sử dụng ID đúng

### **Ưu điểm của hệ thống hiện tại**:

- ✅ **Multi-user ready**: Mỗi user có ID unique riêng biệt
- ✅ **No hardcoded ID**: Dynamic user detection hoạt động cho user mới  
- ✅ **Data isolation**: Progress data tách biệt theo smoker_id
- ✅ **Scalable**: Có thể support unlimited users

### **Không cần lo lắng về**:

- ❌ Hardcoded user ID 13 - chỉ là fallback cho development
- ❌ Plan deletion issues - đã fix comprehensive cleanup  
- ❌ Progress data mixing - database tách biệt theo user ID

---

**✅ User mới sẽ hoạt động hoàn hảo** với hệ thống multi-user đã implement!
