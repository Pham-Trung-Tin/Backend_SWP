import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './ResetPassword.css';
import authApi from '../utils/authApi';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy token từ query parameter khi component được mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Token không hợp lệ hoặc đã hết hạn');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Kiểm tra mật khẩu xác nhận
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    // Kiểm tra mật khẩu đủ mạnh (ít nhất 6 ký tự)
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await authApi.resetPassword(token, newPassword);
      
      if (result.success) {
        setIsSuccess(true);
        // Tự động chuyển hướng đến trang đăng nhập sau 3 giây
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.message || 'Không thể đặt lại mật khẩu');
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-card">
          {isSuccess ? (
            <div className="success-message">
              <h2>Mật khẩu đã được đặt lại!</h2>
              <p>Bạn có thể đăng nhập bằng mật khẩu mới.</p>
              <p>Đang chuyển hướng đến trang đăng nhập...</p>
              <Link to="/login" className="login-button">Đăng nhập ngay</Link>
            </div>
          ) : (
            <>
              <div className="reset-password-header">
                <h1>Đặt lại mật khẩu</h1>
                <p>Tạo mật khẩu mới cho tài khoản của bạn</p>
              </div>

              <form onSubmit={handleSubmit} className="reset-password-form">
                {error && <div className="error-message">{error}</div>}
                {!token && (
                  <div className="error-message">
                    Token đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu
                    <Link to="/forgot-password" className="request-link"> link đặt lại mật khẩu mới</Link>.
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="newPassword">Mật khẩu mới</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    disabled={isLoading || !token}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu mới"
                    disabled={isLoading || !token}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-button" 
                  disabled={isLoading || !token}>
                  {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>

                <div className="reset-password-footer">
                  <p>Đã nhớ mật khẩu? <Link to="/login" className="login-link">Đăng nhập</Link></p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
