# Hướng dẫn tích hợp Backend vào Frontend

## 📋 Các bước thực hiện:

### 1. Copy thư mục backend
```bash
# Từ thư mục hiện tại
cp -r backend /path/to/your/frontend/project/
# Hoặc trên Windows
xcopy backend C:\path\to\your\frontend\project\backend /E /I
```

### 2. Cấu trúc thư mục sau khi copy:
```
your-frontend-project/
├── src/                    # Frontend source
├── public/                 # Frontend public files
├── backend/               # Backend đã copy
│   ├── src/
│   ├── package.json
│   └── README.md
├── package.json           # Frontend package.json
└── README.md              # Frontend README
```

### 3. Cập nhật package.json của Frontend
Thêm scripts để chạy cả frontend và backend:

```json
{
  "scripts": {
    "dev": "npm run dev:frontend",
    "dev:frontend": "vite", // hoặc react-scripts start
    "dev:backend": "cd backend && npm run dev",
    "dev:full": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "install:backend": "cd backend && npm install",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "vite build", // hoặc react-scripts build
    "build:backend": "cd backend && npm run build"
  }
}
```

### 4. Cài đặt concurrently để chạy đồng thời
```bash
npm install --save-dev concurrently
```

### 5. Tạo file .env trong frontend (nếu chưa có)
```env
# Frontend Environment Variables
VITE_API_URL=http://localhost:5000/api
# hoặc nếu dùng Create React App
REACT_APP_API_URL=http://localhost:5000/api
```

### 6. Commands để chạy:
```bash
# Cài đặt dependencies cho backend
npm run install:backend

# Chạy chỉ frontend
npm run dev:frontend

# Chạy chỉ backend  
npm run dev:backend

# Chạy cả frontend và backend cùng lúc
npm run dev:full
```

## 🔧 Cấu hình API calls trong Frontend

### Tạo file api.js trong frontend:
```javascript
// src/utils/api.js hoặc src/services/api.js
const API_BASE_URL = process.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // User methods
  async getUserDashboard() {
    return this.request('/users/dashboard');
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Checkin methods
  async createCheckin(checkinData) {
    return this.request('/checkins', {
      method: 'POST',
      body: JSON.stringify(checkinData),
    });
  }

  async getTodayCheckin() {
    return this.request('/checkins/today');
  }

  async getCheckinHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/checkins/history?${queryString}`);
  }

  // Appointment methods
  async createAppointment(appointmentData) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async getAppointments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/appointments?${queryString}`);
  }
}

export default new ApiService();
```

## 🚀 Quick Start Commands

### Sau khi copy backend vào frontend:

```bash
# 1. Cài đặt dependencies cho backend
cd your-frontend-project
npm run install:backend

# 2. Chạy cả frontend và backend
npm run dev:full

# Frontend sẽ chạy trên: http://localhost:3000 (hoặc 5173)
# Backend sẽ chạy trên: http://localhost:5000
```

## ⚠️ Lưu ý quan trọng:

1. **CORS**: Backend đã được cấu hình CORS sẵn cho localhost:5173 và localhost:3000
2. **Environment**: Kiểm tra file .env trong backend đã có đúng cấu hình MongoDB
3. **MongoDB**: Đảm bảo MongoDB đang chạy trên máy
4. **Ports**: Đảm bảo port 5000 (backend) và port frontend không bị conflict

## 🔄 Alternative: Proxy setup (nếu cần)

Nếu frontend chạy trên Create React App, có thể thêm vào package.json:
```json
{
  "proxy": "http://localhost:5000"
}
```

Rồi gọi API trực tiếp: `/api/auth/login` thay vì `http://localhost:5000/api/auth/login`
