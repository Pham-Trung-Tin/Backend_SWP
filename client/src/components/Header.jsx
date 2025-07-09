import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';
import { useMembership } from '../context/MembershipContext';
import membershipApi from '../utils/membershipApi';
import { formatMembershipName } from '../utils/membershipUtils';
import './Header.css';

export default function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // Add this state for notification count
  const [avatarClass, setAvatarClass] = useState('');
  const prevAvatarRef = useRef('');
  const { user, logout } = useAuth();
  const { getCurrentMembershipInfo } = useMembership();
  
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
  
  // Tải thông tin membership mới nhất từ backend mỗi khi component được render
  useEffect(() => {
    const loadMembershipFromBackend = async () => {
      // Kiểm tra cả user và token trước khi gọi API
      const token = localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token');
      if (user && user.id && token) {
        try {
          console.log('Header - Calling membership API with token available');
          // Gọi API để lấy thông tin membership hiện tại
          const response = await membershipApi.getCurrentMembership();
          console.log('Header - Membership data loaded from backend:', response);
          
          if (response.success && response.data) {
            // Xác định membership value từ response
            let membershipValue = 'free';
            if (response.data.package_name) {
              const packageName = response.data.package_name.toLowerCase();
              if (packageName.includes('pro')) {
                membershipValue = 'pro';
              } else if (packageName.includes('premium')) {
                membershipValue = 'premium';
              } else if (response.data.package_id !== 1) {
                membershipValue = 'premium';
              }
            }
            
            console.log('Header - Membership value determined:', membershipValue);
            
            // Cập nhật user trong context nếu membership đã thay đổi
            if (membershipValue !== user.membership) {
              console.log('Header - Membership changed, updating user context:', 
                        { old: user.membership, new: membershipValue });
              
              // Lấy user từ storage
              const storageUser = JSON.parse(localStorage.getItem('nosmoke_user') || sessionStorage.getItem('nosmoke_user') || '{}');
              
              // Cập nhật membership
              storageUser.membership = membershipValue;
              storageUser.membershipType = membershipValue;
              storageUser.packageDetails = response.data;
              
              // Lưu lại vào storage
              if (localStorage.getItem('nosmoke_remember') === 'true') {
                localStorage.setItem('nosmoke_user', JSON.stringify(storageUser));
              } else {
                sessionStorage.setItem('nosmoke_user', JSON.stringify(storageUser));
              }
              
              // Force re-render bằng cách update state
              setAvatarClass('membership-updated');
              setTimeout(() => setAvatarClass(''), 600);
              
              // Phát sự kiện để thông báo user đã cập nhật
              window.dispatchEvent(new CustomEvent('user-updated', { 
                detail: { user: storageUser }
              }));
            }
          }
        } catch (err) {
          console.error('Error loading membership in Header:', err);
        }
      } else {
        console.log('Header - Skipping membership API call: User or token not available', 
                   { hasUser: !!user, hasToken: !!token });
      }
    };
    
    // Chỉ gọi API khi user đã đăng nhập
    if (user) {
      // Gọi API ngay lập tức khi component mount
      loadMembershipFromBackend();
      
      // Tải lại sau mỗi 2 phút để đảm bảo dữ liệu luôn mới
      const intervalId = setInterval(loadMembershipFromBackend, 120000);
      return () => clearInterval(intervalId);
    }
  }, [user]);
  
  // Lắng nghe sự kiện user-updated để cập nhật membership label
  useEffect(() => {
    const handleUserUpdated = (event) => {
      console.log('Header - User updated event received:', event.detail);
      
      if (event.detail && event.detail.user) {
        // Force re-render để hiển thị nhãn membership mới
        setAvatarClass('membership-updated');
        setTimeout(() => setAvatarClass(''), 600);
      }
    };
    
    // Đăng ký lắng nghe sự kiện
    window.addEventListener('user-updated', handleUserUpdated);
    
    // Hủy đăng ký khi component unmount
    return () => {
      window.removeEventListener('user-updated', handleUserUpdated);
    };
  }, []);

  // Hàm hiển thị nhãn thành viên từ backend
  const renderMembershipLabel = () => {
    // Lấy membership từ các nguồn khác nhau và xác định giá trị cuối cùng
    let membershipValue = null;
    
    // Debug thông tin membership
    console.log('Rendering membership label with:', { 
      membership: user?.membership, 
      membershipType: user?.membershipType,
      userObj: user
    });
    
    // Ưu tiên 1: Lấy từ user.membership (đã đồng bộ từ backend)
    if (user?.membership && user.membership !== 'free') {
      membershipValue = user.membership;
      console.log('Using membership from user object: ' + membershipValue);
    } 
    // Ưu tiên 2: Lấy từ user.membershipType nếu có
    else if (user?.membershipType && user.membershipType !== 'free') {
      membershipValue = user.membershipType;
      console.log('Using membershipType from user object: ' + membershipValue);
    } 
    // Ưu tiên 3: Thử lấy từ localStorage
    else {
      try {
        const storedUser = JSON.parse(localStorage.getItem('nosmoke_user') || '{}');
        if (storedUser.membership && storedUser.membership !== 'free') {
          membershipValue = storedUser.membership;
          console.log('Using membership from localStorage: ' + membershipValue);
        }
      } catch (error) {
        console.error('Error parsing localStorage user:', error);
      }
    }
    
    // Ưu tiên 4: Thử lấy từ sessionStorage
    if (!membershipValue || membershipValue === 'free') {
      try {
        const sessionUser = JSON.parse(sessionStorage.getItem('nosmoke_user') || '{}');
        if (sessionUser.membership && sessionUser.membership !== 'free') {
          membershipValue = sessionUser.membership;
          console.log('Using membership from sessionStorage: ' + membershipValue);
        }
      } catch (error) {
        console.error('Error parsing sessionStorage user:', error);
      }
    }
    
    // Ưu tiên 5: Kiểm tra packageDetails trong user object
    if (!membershipValue || membershipValue === 'free') {
      if (user?.packageDetails) {
        const packageName = user.packageDetails.package_name?.toLowerCase();
        if (packageName) {
          if (packageName.includes('pro')) {
            membershipValue = 'pro';
          } else if (packageName.includes('premium')) {
            membershipValue = 'premium';
          } else if (user.packageDetails.package_id !== 1) {
            membershipValue = 'premium';
          }
          console.log('Using membership from packageDetails: ' + membershipValue);
        }
      }
    }
    
    // Nếu đã xác định được membership value, hiển thị label
    if (membershipValue && membershipValue !== 'free') {
      console.log('Rendering membership label: ' + membershipValue);
      return (
        <span className={`membership-label ${membershipValue}`}>
          {formatMembershipName(membershipValue)}
        </span>
      );
    }
    
    console.log('No membership label to render');
    return null;
  };

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
  
  // Lắng nghe sự kiện cập nhật avatar từ các `component` khác
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
    
    // Lắng nghe sự kiện membership-updated từ API
    const handleMembershipUpdate = (event) => {
      console.log('Header - Membership update event received:', event.detail);
      
      if (event.detail && event.detail.membership) {
        // Force re-render để hiển thị nhãn membership mới
        setAvatarClass('membership-updated');
        setTimeout(() => setAvatarClass(''), 600);
      }
    };
    
    // Đăng ký lắng nghe sự kiện membership-updated
    window.addEventListener('membership-updated', handleMembershipUpdate);
    
    // Hủy đăng ký khi component unmount
    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate);
      window.removeEventListener('membership-updated', handleMembershipUpdate);
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
                  {/* Hiển thị nhãn thành viên từ dữ liệu backend */}
                  {renderMembershipLabel()}
                </span>
              </button>                {isUserMenuOpen && (
                <div className="user-dropdown-menu">
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                    <i className="fas fa-user"></i> Hồ sơ cá nhân
                  </Link>
                  <Link to="/membership" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                    <i className="fas fa-crown"></i> Quản lý gói thành viên
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
//