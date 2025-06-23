import React, { useState } from 'react';
import './Settings.css';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: true,
    darkMode: false,
    language: 'vi',
    privacy: 'public'
  });

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
              <h3>Thông báo Push</h3>
              <p>Nhận thông báo đẩy trên thiết bị</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingsChange('pushNotifications', e.target.checked)}
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

        <div className="settings-group danger-zone">
          <h2>Vùng nguy hiểm</h2>
          <div className="settings-item">
            <div className="setting-info">
              <h3>Xóa tài khoản</h3>
              <p>Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu</p>
            </div>
            <button className="settings-btn danger">Xóa tài khoản</button>
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