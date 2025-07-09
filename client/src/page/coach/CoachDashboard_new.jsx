import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaUsers, FaCheckCircle, FaClock, FaChartBar, FaComments, FaSearch, FaBell, FaUserMd, FaCheck, FaPaperPlane, FaTimes } from 'react-icons/fa';
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

  // New messaging states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // New useEffect for loading appointments and unread counts
  useEffect(() => {
    if (user?.role === 'coach') {
      loadCoachAppointments();
      loadUnreadCounts();
    }
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
        appointment.coachName === user.fullName || appointment.coachName === user.name
      );

      // Tính toán thống kê
      const now = new Date();
      const upcomingBookings = coachBookings.filter(booking => {
        const appointmentDate = new Date(booking.date);
        return appointmentDate >= now && booking.status !== 'cancelled';
      });

      const completedBookings = coachBookings.filter(booking => 
        booking.status === 'completed' || booking.completed === true
      );

      // Lấy danh sách unique clients
      const uniqueClients = [...new Set(coachBookings.map(booking => booking.userId))];

      setStats({
        totalBookings: coachBookings.length,
        upcomingBookings: upcomingBookings.length,
        completedBookings: completedBookings.length,
        totalClients: uniqueClients.length
      });

      // Lấy 5 booking gần đây nhất
      const sortedBookings = coachBookings
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 5);

      setRecentBookings(sortedBookings);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // New messaging functions
  const loadCoachAppointments = () => {
    const storedAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
    // Filter appointments for this coach based on coach name
    const coachAppointments = storedAppointments.filter(
      app => app.coachName === user?.fullName || app.coachName === user?.name
    );
    setAppointments(coachAppointments);
  };

  const loadUnreadCounts = () => {
    const storedAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const coachAppointments = storedAppointments.filter(
      app => app.coachName === user?.fullName || app.coachName === user?.name
    );
    
    const counts = {};
    coachAppointments.forEach(appointment => {
      const chatKey = `coach_chat_${appointment.id}`;
      const messages = JSON.parse(localStorage.getItem(chatKey)) || [];
      const unreadCount = messages.filter(msg => 
        msg.sender === 'user' && !msg.readByCoach
      ).length;
      counts[appointment.id] = unreadCount;
    });
    
    setUnreadCounts(counts);
  };

  const handleSendMessage = (appointmentId, messageText) => {
    if (!messageText.trim()) return;

    const chatKey = `coach_chat_${appointmentId}`;
    const existingMessages = JSON.parse(localStorage.getItem(chatKey)) || [];
    
    const newMessage = {
      id: existingMessages.length + 1,
      text: messageText.trim(),
      sender: 'coach',
      timestamp: new Date().toISOString(),
      readByUser: false
    };

    const updatedMessages = [...existingMessages, newMessage];
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));

    // Mark as unread for user
    const userUnreadKey = `unread_messages_${appointmentId}`;
    const currentUserUnread = parseInt(localStorage.getItem(userUnreadKey) || '0');
    localStorage.setItem(userUnreadKey, (currentUserUnread + 1).toString());

    // Update local messages if this is the active chat
    if (selectedAppointment?.id === appointmentId) {
      setMessages(updatedMessages);
    }

    // Clear input
    setMessageInput('');
    
    // Trigger refresh
    loadUnreadCounts();
  };

  const handleOpenMessaging = (appointment) => {
    setSelectedAppointment(appointment);
    setShowMessaging(true);
    
    // Load messages for this appointment
    const chatKey = `coach_chat_${appointment.id}`;
    const chatMessages = JSON.parse(localStorage.getItem(chatKey)) || [];
    
    // Mark messages as read by coach
    const updatedMessages = chatMessages.map(msg => ({
      ...msg,
      readByCoach: msg.sender === 'user' ? true : msg.readByCoach
    }));
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
    
    // Update unread counts
    loadUnreadCounts();
  };

  const handleConfirmAppointment = (appointmentId) => {
    const storedAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const updatedAppointments = storedAppointments.map(app => 
      app.id === appointmentId ? { ...app, status: 'confirmed' } : app
    );
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    
    // Send confirmation message
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
      const confirmMessage = `Xin chào ${appointment.userName}! Tôi đã xác nhận lịch hẹn của bạn vào ngày ${new Date(appointment.date).toLocaleDateString('vi-VN')} lúc ${appointment.time}. Hãy chuẩn bị sẵn sàng nhé! 😊`;
      handleSendMessage(appointmentId, confirmMessage);
    }
    
    loadCoachAppointments();
    loadDashboardData(); // Reload dashboard stats
  };

  const sendQuickMessage = (appointmentId, template) => {
    const quickMessages = {
      welcome: "Xin chào! Tôi sẽ hỗ trợ bạn trong hành trình cai thuốc. Bạn có thể chia sẻ với tôi về tình trạng hiện tại của mình không?",
      reminder: "Nhắc nhở: Lịch hẹn của chúng ta sắp tới. Bạn đã chuẩn bị sẵn sàng chưa?",
      support: "Tôi hiểu rằng cai thuốc không dễ dàng. Hãy nhớ rằng tôi luôn ở đây để hỗ trợ bạn. Bạn có cảm thấy khó khăn gì không?",
      progress: "Hôm nay bạn cảm thấy thế nào? Hãy chia sẻ với tôi về tiến trình cai thuốc của bạn nhé!",
      motivation: "Bạn đang làm rất tốt! Hãy tiếp tục kiên trì, mỗi ngày không hút thuốc là một chiến thắng! 💪"
    };
    
    handleSendMessage(appointmentId, quickMessages[template]);
  };

  const getTotalUnreadMessages = () => {
    return Object.values(unreadCounts).reduce((total, count) => total + count, 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  // Filter appointments for messaging tab
  const filteredAppointments = appointments.filter(appointment =>
    appointment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Guard clauses
  if (!user || user.role !== 'coach') {
    return (
      <div className="coach-dashboard-container">
        <div className="access-denied">
          <h2>Truy cập bị từ chối</h2>
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
          Coach Dashboard - {user?.fullName || user?.name}
        </h1>
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaChartBar /> Dashboard
          </button>
          <button 
            className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <FaComments /> Tin nhắn
            {getTotalUnreadMessages() > 0 && (
              <span className="unread-badge">{getTotalUnreadMessages()}</span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="dashboard-content">
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

          <div className="recent-bookings-section">
            <h2>Lịch hẹn gần đây</h2>
            {recentBookings.length > 0 ? (
              <div className="bookings-list">
                {recentBookings.map(booking => (
                  <div key={booking.id} className="booking-item">
                    <div className="booking-info">
                      <h4>{booking.userName}</h4>
                      <p>{booking.userEmail}</p>
                      <span className="booking-date">
                        {new Date(booking.date).toLocaleDateString('vi-VN')} - {booking.time}
                      </span>
                    </div>
                    <div className="booking-status">
                      <span className={`status ${booking.status}`}>
                        {booking.status === 'confirmed' ? 'Đã xác nhận' : 
                         booking.status === 'pending' ? 'Chờ xác nhận' : 'Đã hoàn thành'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Chưa có lịch hẹn nào.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="messaging-section">
          <div className="section-header">
            <h2>Quản lý tin nhắn với khách hàng</h2>
            <div className="search-bar">
              <FaSearch />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="appointments-messaging-grid">
            {filteredAppointments.map(appointment => (
              <div 
                key={appointment.id} 
                className={`appointment-message-card ${unreadCounts[appointment.id] > 0 ? 'has-unread' : ''}`}
                onClick={() => handleOpenMessaging(appointment)}
              >
                <div className="appointment-info">
                  <h4>{appointment.userName || 'Người dùng'}</h4>
                  <p>{appointment.userEmail}</p>
                  <div className="appointment-datetime">
                    <span>{formatDate(appointment.date)} - {appointment.time}</span>
                  </div>
                </div>
                <div className="appointment-status">
                  {appointment.status === 'confirmed' ? (
                    <span className="status-confirmed">Đã xác nhận</span>
                  ) : appointment.status === 'pending' ? (
                    <div className="pending-actions">
                      <span className="status-pending">Chưa xác nhận</span>
                      <button 
                        className="confirm-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmAppointment(appointment.id);
                        }}
                      >
                        <FaCheck /> Xác nhận
                      </button>
                    </div>
                  ) : (
                    <span className={`status-${appointment.status}`}>{appointment.status}</span>
                  )}
                </div>
                {unreadCounts[appointment.id] > 0 && (
                  <div className="unread-messages">
                    <FaBell />
                    <span className="unread-count">{unreadCounts[appointment.id]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {showMessaging && selectedAppointment && (
            <div className="chat-container">
              <div className="chat-header">
                <h3>Nhắn tin với {selectedAppointment.userName}</h3>
                <button className="close-chat" onClick={() => setShowMessaging(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>Chưa có tin nhắn nào. Hãy gửi tin nhắn chào hỏi!</p>
                  </div>
                ) : (
                  messages.map(message => (
                    <div key={message.id} className={`message-item ${message.sender}`}>
                      <div className="message-content">
                        <p>{message.text}</p>
                      </div>
                      <div className="message-info">
                        <span className="message-sender">{message.sender === 'coach' ? 'Bạn' : selectedAppointment.userName}</span>
                        <span className="message-timestamp">{new Date(message.timestamp).toLocaleTimeString('vi-VN')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="chat-input">
                <input 
                  type="text" 
                  placeholder="Nhập tin nhắn của bạn..." 
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage(selectedAppointment.id, messageInput)}
                />
                <button 
                  className="send-button"
                  onClick={() => handleSendMessage(selectedAppointment.id, messageInput)}
                >
                  <FaPaperPlane />
                </button>
              </div>
              
              <div className="quick-messages">
                <h4>Tin nhắn nhanh:</h4>
                <div className="quick-message-buttons">
                  <button onClick={() => sendQuickMessage(selectedAppointment.id, 'welcome')}>
                    Chào mừng
                  </button>
                  <button onClick={() => sendQuickMessage(selectedAppointment.id, 'reminder')}>
                    Nhắc nhở
                  </button>
                  <button onClick={() => sendQuickMessage(selectedAppointment.id, 'support')}>
                    Hỗ trợ
                  </button>
                  <button onClick={() => sendQuickMessage(selectedAppointment.id, 'progress')}>
                    Tiến trình
                  </button>
                  <button onClick={() => sendQuickMessage(selectedAppointment.id, 'motivation')}>
                    Động viên
                  </button>
                </div>
              </div>
            </div>
          )}

          {filteredAppointments.length === 0 && (
            <div className="no-appointments">
              <FaComments className="no-data-icon" />
              <h3>Chưa có cuộc trò chuyện nào</h3>
              <p>Khi có người đặt lịch hẹn với bạn, bạn sẽ có thể nhắn tin với họ ở đây.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CoachDashboard;
