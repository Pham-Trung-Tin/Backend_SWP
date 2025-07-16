import React, { useState, useEffect } from 'react';
import { FaInbox, FaSearch, FaComments, FaChevronLeft } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getCoachAppointments, getUnreadMessageCounts } from '../../utils/coachApiIntegration';
import CoachMessagePanel from '../../components/CoachMessagePanel';
import '../../styles/CoachMessaging.css';

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
    <div className="coach-messaging flex h-full w-full min-h-[400px]" style={{flexDirection: 'row', background: 'transparent', borderRadius: '2rem', boxShadow: '0 4px 24px rgba(67,233,123,0.10)', overflow: 'hidden'}}>
      {/* Sidebar: Chat List */}
      <aside className="flex flex-col shrink-0 w-[270px] min-w-[220px] max-w-[300px] h-full bg-white rounded-3xl shadow-lg p-0" style={{background: 'linear-gradient(120deg,#43e97b 0%,#38f9d7 100%)', boxShadow: '0 4px 24px rgba(67,233,123,0.10)'}}>
        <header className="px-4 py-3 rounded-t-3xl" style={{background: 'linear-gradient(90deg,#43e97b 0%,#38f9d7 100%)'}}>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FaComments className="text-white text-lg" /> Tin nhắn của bạn
          </h2>
        </header>
        <div className="px-4 py-2 bg-transparent">
          <div className="flex items-center bg-white/80 rounded-full px-3 py-2 border border-gray-200 shadow-sm">
            <FaSearch className="text-gray-400 mr-2 text-base" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 rounded-full px-1"
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pb-2 bg-transparent">
          {loading ? (
            <div className="py-3 text-center text-gray-400 text-xs">
              <p>Đang tải...</p>
            </div>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map(appointment => (
              <button
                key={appointment.id}
                className={`flex items-center w-full px-2 py-2 my-1 rounded-full transition-all duration-200 shadow-sm text-xs group focus:outline-none border-2 ${selectedAppointment?.id === appointment.id ? 'bg-gradient-to-r from-green-100 to-green-50 border-green-400 shadow-md scale-[1.03]' : 'bg-white/90 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 border-transparent hover:shadow-lg hover:scale-105'} `}
                onClick={() => handleSelectAppointment(appointment)}
                style={{boxShadow: selectedAppointment?.id === appointment.id ? '0 4px 16px rgba(67,233,123,0.18)' : '0 1px 4px rgba(67,233,123,0.06)', minHeight: '44px', height: '44px'}}
              >
                <div className="flex-1 text-left">
                  {/* Chỉ hiển thị appointment ID */}
                  <div className="text-[10px] text-gray-400 transition-colors duration-200 group-hover:text-green-500">Cuộc hẹn #{appointment.id}</div>
                </div>
                <FaComments className={`transition-colors duration-200 ${selectedAppointment?.id === appointment.id ? 'text-green-400 text-base' : 'text-green-200 text-base group-hover:text-green-400'}`} />
              </button>
            ))
          ) : (
            <div className="py-3 text-center text-gray-400 text-xs">
              <p>Không có cuộc hẹn nào.</p>
            </div>
          )}
        </nav>
      </aside>
      {/* Main: Message Panel */}
      <main className="flex-1 flex flex-col h-full bg-gradient-to-br from-white via-green-50 to-blue-50 rounded-3xl ml-5 shadow-lg" style={{minWidth: 0}}>
        {showMessagePanel && selectedAppointment ? (
          <CoachMessagePanel
            appointment={selectedAppointment}
            onClose={handleCloseMessagePanel}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 text-base font-medium">
            Chọn một cuộc hẹn để xem tin nhắn
          </div>
        )}
      </main>
    </div>
  );
};

export default CoachMessaging;
