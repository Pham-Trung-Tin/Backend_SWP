import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaTimes, FaVideo } from 'react-icons/fa';
import { getAppointmentMessages, sendAppointmentMessage, markMessagesAsRead } from '../utils/coachApiIntegration';
import { 
  initSocket, 
  joinAppointmentRoom, 
  sendMessageNotification,
  subscribeToMessages, 
  subscribeToMessagesRead,
  markMessagesAsRead as socketMarkMessagesAsRead
} from '../utils/socket';
import '../styles/CoachMessagePanel.css';
import JitsiMeeting from './JitsiMeeting';

const CoachMessagePanel = ({ appointment, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showJitsi, setShowJitsi] = useState(false);
  const messagesEndRef = useRef(null);
  const socketUnsubscribersRef = useRef([]);

  // Tải tin nhắn từ API khi component được mount
  useEffect(() => {
    if (appointment) {
      loadMessages();
      setupSocketConnection();
      
      // Thiết lập polling để tự cập nhật tin nhắn mỗi 10 giây
      // Đây là cơ chế backup trong trường hợp socket không hoạt động
      const pollingInterval = setInterval(() => {
        loadMessages(true);
      }, 10000);
      
      return () => {
        // Hủy đăng ký socket và clear interval khi unmount
        socketUnsubscribersRef.current.forEach(unsub => unsub && unsub());
        socketUnsubscribersRef.current = [];
        clearInterval(pollingInterval);
      };
    }
  }, [appointment]);

  // Thiết lập kết nối Socket.IO
  const setupSocketConnection = () => {
    // Khởi tạo socket
    initSocket();
    
    // Tham gia vào room của cuộc hẹn
    joinAppointmentRoom(appointment.id);      // Đăng ký nhận tin nhắn mới
    const unsubscribeMessages = subscribeToMessages(appointment.id, (newMessage) => {
      console.log('Nhận tin nhắn mới qua socket:', newMessage);
      
      // Đảm bảo luôn có tin nhắn mới nhất từ server
      if (newMessage) {
        // Tải lại toàn bộ tin nhắn khi nhận được thông báo nhưng đây là cập nhật real-time
        loadMessages(true);
        
        // Đánh dấu tin nhắn đã đọc nếu chat đang mở
        markMessagesAsRead(appointment.id)
          .then(() => socketMarkMessagesAsRead(appointment.id))
          .catch(error => console.error('Lỗi khi đánh dấu tin nhắn đã đọc:', error));
      }
    });
    
    // Đăng ký sự kiện tin nhắn đã đọc
    const unsubscribeMessagesRead = subscribeToMessagesRead(appointment.id, (data) => {
      // Cập nhật trạng thái đã đọc cho tin nhắn
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (data.reader === 'user' && msg.sender === 'coach') {
            return { ...msg, read_by_user: true };
          } else if (data.reader === 'coach' && msg.sender === 'user') {
            return { ...msg, read_by_coach: true };
          }
          return msg;
        })
      );
    });
    
    // Lưu hàm hủy đăng ký
    socketUnsubscribersRef.current = [unsubscribeMessages, unsubscribeMessagesRead];
  };

  // Tải tin nhắn từ API
  const loadMessages = async (isRealTimeUpdate = false) => {
    if (!appointment) return;
    
    // Chỉ hiển thị loading khi tải lần đầu, không hiển thị khi cập nhật real-time
    if (!isRealTimeUpdate) {
      setIsLoading(true);
    }
    
    try {
      console.log('Đang tải tin nhắn cho cuộc hẹn ID:', appointment.id);
      const response = await getAppointmentMessages(appointment.id);
      
      if (response?.success && response?.data) {
        console.log('Đã nhận tin nhắn từ API:', response.data);
        setMessages(response.data);
        
        // Đánh dấu tin nhắn đã đọc
        await markMessagesAsRead(appointment.id);
        socketMarkMessagesAsRead(appointment.id);
      } else {
        console.log('Không có tin nhắn hoặc API trả về lỗi');
        if (!isRealTimeUpdate) {
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải tin nhắn:', error);
      if (!isRealTimeUpdate) {
        setMessages([]);
      }
    } finally {
      if (!isRealTimeUpdate) {
        setIsLoading(false);
      }
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (input.trim() === '' || !appointment) return;
    
    const messageData = {
      text: input
    };
    
    // Thêm tin nhắn vào UI ngay lập tức để UX tốt hơn
    const tempMessage = {
      id: `temp-${Date.now()}`,
      text: input,
      sender: 'coach',
      timestamp: new Date().toISOString(),
      read_by_coach: true,
      read_by_user: false,
      pending: true
    };
    
    setMessages(prevMessages => [...prevMessages, tempMessage]);
    setInput('');
    
    try {
      // Gửi tin nhắn qua API
      const response = await sendAppointmentMessage(appointment.id, messageData);
      
      if (response?.success && response?.data) {
        // Thay tin nhắn tạm thời bằng tin nhắn thật từ server
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempMessage.id ? response.data : msg
          )
        );
        
        // Gửi tin nhắn qua socket để real-time - chỉ thông báo, không gửi nội dung
        // Phía server sẽ lấy nội dung từ database và gửi lại cho tất cả clients
        sendMessageNotification(appointment.id);
      } else {
        // Xử lý lỗi
        console.error('Không thể gửi tin nhắn');
        // Đánh dấu tin nhắn thất bại
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempMessage.id ? { ...msg, failed: true } : msg
          )
        );
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      // Đánh dấu tin nhắn thất bại
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempMessage.id ? { ...msg, failed: true } : msg
        )
      );
    }
  };

  // Xử lý phím Enter để gửi tin nhắn
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Định dạng thời gian tin nhắn
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  // Lấy avatar của người dùng
  const getUserAvatar = () => {
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

  // Lấy avatar của coach
  const getCoachAvatar = () => {
    if (appointment.coachAvatar) {
      return appointment.coachAvatar;
    }
    return '/image/default-coach-avatar.svg';
  };

  // Tạo roomName cho Jitsi từ appointment
  const jitsiRoomName = appointment ? `appointment-${appointment.id}` : '';

  return (
    <>
      {showJitsi && (
        <JitsiMeeting
          roomName={jitsiRoomName}
          onLeave={() => setShowJitsi(false)}
        />
      )}
      <div className="coach-message-panel">
        <header className="coach-message-header">
          <div className="coach-message-header-left">
            <h3 className="coach-message-title">#{appointment.id}</h3>
          </div>
          <div className="coach-message-header-actions">
            <button
              className="coach-message-video-btn"
              title="Bắt đầu gọi video"
              onClick={() => setShowJitsi(true)}
            >
              <FaVideo />
            </button>
            <button className="coach-message-close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </header>
        <div className="coach-message-messages-box">
          {isLoading ? (
            <div className="coach-message-loading">Đang tải tin nhắn...</div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="coach-message-empty">Chưa có tin nhắn nào.</div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`coach-message-row ${message.sender === 'coach' ? 'right' : 'left'}`}
                  >
                    <div
                      className={`coach-message-bubble ${message.sender === 'coach' ? 'coach' : 'user'}`}
                    >
                      <div>{message.text}</div>
                      <div className={`coach-message-time ${message.sender === 'coach' ? 'coach' : 'user'}`}>{message.failed ? 'Gửi thất bại' : (message.pending ? 'Đang gửi...' : formatTime(message.timestamp || message.created_at))}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        <footer className="coach-message-input-box">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            disabled={isLoading}
            className="coach-message-input"
          />
          <button
            className="coach-message-send-btn"
            onClick={handleSendMessage}
            disabled={isLoading || input.trim() === ''}
          >
            <FaPaperPlane />
          </button>
        </footer>
      </div>
    </>
  );
};


export default CoachMessagePanel;
