import React, { useState, useEffect } from 'react';
import { FaInbox, FaSearch, FaComments } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getCoachAppointments, getUnreadMessageCounts } from '../../utils/coachApiIntegration';
import CoachMessagePanel from '../../components/CoachMessagePanel';
import '../../styles/CoachMessagingCustom.css';

const CoachMessaging = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showMessagePanel, setShowMessagePanel] = useState(false);

  // Tải danh sách cuộc hẹn
  useEffect(() => {
    if (user) { // Relaxed role restriction
      loadAppointments();
      loadUnreadCounts();
      
      // Thiết lập polling cho số lượng tin nhắn chưa đọc
      const unreadInterval = setInterval(() => {
        loadUnreadCounts();
      }, 5000);
      
      return () => {
        clearInterval(unreadInterval);
      };
    }
  }, [user]);

  // Tải danh sách cuộc hẹn từ API
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await getCoachAppointments();
      console.log('API appointments data:', response?.data); // Debug log
      if (response?.success && Array.isArray(response?.data)) {
        // Map API data to expected structure
        const mapped = response.data.map(appt => ({
          id: appt.id || appt.appointmentId || appt._id,
          userName: appt.userName || appt.username || appt.user_name || appt.name || 'Người dùng',
          date: appt.date || appt.appointment_date || appt.createdAt || appt.time,
          userAvatar: appt.userAvatar || appt.avatar || appt.user_avatar,
          ...appt
        }));
        setAppointments(mapped);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách cuộc hẹn:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Tải số lượng tin nhắn chưa đọc
  const loadUnreadCounts = async () => {
    try {
      const response = await getUnreadMessageCounts();
      
      if (response?.success && response?.data) {
        setUnreadCounts(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải số lượng tin nhắn chưa đọc:', error);
    }
  };

  // Xử lý khi chọn một cuộc hẹn để chat
  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowMessagePanel(true);
  };

  // Lọc danh sách cuộc hẹn theo từ khóa tìm kiếm
  const filteredAppointments = appointments.filter(appointment => {
    const userName = appointment.userName || '';
    const id = appointment.id?.toString() || '';
    const searchLower = searchTerm.toLowerCase();
    return userName.toLowerCase().includes(searchLower) || id.includes(searchLower);
  });

  // Đóng panel tin nhắn
  const handleCloseMessagePanel = () => {
    setShowMessagePanel(false);
    setSelectedAppointment(null);
    // Cập nhật số lượng tin nhắn chưa đọc sau khi đóng chat
    loadUnreadCounts();
  };

  // Định dạng ngày giờ
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Định dạng thời gian
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Lấy avatar người dùng
  const getUserAvatar = (appointment) => {
    if (appointment.userAvatar) {
      return appointment.userAvatar;
    }
    // Sử dụng avatar mặc định khác nhau dựa trên ID cuộc hẹn
    const avatars = [
      '/image/default-user-avatar.svg',
      '/image/default-user-avatar-green.svg'
    ];
    return avatars[appointment.id % avatars.length];
  };

  return (
    <div className="coach-messaging-container">
      {/* Sidebar: Chat List */}
      <aside className="coach-messaging-sidebar">
        <header className="coach-messaging-sidebar-header">
          <h2 className="coach-messaging-sidebar-title">
            <FaComments className="coach-messaging-sidebar-title-icon" /> Tin nhắn của bạn
          </h2>
        </header>
        <div className="coach-messaging-sidebar-search">
          <div className="coach-messaging-search-box">
            <FaSearch className="coach-messaging-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="coach-messaging-search-input"
            />
          </div>
        </div>
        <nav className="coach-messaging-sidebar-list">
          {loading ? (
            <div className="coach-messaging-sidebar-loading">
              <p>Đang tải...</p>
            </div>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map(appointment => (
              <button
                key={appointment.id}
                className={`coach-messaging-sidebar-item${selectedAppointment?.id === appointment.id ? ' selected' : ''}`}
                onClick={() => handleSelectAppointment(appointment)}
              >
                <div className="coach-messaging-sidebar-item-content">
                  <div className="coach-messaging-sidebar-item-id">Cuộc hẹn #{appointment.id}</div>
                </div>
                <FaComments className="coach-messaging-sidebar-item-icon" />
              </button>
            ))
          ) : (
            <div className="coach-messaging-sidebar-empty">
              <p>Không có cuộc hẹn nào.</p>
            </div>
          )}
        </nav>
      </aside>
      {/* Main: Message Panel */}
      <main className="coach-messaging-chat-area">
        {showMessagePanel && selectedAppointment ? (
          <CoachMessagePanel
            appointment={selectedAppointment}
            onClose={handleCloseMessagePanel}
          />
        ) : (
          <div className="coach-messaging-chat-placeholder">
            Chọn một cuộc hẹn để xem tin nhắn
          </div>
        )}
      </main>
    </div>
  );
};

export default CoachMessaging;
