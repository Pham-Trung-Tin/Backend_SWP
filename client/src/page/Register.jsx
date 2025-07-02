import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // No need to set quit date anymore

  // Chuyển hướng đến profile nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Debug log the current form values
    console.log("Form submission - Current values:", {
      fullName,
      email,
      password: password ? "[REDACTED]" : "",
      confirmPassword: confirmPassword ? "[REDACTED]" : "",
      phone
    });

    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    // Kiểm tra mật khẩu đủ mạnh (ít nhất 6 ký tự)
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);

    try {
      // Log each value separately for debugging
      console.log("Full name:", fullName);
      console.log("Email:", email);
      console.log("Password length:", password.length);
      console.log("Phone:", phone || "");

      const userData = {
        full_name: fullName,
        email,
        password,
        phone: phone || '' // Send empty string if not provided
      };

      console.log("Final userData being sent:", JSON.stringify(userData));

      const result = await register(userData);

      console.log("Registration result:", result);

      if (result.success) {
        setSuccess('Đăng ký thành công! Đang chuyển bạn đến trang xác thực email...');

        // Chuyển hướng đến trang xác thực email với email đã đăng ký
        setTimeout(() => {
          navigate('/verify-email', { state: { email } });
        }, 1500);
      } else {
        // Log the full error response for debugging
        console.error("Registration failed:", result);

        // Handle different error formats
        if (result.error && typeof result.error === 'string') {
          setError(result.error);
        } else if (result.message && typeof result.message === 'string') {
          setError(result.message);
        } else if (result.data && result.data.message) {
          setError(result.data.message);
        } else if (result.data && result.data.error) {
          setError(result.data.error);
        } else if (result.errors && Array.isArray(result.errors)) {
          // Join multiple validation errors
          setError(result.errors.join(', '));
        } else if (result.data && result.data.errors && Array.isArray(result.data.errors)) {
          // Handle nested errors array
          setError(result.data.errors.join(', '));
        } else {
          setError('Đăng ký không thành công. Vui lòng kiểm tra thông tin và thử lại.');
        }

        // Không cần xử lý lỗi định dạng ngày nữa vì chúng ta đã gửi ngày mặc định từ server
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
            <p>Tạo tài khoản để bắt đầu hành trình cai thuốc lá</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-group">
              <label htmlFor="fullName">Họ và tên</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập tên của bạn"
                disabled={isLoading}
                required
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
              <label htmlFor="phone">Số điện thoại (tùy chọn)</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại của bạn"
                disabled={isLoading}
              />
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
            <li>Tạo và theo dõi kế hoạch cai thuốc lá cá nhân</li>
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
