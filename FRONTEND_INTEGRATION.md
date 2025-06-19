# 🎯 Tích hợp Frontend - Backend cho Quit Smoking App

## 📁 Cấu trúc dự án được tổ chức

```
Backend_SWP/
├── backend/                 # Backend API (Node.js + Express + MongoDB)
├── frontend-integration/    # Files hỗ trợ tích hợp
│   ├── api.js              # API service cho frontend
│   ├── test.html           # Test HTML page
│   ├── react/              # React components examples
│   └── INTEGRATION_GUIDE.md # Hướng dẫn chi tiết
├── .env                    # Environment variables
└── package.json           # Root package.json
```

## 🚀 Các bước tích hợp nhanh

### 1. Khởi động Backend
```bash
cd backend
npm install
npm run dev
```
Backend chạy trên: `http://localhost:5000`

### 2. Tích hợp với Frontend hiện có

#### Option A: HTML/JavaScript thuần
```html
<!-- Copy api.js vào thư mục frontend -->
<script src="api.js"></script>
<script>
  // Sử dụng ngay
  const result = await api.login({
    email: 'user@example.com',
    password: 'password123'
  });
</script>
```

#### Option B: React/Vue/Angular
```javascript
// Import vào component
import api from './services/api.js';

// Sử dụng trong component
const handleLogin = async () => {
  try {
    const result = await api.login(credentials);
    // Handle success
  } catch (error) {
    console.error(api.formatError(error));
  }
};
```

### 3. Cập nhật CORS cho Frontend
Trong file `.env`, cập nhật `FRONTEND_URL` theo port của frontend:
```env
FRONTEND_URL=http://localhost:3000  # Thay đổi theo port frontend
```

### 4. Test API
Mở `frontend-integration/test.html` trong browser để test API endpoints.

## 🔧 API endpoints chính

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập  
- `GET /api/auth/me` - Thông tin user
- `POST /api/auth/logout` - Đăng xuất

### Dashboard & User
- `GET /api/users/dashboard` - Dashboard data
- `GET /api/users/statistics` - Thống kê user
- `PUT /api/users/profile` - Cập nhật profile

### Daily Check-in
- `POST /api/checkins` - Tạo check-in
- `GET /api/checkins/today` - Check-in hôm nay
- `GET /api/checkins/history` - Lịch sử
- `GET /api/checkins/statistics` - Thống kê

### Appointments
- `POST /api/appointments` - Đặt lịch hẹn
- `GET /api/appointments` - Danh sách lịch hẹn
- `GET /api/appointments/upcoming` - Lịch hẹn sắp tới

## 💡 Example usage trong Frontend

### Login Flow
```javascript
// Login form submit
const handleLogin = async (formData) => {
  try {
    const result = await api.login({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe
    });
    
    if (result.success) {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  } catch (error) {
    // Show error message
    setError(api.formatError(error));
  }
};
```

### Dashboard Data
```javascript
// Load dashboard
const loadDashboard = async () => {
  try {
    const response = await api.getUserDashboard();
    const { stats, user } = response.data;
    
    // Update UI với stats
    setDaysSinceStart(stats.daysSinceStart);
    setMoneySaved(stats.moneySaved);
    setCurrentStreak(stats.currentStreak);
  } catch (error) {
    console.error('Dashboard error:', error);
  }
};
```

### Daily Check-in
```javascript
// Submit check-in
const submitCheckin = async (checkinData) => {
  try {
    const result = await api.createCheckin({
      smokingStatus: 'smoke-free',
      mood: 'good',
      cravingLevel: 3,
      notes: 'Feeling great today!'
    });
    
    // Update UI
    showSuccess('Check-in thành công!');
    loadDashboard(); // Refresh stats
  } catch (error) {
    showError(api.formatError(error));
  }
};
```

## 🔐 Authentication Flow

1. **Login**: Token được lưu tự động (localStorage/sessionStorage)
2. **API calls**: Token được gửi kèm trong Authorization header
3. **Logout**: Token được xóa khỏi storage
4. **Auto-redirect**: Nếu token expired, redirect về login

## 📱 Responsive Integration

API service hoạt động trên mọi platform:
- ✅ Desktop web browsers
- ✅ Mobile web browsers  
- ✅ React Native (với fetch polyfill)
- ✅ Electron apps
- ✅ PWA (Progressive Web Apps)

## 🧪 Testing & Debug

### 1. Test với HTML file
Mở `frontend-integration/test.html` để test trực tiếp API

### 2. Browser DevTools
- Check Network tab để xem API calls
- Check Console cho errors
- Check Application tab cho tokens

### 3. API Testing với curl
```bash
# Test register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456","cigarettesPerDay":10,"costPerPack":25000}'
```

## 📞 Hỗ trợ tích hợp

Nếu bạn cần hỗ trợ cụ thể cho framework frontend của bạn, vui lòng cung cấp:

1. **Frontend framework** (React, Vue, Angular, HTML/JS thuần?)
2. **Cấu trúc thư mục** hiện tại
3. **Port** frontend đang chạy
4. **Các tính năng** cụ thể cần tích hợp

Tôi sẽ hỗ trợ tạo code cụ thể cho dự án của bạn! 🚀
