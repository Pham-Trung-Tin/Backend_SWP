import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to home
  const from = location.state?.from || '/';
  
  // Removed auto-redirect on mount to prevent issues with page reload
  // Users will only be redirected when they actively submit the login form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        // Redirect based on user role
        if (result.user && result.user.role === 'coach') {
          navigate('/coach');
        } else {
          navigate(from);
        }
      } else {
        setError(result.error || 'Đăng nhập không thành công');
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Đăng nhập</h1>
            <p>Chào mừng bạn quay trở lại với NoSmoke</p>
          </div>          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe">Ghi nhớ đăng nhập</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">Quên mật khẩu?</Link>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>          <div className="login-footer">
            <p>Bạn chưa có tài khoản? <Link to="/signup" className="signup-link">Đăng ký ngay</Link></p>
          </div>
        </div>
        
        <div className="login-info">
          <h2>Tại sao nên đăng nhập?</h2>
          <ul className="benefits-list">
            <li>Theo dõi tiến trình cai thuốc của bạn</li>
            <li>Nhận hỗ trợ cá nhân hóa từ chuyên gia</li>
            <li>Tham gia cộng đồng những người cùng mục tiêu</li>
            <li>Tiếp cận các tài liệu và công cụ độc quyền</li>
            <li>Lưu lại hành trình cai thuốc của bạn</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
