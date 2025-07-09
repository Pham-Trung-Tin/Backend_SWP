import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Settings.css';
import { useAuth } from '../context/AuthContext';
import profileApi from '../utils/profileApi';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: true,
    darkMode: false,
    language: 'vi',
    privacy: 'public'
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSettingsChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    console.log('Cài đặt mới:', settings);
    alert('Đã lưu cài đặt của bạn!');
  };
  
  const confirmDeleteAccount = () => {
    setIsDeleting(true);
    setDeleteError('');
  };
  
  const cancelDelete = () => {
    setIsDeleting(false);
    setDeleteConfirmation('');
    setDeleteError('');
  };
  
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setDeleteError('Vui lòng nhập "DELETE" để xác nhận');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await profileApi.deleteAccount();
      
      if (result.success) {
        alert('Tài khoản của bạn đã được xóa thành công');
        await logout();
        navigate('/');
      } else {
        setDeleteError(result.message || 'Không thể xóa tài khoản');
      }
    } catch (err) {
      setDeleteError('Có lỗi xảy ra, vui lòng thử lại');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-section">
      <h1>Cài đặt</h1>
      <div className="settings-container">
        <div className="settings-group">
          <h2>Thông báo</h2>
          <div className="settings-item">
            <div className="setting-info">
              <h3>Thông báo Email</h3>
              <p>Nhận thông báo qua email về tiến trình cai thuốc</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingsChange('emailNotifications', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>



          <div className="settings-item">
            <div className="setting-info">
              <h3>Báo cáo hàng tuần</h3>
              <p>Nhận báo cáo tiến trình hàng tuần qua email</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.weeklyReport}
                onChange={(e) => handleSettingsChange('weeklyReport', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-group">
          <h2>Giao diện</h2>
          <div className="settings-item">
            <div className="setting-info">
              <h3>Chế độ tối</h3>
              <p>Chuyển sang giao diện tối để bảo vệ mắt</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.darkMode}
                onChange={(e) => handleSettingsChange('darkMode', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-item">
            <div className="setting-info">
              <h3>Ngôn ngữ</h3>
              <p>Chọn ngôn ngữ hiển thị</p>
            </div>
            <select 
              value={settings.language}
              onChange={(e) => handleSettingsChange('language', e.target.value)}
              className="settings-select"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="settings-group">
          <h2>Quyền riêng tư</h2>
          <div className="settings-item">
            <div className="setting-info">
              <h3>Chế độ hiển thị hồ sơ</h3>
              <p>Kiểm soát ai có thể xem hồ sơ của bạn</p>
            </div>
            <select 
              value={settings.privacy}
              onChange={(e) => handleSettingsChange('privacy', e.target.value)}
              className="settings-select"
            >
              <option value="public">Công khai</option>
              <option value="friends">Chỉ bạn bè</option>
              <option value="private">Riêng tư</option>
            </select>
          </div>
        </div>

        <div className="settings-group security-zone">
          <h2>Bảo mật</h2>
          <div className="settings-item">
            <div className="setting-info">
              <h3>Đổi mật khẩu</h3>
              <p>Cập nhật mật khẩu mới cho tài khoản của bạn</p>
            </div>
            <Link to="/change-password" className="settings-btn">Đổi mật khẩu</Link>
          </div>
        </div>
        
        <div className="settings-group danger-zone">
          <h2>Vùng nguy hiểm</h2>
          <div className="settings-item">
            <div className="setting-info">
              <h3>Xóa tài khoản</h3>
              <p>Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu</p>
            </div>
            {isDeleting ? (
              <div className="delete-confirmation">
                <p className="delete-warning">Hành động này không thể khôi phục. Nhập "DELETE" để xác nhận xóa tài khoản.</p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Nhập DELETE để xác nhận"
                />
                {deleteError && <p className="delete-error">{deleteError}</p>}
                <div className="delete-actions">
                  <button 
                    className="settings-btn danger" 
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang xử lý...' : 'Xác nhận xóa tài khoản'}
                  </button>
                  <button 
                    className="settings-btn cancel" 
                    onClick={cancelDelete}
                    disabled={isLoading}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="settings-btn danger" 
                onClick={confirmDeleteAccount}
              >
                Xóa tài khoản
              </button>
            )}
          </div>
        </div>

        <div className="settings-actions">
          <button className="save-settings-btn" onClick={handleSaveSettings}>
            Lưu tất cả thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}