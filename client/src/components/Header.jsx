import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';
import { formatMembershipName } from '../utils/membershipUtils';
import './Header.css';

export default function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // Add this state for notification count
  const [avatarClass, setAvatarClass] = useState('');
  const prevAvatarRef = useRef('');
  const { user, logout } = useAuth();

  // Thêm useRef để theo dõi dropdown menu
  const userMenuRef = useRef(null);
  // Debug user membership và đảm bảo nhất quán
  useEffect(() => {
    if (user) {
      console.log('Header - User Membership:', user.membership);
      console.log('Header - User MembershipType:', user.membershipType);
      console.log('Header - User Object:', user);

      // Đảm bảo nhất quán giữa membership và membershipType
      if (!user.membership && user.membershipType) {
        console.log('Header - Syncing membership from membershipType:', user.membershipType);
        // Đánh dấu cần refresh để đồng bộ dữ liệu
        window.sessionStorage.setItem('membership_refresh_needed', 'true');
      }
    }
  }, [user]);

  const handleLoginClick = (e) => {
    e.preventDefault();
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  useEffect(() => {
    // Hàm xử lý click bên ngoài dropdown
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    // Thêm event listener khi dropdown đang mở
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Theo dõi thay đổi avatar để thêm hiệu ứng
  useEffect(() => {
    if (user?.profile_image && user.profile_image !== prevAvatarRef.current) {
      console.log('Header - Avatar changed:', user.profile_image);
      setAvatarClass('avatar-updated');
      prevAvatarRef.current = user.profile_image;
      
      // Xóa class hiệu ứng sau khi hoàn thành
      const timer = setTimeout(() => {
        setAvatarClass('');
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [user?.profile_image]);
  
  // Lắng nghe sự kiện cập nhật avatar từ các component khác
  useEffect(() => {
    const handleAvatarUpdate = (event) => {
      console.log('Header - Avatar update event received:', event.detail);
      
      // Force re-render khi có sự kiện avatar-updated
      if (event.detail.avatarUrl) {
        setAvatarClass('avatar-updated');
        
        // Xóa class hiệu ứng sau khi hoàn thành
        const timer = setTimeout(() => {
          setAvatarClass('');
        }, 600);
        
        return () => clearTimeout(timer);
      }
    };
    
    // Đăng ký lắng nghe sự kiện
    window.addEventListener('avatar-updated', handleAvatarUpdate);
    
    // Hủy đăng ký khi component unmount
    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate);
    };
  }, []);

  return (
    <header className="nosmoke-header">
      <div className="container">
        <div className="logo">
          <Link to="/">
            <span className="logo-text">No<span className="smoke">Smoke</span></span>
          </Link>
        </div>
        <div className="nav-actions">
          <Link to="/support" className="phone-link">
            <i className="fas fa-headset"></i>
            <span className="phone-text">Tư Vấn: 1800-1098</span>
          </Link>
          {user ? (
            <>
              <Link to="/notifications" className="nav-item notification-nav-item">
                <FaBell /> Thông báo
                {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
              </Link>              <div className="user-menu-container" ref={userMenuRef}>                <button className="user-menu-button" onClick={toggleUserMenu}>
                {user.profile_image ? (
                  <div className="user-avatar-container">
                    <img 
                      key={user.profile_image} // Key helps React recognize when to re-render
                      src={
                        // Handle avatar URL correctly based on format
                        user.profile_image && user.profile_image.startsWith('http') 
                          ? user.profile_image 
                          : `http://localhost:5000${user.profile_image || ''}`
                      } 
                      alt="Avatar" 
                      className={`user-avatar ${avatarClass}`}
                      onError={(e) => {
                        console.error("Avatar couldn't load:", e.target.src);
                        // Fallback to user initial
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.style.display = 'none';
                        const initialSpan = document.createElement('span');
                        initialSpan.className = 'user-initial';
                        initialSpan.textContent = (user.fullName || user.name || 'U').charAt(0);
                        e.target.parentNode.appendChild(initialSpan);
                      }}
                    />
                  </div>
                ) : (
                  <span className={`user-initial ${avatarClass}`}>{(user.fullName || user.name || 'U').charAt(0)}</span>
                )}
                <span className="user-name">
                  {user.fullName || user.name || 'User'}
                  {/* Kiểm tra cả hai trường hợp để hiển thị nhãn thành viên */}
                  {(user.membership && user.membership !== 'free') ? (
                    <span className={`membership-label ${user.membership}`}>
                      {formatMembershipName(user.membership)}
                    </span>
                  ) : (user.membershipType && user.membershipType !== 'free') && (
                    <span className={`membership-label ${user.membershipType}`}>
                      {formatMembershipName(user.membershipType)}
                    </span>
                  )}
                </span>
              </button>                {isUserMenuOpen && (
                <div className="user-dropdown-menu">
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                    <i className="fas fa-user"></i> Hồ sơ cá nhân
                  </Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                    <i className="fas fa-cog"></i> Cài đặt
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <i className="fas fa-sign-out-alt"></i> Đăng xuất
                  </button>
                </div>
              )}
              </div>
            </>
          ) : (
            <>
              <a href="#" className="login-btn" onClick={handleLoginClick}>Đăng nhập</a>
              <Link to="/signup" className="signup-btn">Đăng ký</Link>
            </>
          )}

          <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </div>
      </div>
    </header>
  );
}
