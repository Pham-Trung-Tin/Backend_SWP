import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập mã code, 3: nhập mật khẩu mới
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Bước 1: Gửi email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
        setStep(2);
      } else {
        setError(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
      setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2 & 3: Xác thực mã và đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          resetCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập với mật khẩu mới.');
        setStep(3);
      } else {
        setError(data.message || 'Mã xác thực không đúng hoặc đã hết hạn.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="forgot-password-card">
      <h2>Quên mật khẩu</h2>
      <p>Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã xác thực để đặt lại mật khẩu.</p>
      
      <form onSubmit={handleSendEmail}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập địa chỉ email của bạn"
            required
            disabled={loading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
        </button>
      </form>

      <div className="back-to-login">
        <Link to="/login">← Quay lại đăng nhập</Link>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="forgot-password-card">
      <h2>Nhập mã xác thực</h2>
      <p>Chúng tôi đã gửi mã xác thực 6 số đến email <strong>{email}</strong></p>
      
      <form onSubmit={handleResetPassword}>
        <div className="form-group">
          <label htmlFor="resetCode">Mã xác thực</label>
          <input
            type="text"
            id="resetCode"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            placeholder="Nhập mã 6 số"
            maxLength="6"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">Mật khẩu mới</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
            minLength="6"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            minLength="6"
            required
            disabled={loading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        </button>
      </form>

      <div className="back-to-login">
        <button 
          onClick={() => setStep(1)} 
          className="btn-secondary"
          disabled={loading}
        >
          ← Quay lại nhập email
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="forgot-password-card success">
      <div className="success-icon">✓</div>
      <h2>Đặt lại mật khẩu thành công!</h2>
      <p>Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.</p>
      
      <Link to="/login" className="btn-primary">
        Đăng nhập ngay
      </Link>
    </div>
  );

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-wrapper">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default ForgotPassword;
