import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaUser, FaClock, FaCheck, FaTimes, FaEdit, FaComments } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../styles/CoachBookings.css';

function CoachBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'upcoming', 'completed', 'cancelled'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, [user]);

  useEffect(() => {
    filterBookings();
  }, [bookings, filter]);

  const loadBookings = () => {
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

      // Sắp xếp theo ngày tạo mới nhất
      const sortedBookings = coachBookings.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setBookings(sortedBookings);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải danh sách booking:', error);
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];
    const now = new Date();

    switch (filter) {
      case 'pending':
        filtered = bookings.filter(booking => booking.status === 'pending');
        break;
      case 'upcoming':
        filtered = bookings.filter(booking => {
          const bookingDate = new Date(booking.date);
          return bookingDate >= now && booking.status === 'confirmed';
        });
        break;
      case 'completed':
        filtered = bookings.filter(booking => 
          booking.status === 'completed' || booking.completed
        );
        break;
      case 'cancelled':
        filtered = bookings.filter(booking => booking.status === 'cancelled');
        break;
      default:
        // 'all' - giữ nguyên
        break;
    }

    setFilteredBookings(filtered);
  };

  const updateBookingStatus = (bookingId, newStatus) => {
    try {
      const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const updatedAppointments = allAppointments.map(appointment =>
        appointment.id === bookingId
          ? { ...appointment, status: newStatus, completed: newStatus === 'completed' }
          : appointment
      );
      
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      loadBookings(); // Reload data
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái booking:', error);
    }
  };

  const handleSendMessage = (booking) => {
    // Chuyển hướng đến trang chat với thông tin người dùng
    navigate('/coach/chat', { 
      state: { 
        userId: booking.userId,
        userName: booking.userName,
        userEmail: booking.userEmail 
      } 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffc107'; // Màu vàng cho chờ xác nhận
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
      case 'pending':
        return 'Chờ xác nhận';
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
      <div className="coach-bookings-container">
        <div className="access-denied">
          <h2>Không có quyền truy cập</h2>
          <p>Bạn cần đăng nhập với tài khoản coach để xem trang này.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="coach-bookings-container">
        <div className="loading">
          <p>Đang tải danh sách booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="coach-bookings-container">
      <div className="bookings-header">
        <h1>
          <FaCalendarAlt className="header-icon" />
          Danh sách Booking
        </h1>
        <p>Chào {user.name}, đây là danh sách các cuộc hẹn của bạn</p>
      </div>

      <div className="bookings-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Tất cả ({bookings.length})
        </button>
        <button
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          Chờ xác nhận ({bookings.filter(b => b.status === 'pending').length})
        </button>
        <button
          className={filter === 'upcoming' ? 'active' : ''}
          onClick={() => setFilter('upcoming')}
        >
          Sắp tới ({bookings.filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate >= new Date() && b.status === 'confirmed';
          }).length})
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Đã hoàn thành ({bookings.filter(b => b.status === 'completed' || b.completed).length})
        </button>
        <button
          className={filter === 'cancelled' ? 'active' : ''}
          onClick={() => setFilter('cancelled')}
        >
          Đã hủy ({bookings.filter(b => b.status === 'cancelled').length})
        </button>
      </div>

      <div className="bookings-list">
        {filteredBookings.length === 0 ? (
          <div className="empty-bookings">
            <FaCalendarAlt className="empty-icon" />
            <h3>Không có booking nào</h3>
            <p>
              {filter === 'all' 
                ? 'Chưa có ai đặt lịch hẹn với bạn.'
                : `Không có booking nào trong trạng thái "${getStatusText(filter === 'upcoming' ? 'confirmed' : filter)}".`
              }
            </p>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div className="booking-id">
                  <span>#{booking.id}</span>
                </div>
                <div 
                  className="booking-status"
                  style={{ backgroundColor: getStatusColor(booking.status) }}
                >
                  {getStatusText(booking.status)}
                </div>
              </div>

              <div className="booking-content">
                <div className="booking-user">
                  <FaUser className="booking-icon" />
                  <div className="user-info">
                    <h4>{booking.userName || 'Người dùng'}</h4>
                    <p>{booking.userEmail}</p>
                  </div>
                </div>

                <div className="booking-datetime">
                  <div className="booking-date">
                    <FaCalendarAlt className="booking-icon" />
                    <span>{formatDate(booking.date)}</span>
                  </div>
                  <div className="booking-time">
                    <FaClock className="booking-icon" />
                    <span>{formatTime(booking.time)}</span>
                  </div>
                </div>
              </div>

              <div className="booking-actions">
                {booking.status === 'pending' && (
                  <>
                    <button
                      className="action-btn confirm-btn"
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      title="Xác nhận lịch hẹn"
                    >
                      <FaCheck /> Xác nhận
                    </button>
                    <button
                      className="action-btn cancel-btn"
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      title="Từ chối lịch hẹn"
                    >
                      <FaTimes /> Từ chối
                    </button>
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <>
                    <button
                      className="action-btn complete-btn"
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      title="Đánh dấu hoàn thành"
                    >
                      <FaCheck /> Hoàn thành
                    </button>
                    <button
                      className="action-btn cancel-btn"
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      title="Hủy cuộc hẹn"
                    >
                      <FaTimes /> Hủy
                    </button>
                    <button
                      className="action-btn message-btn"
                      onClick={() => handleSendMessage(booking)}
                      title="Gửi tin nhắn cho người dùng"
                    >
                      <FaComments /> Nhắn tin
                    </button>
                  </>
                )}
                {booking.status === 'completed' && (
                  <button
                    className="action-btn message-btn"
                    onClick={() => handleSendMessage(booking)}
                    title="Gửi tin nhắn cho người dùng"
                  >
                    <FaComments /> Nhắn tin
                  </button>
                )}
                {booking.status === 'cancelled' && (
                  <button
                    className="action-btn restore-btn"
                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                    title="Khôi phục cuộc hẹn"
                  >
                    <FaEdit /> Khôi phục
                  </button>
                )}
              </div>

              <div className="booking-footer">
                <small>Đặt lịch: {new Date(booking.createdAt).toLocaleString('vi-VN')}</small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CoachBookings;
