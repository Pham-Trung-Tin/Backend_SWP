# API Integration Examples

## 🔗 Frontend Integration Examples

### React Hook Example

```jsx
// hooks/useApi.js
import { useState, useEffect } from 'react';
import ApiService from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await ApiService.getCurrentUser();
        if (response.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        ApiService.removeToken();
      } finally {
        setLoading(false);
      }
    };

    if (ApiService.token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await ApiService.login(email, password);
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: 'Đăng nhập thất bại' };
    }
  };

  const logout = () => {
    ApiService.removeToken();
    setUser(null);
  };

  return { user, loading, login, logout };
};

export const useDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await ApiService.getUserDashboard();
        if (response.success) {
          setDashboard(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { dashboard, loading, refetch: () => fetchDashboard() };
};
```

### Login Component Example

```jsx
// components/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useApi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>Mật khẩu:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  );
};

export default Login;
```

### Dashboard Component Example

```jsx
// components/Dashboard.jsx
import React from 'react';
import { useDashboard } from '../hooks/useApi';

const Dashboard = () => {
  const { dashboard, loading } = useDashboard();

  if (loading) return <div>Đang tải...</div>;
  if (!dashboard) return <div>Không thể tải dữ liệu</div>;

  const { user, stats, membership } = dashboard;

  return (
    <div className="dashboard">
      <h1>Xin chào, {user.name}!</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Ngày không hút thuốc</h3>
          <p>{stats.daysSinceStart}</p>
        </div>
        
        <div className="stat-card">
          <h3>Tiền tiết kiệm</h3>
          <p>{stats.moneySaved.toLocaleString('vi-VN')} VNĐ</p>
        </div>
        
        <div className="stat-card">
          <h3>Điều thuốc không hút</h3>
          <p>{stats.cigarettesNotSmoked}</p>
        </div>
        
        <div className="stat-card">
          <h3>Chuỗi hiện tại</h3>
          <p>{stats.currentStreak} ngày</p>
        </div>
      </div>

      <div className="membership-info">
        <h3>Gói thành viên: {membership.type}</h3>
        <p>Trạng thái: {membership.isActive ? 'Đang hoạt động' : 'Hết hạn'}</p>
      </div>
    </div>
  );
};

export default Dashboard;
```

### Daily Checkin Component

```jsx
// components/DailyCheckin.jsx
import React, { useState } from 'react';
import ApiService from '../services/api';

const DailyCheckin = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    smokingStatus: 'smoke-free',
    mood: 'neutral',
    cravingLevel: 5,
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await ApiService.createCheckin(formData);
      if (response.success) {
        alert('Check-in thành công!');
        onSuccess && onSuccess();
      }
    } catch (error) {
      alert('Check-in thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Trạng thái hút thuốc:</label>
        <select
          value={formData.smokingStatus}
          onChange={(e) => setFormData({...formData, smokingStatus: e.target.value})}
        >
          <option value="smoke-free">Không hút thuốc</option>
          <option value="smoked">Đã hút thuốc</option>
          <option value="almost-smoked">Suýt hút thuốc</option>
        </select>
      </div>

      <div>
        <label>Tâm trạng:</label>
        <select
          value={formData.mood}
          onChange={(e) => setFormData({...formData, mood: e.target.value})}
        >
          <option value="very-bad">Rất tệ</option>
          <option value="bad">Tệ</option>
          <option value="neutral">Bình thường</option>
          <option value="good">Tốt</option>
          <option value="excellent">Tuyệt vời</option>
        </select>
      </div>

      <div>
        <label>Mức độ thèm thuốc (1-10):</label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.cravingLevel}
          onChange={(e) => setFormData({...formData, cravingLevel: parseInt(e.target.value)})}
        />
        <span>{formData.cravingLevel}</span>
      </div>

      <div>
        <label>Ghi chú:</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Chia sẻ cảm nghĩ của bạn..."
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Đang lưu...' : 'Check-in'}
      </button>
    </form>
  );
};

export default DailyCheckin;
```

## 🛠 Utility Functions

```javascript
// utils/helpers.js

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

export const calculateProgress = (startDate, currentStreak) => {
  const start = new Date(startDate);
  const now = new Date();
  const totalDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const percentage = totalDays > 0 ? (currentStreak / totalDays) * 100 : 0;
  
  return {
    totalDays,
    percentage: Math.min(percentage, 100)
  };
};
```

## 📱 Mobile-First CSS Example

```css
/* styles/dashboard.css */
.dashboard {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.stat-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.stat-card p {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: #2ecc71;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-card p {
    font-size: 1.5rem;
  }
}
```
