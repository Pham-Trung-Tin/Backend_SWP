import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [role, setRole] = useState('user');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // Chuyển hướng đến home nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    // Kiểm tra mật khẩu đủ mạnh (ít nhất 6 ký tự)
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    } setIsLoading(true);

    try {
      // Xử lý dữ liệu gửi đi: chỉ gửi gender và dateOfBirth nếu có giá trị
      const userData = {
        username,
        fullName,
        email,
        password,
        confirmPassword,
        phone,
        role,
        ...(gender ? { gender } : {}),
        ...(dateOfBirth ? { dateOfBirth } : {}),
      }; console.log('🔍 Sending userData:', userData); // Debug log

      const result = await register(userData);
      console.log('📋 Register result:', result); // Debug log

      if (result.success) {
        if (result.needsVerification) {
          // Redirect to email verification page
          navigate('/verify-email', {
            state: {
              email: result.email,
              message: result.message
            }
          });
        } else {
          // This should not happen in normal flow, but handle gracefully
          setError('Unexpected registration flow. Please try again or contact support.');
        }
      } else {
        setError(result.error || 'Đăng ký không thành công');
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>Đăng ký tài khoản</h1>
            <p>Bắt đầu hành trình cai thuốc lá của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {error && <div className="error-message">{error}</div>}            <div className="form-group">
              <label htmlFor="fullName">Họ và tên</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập tên đầy đủ của bạn"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Tên người dùng</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên người dùng (3-50 ký tự)"
                disabled={isLoading}
                required
                minLength={3}
                maxLength={50}
                pattern="[a-zA-Z0-9_]+"
                title="Chỉ được chứa chữ cái, số và dấu gạch dưới"
              />
            </div>

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
              <label htmlFor="phone">Số điện thoại (tuỳ chọn)</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Giới tính (tuỳ chọn)</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Vai trò</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
                required
              >
                <option value="user">Người dùng</option>
                <option value="coach">Chuyên gia</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="dateOfBirth">Ngày sinh (tuỳ chọn)</label>
              <input
                type="date"
                id="dateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="terms-privacy">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                Tôi đồng ý với <Link to="/terms">Điều khoản sử dụng</Link> và <Link to="/privacy">Chính sách bảo mật</Link>
              </label>
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <div className="register-footer">
            <p>Đã có tài khoản? <Link to="/login" className="login-link">Đăng nhập ngay</Link></p>
          </div>
        </div>

        <div className="register-info">
          <h2>Lợi ích khi đăng ký tài khoản NoSmoke</h2>
          <ul className="benefits-list">
            <li>Theo dõi tiến trình cai thuốc lá của bạn</li>
            <li>Tính toán số tiền tiết kiệm được</li>
            <li>Nhận thông báo động viên hàng ngày</li>
            <li>Tham gia cộng đồng những người cùng cai thuốc</li>
            <li>Xem lộ trình cải thiện sức khỏe theo thời gian thực</li>
            <li>Nhận hỗ trợ từ chuyên gia</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
