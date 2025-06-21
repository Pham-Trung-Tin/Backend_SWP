import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EmailVerification.css';

export default function EmailVerification() {
    const [verificationCode, setVerificationCode] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
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
    }, [resendCooldown]); const handleVerify = async (e) => {
        e.preventDefault();
        setError('');

        if (verificationCode.length !== 6) {
            setError('Mã xác nhận phải có 6 chữ số');
            return;
        }

        setIsLoading(true);
        console.log(`🔐 Đang xác thực email ${email} với mã: ${verificationCode}`);

        try {
            const result = await verifyEmail(email, verificationCode);
            console.log('🔐 Kết quả xác thực:', result); if (result.success) {
                // Show success message and redirect to home
                alert('Xác nhận email thành công! Chào mừng bạn đến với NoSmoke!');
                navigate('/'); // Chuyển về trang chủ thay vì login
            } else {
                console.error('🔐 Xác thực thất bại:', result.error);
                setError(result.error || 'Mã xác nhận không đúng. Vui lòng kiểm tra và thử lại.');
            }
        } catch (err) {
            console.error('🔐 Lỗi xác thực:', err);
            setError(`Có lỗi xảy ra: ${err.message || 'Không xác định được lỗi'}`);
        } finally {
            setIsLoading(false);
        }
    }; const handleResendCode = async () => {
        if (resendCooldown > 0) return;

        setError('');
        setIsLoading(true); try {
            const result = await resendVerificationCode(email);

            if (result.success) {
                alert('Mã xác nhận mới đã được gửi đến email của bạn');
                setResendCooldown(60); // 60 seconds cooldown
                setVerificationCode(''); // Clear current code
            } else {
                setError(result.error || 'Không thể gửi lại mã xác nhận');
            }
        } catch (err) {
            setError('Có lỗi xảy ra, vui lòng thử lại');
            console.error('Resend error:', err);
        } finally {
            setIsLoading(false);
        }
    }; const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= 6) {
            setVerificationCode(value);
            console.log(`📟 Mã xác thực đã nhập: ${value}`);
        }
    };

    return (
        <div className="email-verification-page">
            <div className="verification-container">
                <div className="verification-card">
                    <div className="verification-header">
                        <div className="email-icon">
                            📧
                        </div>
                        <h1>Xác nhận Email</h1>
                        <p>Chúng tôi đã gửi mã xác nhận 6 chữ số đến</p>
                        <p className="email-address">{email}</p>
                    </div>

                    <form onSubmit={handleVerify} className="verification-form">
                        {error && <div className="error-message">{error}</div>}

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
                            <p>Không nhận được email?</p>
                            <button
                                type="button"
                                className="resend-btn"
                                onClick={handleResendCode}
                                disabled={isLoading || resendCooldown > 0}
                            >
                                {resendCooldown > 0
                                    ? `Gửi lại sau ${resendCooldown}s`
                                    : 'Gửi lại mã'
                                }
                            </button>
                        </div>

                        <div className="verification-tips">
                            <h4>💡 Mẹo:</h4>
                            <ul>
                                <li>Kiểm tra thư mục spam/junk mail</li>
                                <li>Mã có hiệu lực trong 10 phút</li>
                                <li>Đảm bảo địa chỉ email chính xác</li>
                            </ul>
                        </div>

                        <div className="back-to-register">
                            <button
                                type="button"
                                className="back-btn"
                                onClick={() => navigate('/register')}
                            >
                                ← Quay lại đăng ký
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
