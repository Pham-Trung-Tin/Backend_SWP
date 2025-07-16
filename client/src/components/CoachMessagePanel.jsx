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
      <section className="flex flex-col h-full w-full bg-transparent" style={{borderRadius: 0, boxShadow: 'none', margin: 0, padding: 0}}>
        <header className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-white/90">
          <div className="flex items-center gap-3">
            {/* <img src={getUserAvatar()} alt={appointment.userName || 'Người dùng'} className="w-10 h-10 rounded-full object-cover bg-blue-100 border border-gray-200" /> */}
            <div>
              {/* Chỉ hiển thị appointment ID */}
              <h3 className="text-base font-semibold text-gray-800 m-0">#{appointment.id}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Video Call Button */}
            <button
              className="text-green-500 hover:bg-green-100 hover:text-green-700 rounded-full p-2 transition shadow-sm"
              title="Bắt đầu gọi video"
              onClick={() => setShowJitsi(true)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20 }}
            >
              <FaVideo />
            </button>
            <button className="text-gray-400 text-lg ml-2 hover:bg-gray-100 rounded-full p-1 transition" onClick={onClose} style={{border: 'none', background: 'none', cursor: 'pointer'}}>
              <FaTimes />
            </button>
          </div>
        </header>
        <div className="flex-1 px-3 py-2 overflow-y-auto bg-gradient-to-br from-white via-green-50 to-blue-50" style={{minHeight: 120}}>
          {isLoading ? (
            <div className="text-center text-gray-400 py-6 text-sm">
              <p>Đang tải tin nhắn...</p>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-6 text-sm">
                  <p>Chưa có tin nhắn nào.</p>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex mb-2 ${message.sender === 'coach' ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Remove avatar images and user/coach names */}
                    <div
                      className={`rounded-full px-3 py-1 min-w-[40px] shadow text-xs relative transition-all duration-200
                        ${message.sender === 'coach' ? 'bg-gradient-to-r from-green-400 via-green-200 to-green-100 text-gray-900 ml-1' : 'bg-gradient-to-r from-blue-200 via-blue-50 to-white text-gray-800 mr-1 border border-blue-100'}
                      `}
                      style={{
                        maxWidth: '80%',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-line',
                        overflowWrap: 'break-word',
                        fontSize: '13px',
                        padding: '6px 12px',
                        borderRadius: '18px',
                        boxShadow: '0 2px 8px rgba(67,233,123,0.08)'
                      }}
                    >
                      {/* Only show message text and time */}
                      <div>{message.text}</div>
                      <div className={`text-[10px] mt-1 text-right ${message.sender === 'coach' ? 'text-green-600' : 'text-blue-500'}`}>{message.failed ? 'Gửi thất bại' : (message.pending ? 'Đang gửi...' : formatTime(message.timestamp || message.created_at))}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        <footer className="flex items-center px-4 py-2 bg-white/90 border-t border-gray-100">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            disabled={isLoading}
            className="flex-1 rounded-full border border-gray-200 outline-none text-sm bg-gray-50 px-4 py-2 mr-2 shadow-sm"
          />
          <button
            className="rounded-full bg-green-500 hover:bg-green-600 text-white text-lg p-2 shadow transition disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={isLoading || input.trim() === ''}
            style={{minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
          >
            <FaPaperPlane />
          </button>
        </footer>
      </section>
    </>
  );
};


export default CoachMessagePanel;
