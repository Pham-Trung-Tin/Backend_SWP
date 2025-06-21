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
                <span className="user-initial">{(user.fullName || user.name || 'U').charAt(0)}</span>
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
