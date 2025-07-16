import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaPaperPlane, FaTimes } from 'react-icons/fa';
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

const CoachMessagePanel = ({ appointment, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const socketUnsubscribersRef = useRef([]);

  // Tải tin nhắn từ API khi component được mount
  useEffect(() => {
    if (appointment) {
      loadMessages();
      setupSocketConnection();
    }

    return () => {
      // Hủy đăng ký socket khi unmount
      socketUnsubscribersRef.current.forEach(unsub => unsub && unsub());
      socketUnsubscribersRef.current = [];
    };
  }, [appointment]);

  // Thiết lập kết nối Socket.IO
  const setupSocketConnection = () => {
    // Khởi tạo socket
    initSocket();
    
    // Tham gia vào room của cuộc hẹn
    joinAppointmentRoom(appointment.id);
    
    // Đăng ký nhận tin nhắn mới
    const unsubscribeMessages = subscribeToMessages(appointment.id, (newMessage) => {
      console.log('Nhận tin nhắn mới qua socket:', newMessage);
      setMessages(prevMessages => {
        // Kiểm tra xem tin nhắn đã tồn tại chưa
        const exists = prevMessages.some(msg => msg.id === newMessage.id);
        if (exists) return prevMessages;
        
        // Thêm tin nhắn mới
        const updatedMessages = [...prevMessages, newMessage];
        
        // Đánh dấu tin nhắn đã đọc nếu chat đang mở
        markMessagesAsRead(appointment.id)
          .then(() => socketMarkMessagesAsRead(appointment.id))
          .catch(error => console.error('Lỗi khi đánh dấu tin nhắn đã đọc:', error));
        
        return updatedMessages;
      });
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
  const loadMessages = async () => {
    if (!appointment) return;
    
    setIsLoading(true);
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
        setMessages([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải tin nhắn:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cuộn xuống tin nhắn cuối cùng khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        
        // Gửi thông báo qua socket để real-time
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

  return (
    <div className="coach-message-panel">
      <div className="message-panel-header">
        <div className="user-info">
          <img src={getUserAvatar()} alt={appointment.userName || 'Người dùng'} className="user-avatar" />
          <div>
            <h3>{appointment.userName || 'Người dùng'}</h3>
            <p>Cuộc hẹn #{appointment.id}</p>
          </div>
        </div>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="message-panel-content">
        {isLoading ? (
          <div className="loading-messages">
            <p>Đang tải tin nhắn...</p>
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            ) : (
              messages.map(message => (
                <div 
                  key={message.id} 
                  className={`message ${message.sender === 'user' ? 'user-message' : 'coach-message'} ${message.pending ? 'pending' : ''} ${message.failed ? 'failed' : ''}`}
                >
                  {message.sender === 'user' && (
                    <div className="avatar-container">
                      <img src={getUserAvatar()} alt={appointment.userName || 'Người dùng'} className="message-avatar" />
                    </div>
                  )}
                  
                  <div className="message-bubble">
                    <p>{message.text}</p>
                    <span className="message-time">
                      {message.failed ? 'Gửi thất bại' : (message.pending ? 'Đang gửi...' : formatTime(message.timestamp || message.created_at))}
                    </span>
                  </div>
                  
                  {message.sender === 'coach' && (
                    <div className="avatar-container">
                      <img src={getCoachAvatar()} alt="Coach" className="message-avatar" />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="message-panel-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập tin nhắn..."
          disabled={isLoading}
        />
        <button 
          className="send-button"
          onClick={handleSendMessage}
          disabled={isLoading || input.trim() === ''}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default CoachMessagePanel;
