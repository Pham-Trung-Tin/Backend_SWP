import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaUser, FaRobot } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { 
  getAppointmentMessages, 
  sendAppointmentMessage, 
  markMessagesAsRead 
} from '../utils/userAppointmentApi';
import './AppointmentChat.css';

function AppointmentChat() {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (appointmentId) {
      loadMessages();
      markAllMessagesAsRead();
      
      // Set up polling for new messages every 3 seconds
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [appointmentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await getAppointmentMessages(appointmentId);
      setMessages(response.data || []);
      
      // Extract appointment info from messages if available
      if (response.data && response.data.length > 0) {
        const firstMessage = response.data[0];
        if (firstMessage.appointment) {
          setAppointment(firstMessage.appointment);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllMessagesAsRead = async () => {
    try {
      await markMessagesAsRead(appointmentId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || sending) return;

    setSending(true);
    try {
      const messageData = {
        text: messageInput.trim()
      };

      await sendAppointmentMessage(appointmentId, messageData);
      setMessageInput('');
      
      // Reload messages to get the new message
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleGoBack = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="appointment-chat-page">
        <div className="chat-header">
          <button className="back-button" onClick={handleGoBack}>
            <FaArrowLeft /> Quay lại
          </button>
          <h2>Đang tải...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-chat-page">
      <div className="chat-header">
        <button className="back-button" onClick={handleGoBack}>
          <FaArrowLeft /> Quay lại
        </button>
        <div className="chat-title">
          <h2>Chat Tư Vấn</h2>
          {appointment && (
            <p>Cuộc hẹn #{appointmentId} - {appointment.coach_name}</p>
          )}
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={message.id || index} 
                className={`message ${message.sender_type === 'user' ? 'user-message' : 'coach-message'}`}
              >
                <div className="message-avatar">
                  {message.sender_type === 'user' ? <FaUser /> : <FaRobot />}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {formatMessageTime(message.created_at)}
                    {message.sender_type === 'user' && (
                      <span className={`read-status ${message.read_by_coach ? 'read' : 'unread'}`}>
                        {message.read_by_coach ? '✓✓' : '✓'}
                      </span>
                    )}
                    {message.sender_type === 'coach' && (
                      <span className={`read-status ${message.read_by_user ? 'read' : 'unread'}`}>
                        {message.read_by_user ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="message-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Nhập tin nhắn của bạn..."
            disabled={sending}
            className="message-input"
          />
          <button 
            type="submit" 
            disabled={sending || !messageInput.trim()}
            className="send-button"
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
}

export default AppointmentChat;
