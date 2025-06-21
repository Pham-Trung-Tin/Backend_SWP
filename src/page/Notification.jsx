import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Notification.css';

const Notification = () => {
  const { user } = useAuth();
  
  // Calculate days since registration
  const daysSinceRegistration = user?.startDate ? 
    Math.floor((new Date() - new Date(user.startDate)) / (1000 * 60 * 60 * 24)) : 1;
  
  // Sample notification data for new user (1 day account)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'welcome',
      icon: '👋',
      message: 'Chào mừng bạn đến với hành trình cai thuốc',
      description: 'Chúc mừng bạn đã bắt đầu hành trình cai thuốc. Cùng nhau chúng ta sẽ thành công!',
      time: '1 ngày trước',
      read: false
    },
    {
      id: 2,
      type: 'badge',
      icon: '🏅',
      message: 'Bạn đã đạt được huy hiệu "Ngày đầu tiên"',
      description: 'Chúc mừng! Bạn vừa nhận được huy hiệu "Ngày đầu tiên không hút thuốc".',
      time: '24 giờ trước',
      read: false
    },
    {
      id: 3,
      type: 'health',
      icon: '💓',
      message: 'Cập nhật sức khỏe',
      description: 'Sau 20 phút không hút thuốc, huyết áp và nhịp tim của bạn đã trở về mức bình thường.',
      time: '20 giờ trước',
      read: false
    },
    {
      id: 4,
      type: 'tip',
      icon: '💡',
      message: 'Mẹo vượt qua cơn thèm thuốc',
      description: 'Khi cảm thấy thèm thuốc, hãy thử uống nước, ăn nhẹ hoặc đi dạo 5 phút.',
      time: '12 giờ trước',
      read: true
    },
    {
      id: 5,
      type: 'reminder',
      icon: '⏰',
      message: 'Nhắc nhở cập nhật tiến trình',
      description: 'Hãy cập nhật trạng thái cai thuốc hôm nay của bạn trong mục Tư vấn.',
      time: '2 giờ trước',
      read: false
    }
  ]);

  // State for notification preferences
  const [notificationSettings, setNotificationSettings] = useState({
    dailyReminder: true,
    progressUpdate: true,
    goalReminder: true,
    counselorNotification: true,
    blogUpdate: true
  });

  // State for notification delivery methods
  const [deliveryMethods, setDeliveryMethods] = useState({
    app: true,
    email: true,
    sms: false
  });

  // Handle toggle for notification settings
  const handleSettingToggle = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Handle toggle for delivery methods
  const handleDeliveryToggle = (method) => {
    setDeliveryMethods(prev => ({
      ...prev,
      [method]: !prev[method]
    }));
  };

  // Handle mark as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Handle mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  return (
    <div className="notification-container">
      <div className="notification-header-actions">
        <h1 className="notification-title">Danh sách thông báo gần đây</h1>
        <button className="mark-all-read-btn" onClick={markAllAsRead}>
          Đánh dấu tất cả đã đọc
        </button>
      </div>
      
      {/* Recent notifications section */}
      <div className="notification-list">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`notification-item ${notification.read ? '' : 'unread'}`}
          >
            <div className="notification-icon">{notification.icon}</div>
            <div className="notification-content">
              <div className="notification-header">
                <h3>{notification.message}</h3>
                <span className="notification-time">{notification.time}</span>
              </div>
              <p>{notification.description}</p>
            </div>
            <button 
              className={`notification-status ${notification.read ? 'read' : 'unread'}`}
              onClick={() => markAsRead(notification.id)}
            >
              {notification.read ? 'Đã đọc' : 'Chưa đọc'}
            </button>
          </div>
        ))}
      </div>
      
      {/* New user specific guidance */}
      <div className="new-user-guidance">
        <h2 className="section-title">
          <span className="icon">🔍</span> Hướng dẫn cho người mới
        </h2>
        <div className="guidance-content">
          <p>Chào mừng bạn đến với hành trình cai thuốc! Dưới đây là một số tính năng có thể giúp bạn:</p>
          <ul className="guidance-list">
            <li><strong>Cập nhật hàng ngày:</strong> Theo dõi tiến trình mỗi ngày trong mục Tư vấn</li>
            <li><strong>Xem tiến trình sức khỏe:</strong> Kiểm tra các cải thiện sức khỏe trong mục Hồ sơ cá nhân</li>
            <li><strong>Nhận hỗ trợ:</strong> Tham gia vào cộng đồng để nhận sự hỗ trợ</li>
          </ul>
        </div>
      </div>
      
      {/* Notification preferences section */}
      <div className="notification-preferences">
        <h2 className="section-title">
          <span className="icon">🔔</span> Tùy chọn nhận thông báo
        </h2>
        
        <div className="preference-list">
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-icon">🔔</span>
              <span className="preference-text">Nhắc nhở hàng ngày</span>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={notificationSettings.dailyReminder}
                onChange={() => handleSettingToggle('dailyReminder')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-icon">📊</span>
              <span className="preference-text">Cập nhật tiến trình cai thuốc</span>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={notificationSettings.progressUpdate}
                onChange={() => handleSettingToggle('progressUpdate')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-icon">⭕</span>
              <span className="preference-text">Nhắc tái lập mục tiêu</span>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={notificationSettings.goalReminder}
                onChange={() => handleSettingToggle('goalReminder')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-icon">👨‍⚕️</span>
              <span className="preference-text">Thông báo từ cố vấn</span>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={notificationSettings.counselorNotification}
                onChange={() => handleSettingToggle('counselorNotification')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-icon">📰</span>
              <span className="preference-text">Tin tức, blog hữu ích</span>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={notificationSettings.blogUpdate}
                onChange={() => handleSettingToggle('blogUpdate')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Notification delivery methods section */}
      <div className="delivery-methods">
        <h2 className="section-title">
          <span className="icon">📱</span> Thiết lập phương thức nhận
        </h2>
        
        <div className="method-list">
          <div className="method-item">
            <div className="method-info">
              <input 
                type="checkbox" 
                id="app-method" 
                checked={deliveryMethods.app}
                onChange={() => handleDeliveryToggle('app')}
              />
              <label htmlFor="app-method">
                <span className="method-icon">📱</span>
                <span className="method-text">Ứng dụng (App/Web)</span>
              </label>
            </div>
          </div>
          
          <div className="method-item">
            <div className="method-info">
              <input 
                type="checkbox" 
                id="email-method" 
                checked={deliveryMethods.email}
                onChange={() => handleDeliveryToggle('email')}
              />
              <label htmlFor="email-method">
                <span className="method-icon">✉️</span>
                <span className="method-text">Email</span>
              </label>
            </div>
          </div>
          
          <div className="method-item">
            <div className="method-info">
              <input 
                type="checkbox" 
                id="sms-method" 
                checked={deliveryMethods.sms}
                onChange={() => handleDeliveryToggle('sms')}
              />
              <label htmlFor="sms-method">
                <span className="method-icon">💬</span>
                <span className="method-text">SMS</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
