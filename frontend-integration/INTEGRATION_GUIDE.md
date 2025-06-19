# 🔗 Hướng dẫn tích hợp Frontend với Backend

## 📋 Bước 1: Chuẩn bị

### Backend
1. Đảm bảo backend đang chạy:
```bash
cd backend
npm run dev
```
Backend sẽ chạy trên `http://localhost:5000`

### Frontend
2. Cập nhật URL trong file `.env` nếu frontend chạy trên port khác:
```env
FRONTEND_URL=http://localhost:3000  # hoặc port của bạn
```

## 📁 Bước 2: Copy API files vào Frontend

### Option 1: HTML/JavaScript thuần
1. Copy file `api.js` vào thư mục frontend
2. Include trong HTML:
```html
<script src="api.js"></script>
```

### Option 2: React/Vue/Angular
1. Copy file `api.js` vào `src/services/` hoặc `src/utils/`
2. Import trong components:
```javascript
import api from '../services/api.js';
```

## 🔧 Bước 3: Sử dụng API

### Authentication Flow
```javascript
// Đăng ký
const registerData = {
  name: "Nguyễn Văn A",
  email: "user@example.com", 
  password: "password123",
  cigarettesPerDay: 20,
  costPerPack: 25000
};

try {
  const result = await api.register(registerData);
  console.log('Đăng ký thành công:', result);
} catch (error) {
  console.error('Lỗi đăng ký:', api.formatError(error));
}

// Đăng nhập
const loginData = {
  email: "user@example.com",
  password: "password123",
  rememberMe: true
};

try {
  const result = await api.login(loginData);
  console.log('Đăng nhập thành công:', result);
  // Token sẽ được lưu tự động
} catch (error) {
  console.error('Lỗi đăng nhập:', api.formatError(error));
}
```

### Dashboard Data
```javascript
// Lấy dữ liệu dashboard
try {
  const dashboard = await api.getUserDashboard();
  const stats = dashboard.data.stats;
  
  // Hiển thị thống kê
  console.log('Ngày không hút thuốc:', stats.daysSinceStart);
  console.log('Tiền tiết kiệm:', stats.moneySaved);
  console.log('Chuỗi hiện tại:', stats.currentStreak);
} catch (error) {
  console.error('Lỗi lấy dashboard:', api.formatError(error));
}
```

### Daily Check-in
```javascript
// Tạo check-in hàng ngày
const checkinData = {
  smokingStatus: 'smoke-free', // 'smoke-free', 'smoked', 'almost-smoked'
  mood: 'good', // 'excellent', 'good', 'neutral', 'bad', 'very-bad'
  cravingLevel: 3, // 1-10
  notes: 'Hôm nay cảm thấy tốt',
  alternativeActivities: ['exercise', 'meditation'],
  withdrawalSymptoms: ['irritability']
};

try {
  const result = await api.createCheckin(checkinData);
  console.log('Check-in thành công:', result);
} catch (error) {
  console.error('Lỗi check-in:', api.formatError(error));
}
```

### Appointments
```javascript
// Đặt lịch hẹn
const appointmentData = {
  coachId: 'coach123',
  coachName: 'Dr. Smith',
  appointmentDate: '2024-01-15',
  appointmentTime: '10:00',
  type: 'consultation', // 'consultation', 'follow-up', 'emergency'
  reason: 'Cần tư vấn về kế hoạch bỏ thuốc'
};

try {
  const result = await api.createAppointment(appointmentData);
  console.log('Đặt lịch thành công:', result);
} catch (error) {
  console.error('Lỗi đặt lịch:', api.formatError(error));
}
```

## 🎨 Bước 4: Styling và UI

### CSS cho Stats Cards
```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-value {
  font-size: 2em;
  font-weight: bold;
  color: #007bff;
  margin: 10px 0;
}

.stat-label {
  color: #666;
  font-size: 0.9em;
}
```

## 🔄 Bước 5: Error Handling

### Global Error Handler
```javascript
// Thêm vào API service
api.onError = (error) => {
  if (error.status === 401) {
    // Token hết hạn, redirect to login
    window.location.href = '/login';
  } else if (error.status === 403) {
    // Không có quyền
    alert('Bạn không có quyền thực hiện hành động này');
  } else {
    // Lỗi khác
    console.error('API Error:', error);
  }
};
```

### Loading States
```javascript
// React example
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    const result = await api.createCheckin(data);
    // Handle success
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

## 📱 Bước 6: Responsive Design

### Mobile-first CSS
```css
/* Mobile styles */
.dashboard {
  padding: 10px;
}

.stats-grid {
  grid-template-columns: 1fr;
}

/* Tablet and up */
@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 🔐 Bước 7: Security Best Practices

### Protect Routes
```javascript
// React Router protection
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

### Token Management
```javascript
// Auto refresh token (if implemented)
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.status === 401 && error.data?.code === 'TOKEN_EXPIRED') {
      try {
        await api.refreshToken();
        // Retry original request
        return api.request(error.config);
      } catch (refreshError) {
        // Redirect to login
        api.removeToken();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

## 🧪 Bước 8: Testing

### Test với file HTML
1. Mở `test.html` trong browser
2. Test các API endpoints
3. Kiểm tra network tab trong Developer Tools

### API Testing với curl
```bash
# Test register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456","cigarettesPerDay":10,"costPerPack":25000}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

## 🚀 Bước 9: Deployment

### Environment Variables
```javascript
// config.js
const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com/api'
    : 'http://localhost:5000/api'
};
```

### Build Process
1. Update API URLs cho production
2. Build frontend
3. Deploy cả frontend và backend
4. Update CORS settings cho production domain

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra browser Console
2. Kiểm tra Network tab
3. Kiểm tra backend logs
4. Verify CORS settings
5. Check authentication token
