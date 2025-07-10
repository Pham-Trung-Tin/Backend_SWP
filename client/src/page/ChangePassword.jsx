import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChangePassword.css';
import authApi from '../utils/authApi';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Kiểm tra mật khẩu xác nhận
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    // Kiểm tra mật khẩu đủ mạnh (ít nhất 6 ký tự)
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    // Kiểm tra mật khẩu mới không giống mật khẩu cũ
    if (newPassword === currentPassword) {
      setError('Mật khẩu mới không được giống mật khẩu cũ');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await authApi.changePassword(currentPassword, newPassword);
      
      if (result.success) {
        setSuccess('Mật khẩu đã được thay đổi thành công.');
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Chuyển hướng về trang cài đặt sau 3 giây
        setTimeout(() => {
          navigate('/settings');
        }, 3000);
      } else {
        setError(result.message || 'Không thể thay đổi mật khẩu');
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-container">
        <div className="change-password-card">
          <div className="change-password-header">
            <h1>Đổi mật khẩu</h1>
            <p>Cập nhật mật khẩu mới cho tài khoản của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="change-password-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="form-group">
              <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                disabled={isLoading}
                required
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
                disabled={isLoading}
                required
              />
            </div>

            <button 
              type="submit" 
              className="submit-button" 
              disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>

            <div className="change-password-footer">
              <button 
                type="button" 
                className="cancel-button" 
                onClick={() => navigate('/settings')}
                disabled={isLoading}>
                Quay lại cài đặt
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
