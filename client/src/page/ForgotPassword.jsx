import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';
import authApi from '../utils/authApi';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await authApi.forgotPassword(email);
      
      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.message || 'Không thể gửi email khôi phục mật khẩu');
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <h1>Quên mật khẩu</h1>
            <p>Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu</p>
          </div>

          {isSubmitted ? (
            <div className="success-message">
              <h2>Email đã được gửi!</h2>
              <p>Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.</p>
              <p>Nếu bạn không nhận được email, hãy kiểm tra thư mục spam hoặc thử lại.</p>
              <div className="form-buttons">
                <Link to="/login" className="login-link">Quay lại đăng nhập</Link>
                <button 
                  onClick={() => setIsSubmitted(false)} 
                  className="try-again-button">
                  Thử lại với email khác
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="forgot-password-form">
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

              <button 
                type="submit" 
                className="submit-button" 
                disabled={isLoading}>
                {isLoading ? 'Đang gửi...' : 'Gửi link khôi phục'}
              </button>

              <div className="forgot-password-footer">
                <p>Đã nhớ mật khẩu? <Link to="/login" className="login-link">Đăng nhập</Link></p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
