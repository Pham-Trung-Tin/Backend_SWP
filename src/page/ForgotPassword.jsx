import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

// Base API URL - should match AuthContext
const API_BASE_URL = 'http://localhost:5000/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1); // 1: nhập email, 2: nhập mã và mật khẩu mới
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0); // Cooldown timer cho resend

    const navigate = useNavigate();

    // Cooldown timer effect
    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [cooldown]);

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json(); if (data.success) {
                setSuccess('Mã đặt lại mật khẩu đã được gửi về email của bạn');
                setStep(2);
                setCooldown(60); // Set 60 giây cooldown
            } else {
                setError(data.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            setError('Có lỗi xảy ra, vui lòng thử lại');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

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
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
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

            if (data.success) {
                setSuccess('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            setError('Có lỗi xảy ra, vui lòng thử lại');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    const handleBackToStep1 = () => {
        setStep(1);
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
        setCooldown(0);
    };

    const handleResendCode = async () => {
        if (cooldown > 0) return; // Không cho phép gửi lại khi còn cooldown

        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Mã mới đã được gửi về email của bạn');
                setCooldown(60); // Set lại 60 giây cooldown
            } else {
                setError(data.message || 'Có lỗi xảy ra khi gửi lại mã');
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
                        <h1>🔐 Quên mật khẩu</h1>            <p>
                            {step === 1
                                ? 'Nhập email của bạn để nhận mã đặt lại mật khẩu'
                                : `Nhập mã xác nhận đã gửi về ${email} và mật khẩu mới`
                            }
                        </p>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    {step === 1 ? (
                        <form onSubmit={handleSendCode} className="forgot-password-form">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Nhập email của bạn"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="send-code-button"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="reset-password-form">
                            <div className="form-group">
                                <label htmlFor="resetCode">Mã xác nhận (6 số)</label>
                                <input
                                    type="text"
                                    id="resetCode"
                                    value={resetCode}
                                    onChange={(e) => setResetCode(e.target.value)}
                                    placeholder="Nhập mã 6 số"
                                    required
                                    disabled={isLoading}
                                    maxLength={6}
                                />                <small>Kiểm tra email của bạn để lấy mã xác nhận</small>
                                <div className="resend-code-section">
                                    <button
                                        type="button"
                                        className="resend-code-button"
                                        onClick={handleResendCode}
                                        disabled={isLoading || cooldown > 0}
                                    >
                                        {cooldown > 0 ? `Gửi lại mã (${cooldown}s)` : 'Gửi lại mã'}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="newPassword">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới"
                                    required
                                    disabled={isLoading}
                                    minLength={6}
                                />
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
                                    disabled={isLoading}
                                    minLength={6}
                                />
                            </div>

                            <div className="form-buttons">
                                <button
                                    type="button"
                                    className="back-button"
                                    onClick={handleBackToStep1}
                                    disabled={isLoading}
                                >
                                    ← Quay lại
                                </button>
                                <button
                                    type="submit"
                                    className="reset-button"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="forgot-password-footer">
                        <p>
                            Nhớ lại mật khẩu? <Link to="/login" className="login-link">Đăng nhập</Link>
                        </p>
                        <p>
                            Chưa có tài khoản? <Link to="/signup" className="signup-link">Đăng ký ngay</Link>
                        </p>
                    </div>
                </div>

                <div className="forgot-password-info">
                    <h2>💡 Lưu ý quan trọng</h2>
                    <ul className="tips-list">
                        <li>Mã xác nhận có hiệu lực trong 15 phút</li>
                        <li>Kiểm tra cả hộp thư spam nếu không thấy email</li>
                        <li>Mỗi lần yêu cầu sẽ tạo mã mới và hủy mã cũ</li>
                        <li>Sau khi đổi mật khẩu, bạn cần đăng nhập lại</li>
                        <li>Mật khẩu mới phải có ít nhất 6 ký tự</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
