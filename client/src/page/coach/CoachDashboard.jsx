import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaUsers, FaCheckCircle, FaClock, FaChartBar } from 'react-icons/fa';
import '../../styles/CoachDashboard.css';

function CoachDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    totalClients: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = () => {
    if (!user || user.role !== 'coach') {
      setLoading(false);
      return;
    }

    try {
      // Lấy tất cả appointments từ localStorage
      const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      
      // Lọc chỉ những appointments của coach hiện tại
      const coachBookings = allAppointments.filter(appointment => 
        appointment.coachId === user.id
      );

      // Tính toán thống kê
      const now = new Date();
      const upcomingBookings = coachBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= now && booking.status === 'confirmed';
      });

      const completedBookings = coachBookings.filter(booking => 
        booking.status === 'completed' || booking.completed
      );

      // Đếm số client duy nhất
      const uniqueClients = new Set(coachBookings.map(booking => booking.userId));

      setStats({
        totalBookings: coachBookings.length,
        upcomingBookings: upcomingBookings.length,
        completedBookings: completedBookings.length,
        totalClients: uniqueClients.size
      });

      // Lấy 5 booking gần nhất
      const recentBookings = coachBookings
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setRecentBookings(recentBookings);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#007bff';
      case 'completed':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  if (!user || user.role !== 'coach') {
    return (
      <div className="coach-dashboard-container">
        <div className="access-denied">
          <h2>Không có quyền truy cập</h2>
          <p>Bạn cần đăng nhập với tài khoản coach để xem trang này.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="coach-dashboard-container">
        <div className="loading">
          <p>Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="coach-dashboard-container">
      <div className="dashboard-header">
        <h1>
          <FaChartBar className="header-icon" />
          Dashboard
        </h1>
        <p>Chào mừng trở lại, {user.name}!</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card total-bookings">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>{stats.totalBookings}</h3>
            <p>Tổng số booking</p>
          </div>
        </div>

        <div className="stat-card upcoming-bookings">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats.upcomingBookings}</h3>
            <p>Lịch sắp tới</p>
          </div>
        </div>

        <div className="stat-card completed-bookings">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.completedBookings}</h3>
            <p>Đã hoàn thành</p>
          </div>
        </div>

        <div className="stat-card total-clients">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.totalClients}</h3>
            <p>Tổng khách hàng</p>
          </div>
        </div>
      </div>

      <div className="recent-bookings">
        <h2>Booking gần đây</h2>
        {recentBookings.length === 0 ? (
          <div className="empty-bookings">
            <FaCalendarAlt className="empty-icon" />
            <p>Chưa có booking nào</p>
          </div>
        ) : (
          <div className="bookings-list">
            {recentBookings.map(booking => (
              <div key={booking.id} className="booking-item">
                <div className="booking-info">
                  <h4>{booking.userName || 'Người dùng'}</h4>
                  <p>{booking.userEmail}</p>
                  <div className="booking-datetime">
                    <span>{formatDate(booking.date)} - {booking.time}</span>
                  </div>
                </div>
                <div 
                  className="booking-status"
                  style={{ backgroundColor: getStatusColor(booking.status) }}
                >
                  {getStatusText(booking.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CoachDashboard;
