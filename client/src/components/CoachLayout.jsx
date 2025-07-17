import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaCalendarAlt, FaTachometerAlt, FaUser, FaComments } from 'react-icons/fa';
import '../styles/CoachLayout.css';

function CoachLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Kiểm tra nếu không phải coach
  if (!user || user.role !== 'coach') {
    return (
      <div className="coach-layout">
        <div className="access-denied">
          <h2>Không có quyền truy cập</h2>
          <p>Bạn cần đăng nhập với tài khoản coach để truy cập trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="coach-layout">
      <div className="coach-sidebar">
        <div className="coach-profile">
          <img 
            src={user.avatar || 'https://via.placeholder.com/60'} 
            alt={user.name} 
            className="coach-avatar"
          />
          <h3>{user.name}</h3>
          <p>{user.specialization}</p>
          <div className="coach-rating">
            <span className="rating-stars">
              {'★'.repeat(Math.floor(user.rating || 5))}
            </span>
            <span className="rating-value">({user.rating || 5.0})</span>
          </div>
        </div>

        <nav className="coach-nav">
          <ul>
            <li>
              <button 
                onClick={() => navigate('/coach')}
                className={`nav-btn${location.pathname === '/coach' ? ' active' : ''}`}
              >
                <FaTachometerAlt /> Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigate('/coach/bookings')}
                className={`nav-btn${location.pathname.startsWith('/coach/bookings') ? ' active' : ''}`}
              >
                <FaCalendarAlt /> Quản lý Booking
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigate('/coach/messages')}
                className={`nav-btn${location.pathname.startsWith('/coach/messages') ? ' active' : ''}`}
              >
                <FaComments /> Tin nhắn
              </button>
            </li>
          </ul>
        </nav>

        <div className="coach-logout">
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </div>

      <div className="coach-content">
        <Outlet />
      </div>
    </div>
  );
}

export default CoachLayout;
