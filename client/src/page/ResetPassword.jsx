import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import '../styles/ResetPassword.css';

// Base API URL - should match AuthContext
const API_BASE_URL = 'http://localhost:5000/api';

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Lấy token từ URL hoặc từ query params
    const { token } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tokenFromQuery = queryParams.get('token');

    const resetToken = token || tokenFromQuery || '';

    const navigate = useNavigate();

    useEffect(() => {
        if (!resetToken) {
            setError('Token đặt lại mật khẩu không hợp lệ');
        }
    }, [resetToken]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Kiểm tra mật khẩu
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-pass`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: resetToken,
                    newPassword,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
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
                    <div className="reset-password-header">
                        <h1>🔒 Đặt lại mật khẩu</h1>
                        <p>Tạo mật khẩu mới cho tài khoản của bạn</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <form onSubmit={handleResetPassword} className="reset-password-form">
                        <div className="form-group">
                            <label htmlFor="newPassword">Mật khẩu mới</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới"
                                required
                                disabled={isLoading || !resetToken}
                                minLength={6}
                            />
                            <small>Mật khẩu phải có ít nhất 6 ký tự</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu mới"
                                required
                                disabled={isLoading || !resetToken}
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className="reset-button"
                            disabled={isLoading || !resetToken}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                        </button>
                    </form>

                    <div className="reset-password-footer">
                        <p>
                            Nhớ mật khẩu? <Link to="/login" className="login-link">Đăng nhập</Link>
                        </p>
                        <p>
                            Chưa có tài khoản? <Link to="/signup" className="signup-link">Đăng ký ngay</Link>
                        </p>
                    </div>
                </div>

                <div className="reset-password-info">
                    <h2>🔐 Thông tin quan trọng</h2>
                    <ul className="tips-list">
                        <li>Mật khẩu mới phải có ít nhất 6 ký tự</li>
                        <li>Link đặt lại mật khẩu chỉ có hiệu lực trong 15 phút</li>
                        <li>Sau khi đổi mật khẩu, bạn cần đăng nhập lại</li>
                        <li>Nên sử dụng mật khẩu mạnh với ký tự đặc biệt</li>
                        <li>Không chia sẻ mật khẩu với người khác</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
