import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EmailVerification.css';

export default function EmailVerification() {
    const [verificationCode, setVerificationCode] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();
    const { verifyEmail, resendVerificationCode } = useAuth();

    useEffect(() => {
        // Get email from location state (passed from registration page)
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            // If no email provided, redirect to register
            navigate('/register');
        }
    }, [location, navigate]);

    useEffect(() => {
        // Countdown timer for resend button
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= 6) {
            setVerificationCode(value);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        if (verificationCode.length !== 6) {
            setError('Vui lòng nhập đầy đủ 6 chữ số');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await verifyEmail(email, verificationCode);

            if (result.success) {
                setSuccess('Xác nhận email thành công! Đang chuyển hướng...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(result.error || 'Mã xác nhận không đúng hoặc đã hết hạn');
            }
        } catch (err) {
            setError('Có lỗi xảy ra, vui lòng thử lại');
            console.error('Verification error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;

        setIsLoading(true);
        setError('');

        try {
            const result = await resendVerificationCode(email);

            if (result.success) {
                setSuccess('Mã xác nhận mới đã được gửi đến email của bạn');
                setResendCooldown(60); // 60 seconds cooldown
            } else {
                setError(result.error || 'Không thể gửi lại mã xác nhận');
            }
        } catch (err) {
            setError('Có lỗi xảy ra, vui lòng thử lại');
            console.error('Resend error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="email-verification-page">
            <div className="verification-container">
                <div className="verification-header">
                    <div className="verification-icon">
                        📧
                    </div>
                    <h1>Xác nhận Email</h1>
                    <p className="verification-subtitle">
                        Chúng tôi đã gửi mã xác nhận 6 chữ số đến<br />
                        <strong>{email}</strong>
                    </p>
                </div>

                <div className="verification-content">
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <form onSubmit={handleVerify} className="verification-form">
                        <div className="form-group">
                            <label htmlFor="verificationCode">Mã xác nhận</label>
                            <input
                                type="text"
                                id="verificationCode"
                                value={verificationCode}
                                onChange={handleCodeChange}
                                placeholder="Nhập 6 chữ số"
                                maxLength="6"
                                className="verification-input"
                                disabled={isLoading}
                                required
                                autoComplete="one-time-code"
                            />
                            <div className="input-hint">
                                Nhập mã 6 chữ số từ email của bạn
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="verify-btn"
                            disabled={isLoading || verificationCode.length !== 6}
                        >
                            {isLoading ? 'Đang xác nhận...' : 'Xác nhận'}
                        </button>

                        <div className="resend-section">
                            <p className="resend-text">Không nhận được email?</p>
                            <button
                                type="button"
                                className="resend-btn"
                                onClick={handleResendCode}
                                disabled={isLoading || resendCooldown > 0}
                            >
                                {resendCooldown > 0
                                    ? `Gửi lại mã (${resendCooldown}s)`
                                    : 'Gửi lại mã'
                                }
                            </button>
                            {resendCooldown > 0 && (
                                <div className="countdown-text">
                                    Bạn có thể gửi lại mã sau {resendCooldown} giây
                                </div>
                            )}
                        </div>

                        <div className="back-to-register">
                            <a href="/register">← Quay lại đăng ký</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
