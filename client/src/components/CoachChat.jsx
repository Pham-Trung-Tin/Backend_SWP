import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPaperPlane, FaUser } from 'react-icons/fa';
import '../styles/CoachChat.css';
import { getAppointmentMessages, sendAppointmentMessage, markMessagesAsRead } from '../utils/userAppointmentApi';
import { 
  initSocket, 
  joinAppointmentRoom, 
  sendMessageNotification,
  subscribeToMessages, 
  subscribeToMessagesRead,
  markMessagesAsRead as socketMarkMessagesAsRead
} from '../utils/socket';
import JitsiMeeting from './JitsiMeeting';

const CoachChat = ({ coach, appointment, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showJitsi, setShowJitsi] = useState(false);
  const messagesEndRef = useRef(null);
  const socketUnsubscribersRef = useRef([]);
  
  // Load messages from the database
  const loadMessages = async (isRealTimeUpdate = false) => {
    if (!appointment) return;
    
    // Only show loading on first load
    if (!isRealTimeUpdate) {
      setIsLoading(true);
    }
    
    try {
      // Fetch messages from the API
      const response = await getAppointmentMessages(appointment.id);
      
      if (response?.success && response?.data) {
        setMessages(response.data);
        
        // Mark messages as read
        await markMessagesAsRead(appointment.id);
        socketMarkMessagesAsRead(appointment.id);
      } else if (response?.success && (!response?.data || response?.data.length === 0) && isFirstLoad) {
        // If no messages and it's first load, create a welcome message
        const welcomeMessage = {
          text: `Xin chào ${appointment.userName || 'bạn'}! Tôi là Coach ${coach.name}, chuyên gia hỗ trợ cai thuốc. Rất vui được đồng hành cùng bạn trong hành trình cai thuốc lá này. Hãy chia sẻ với tôi về tình trạng hiện tại và mục tiêu của bạn nhé! 🌟`,
          sender: 'coach'
        };
        
        // Send welcome message through API
        try {
          const welcomeResponse = await sendAppointmentMessage(appointment.id, welcomeMessage);
          if (welcomeResponse?.success && welcomeResponse?.data) {
            setMessages([welcomeResponse.data]);
          }
        } catch (error) {
          console.error('Error sending welcome message:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (!isRealTimeUpdate) {
        setIsLoading(false);
        setIsFirstLoad(false);
      }
    }
  };
  
  // Load messages when component mounts or appointment changes
  useEffect(() => {
    if (isOpen && appointment && isFirstLoad) {
      loadMessages();
    }
  }, [isOpen, appointment, coach, isFirstLoad]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set up Socket.IO connection
  useEffect(() => {
    if (isOpen && appointment) {
      // Initialize socket connection
      initSocket();
      
      // Join appointment room
      joinAppointmentRoom(appointment.id);
      
      // Set up polling to refresh messages every 10 seconds
      const pollingInterval = setInterval(() => {
        loadMessages(true);
      }, 10000);
      
      // Subscribe to new messages
      const unsubscribeMessages = subscribeToMessages(appointment.id, (newMessage) => {
        if (newMessage) {
          // Tải lại tất cả tin nhắn để đảm bảo có tin nhắn mới nhất
          loadMessages(true);
          
          // Show new message indicator if not from the current user
          if (newMessage.sender !== 'user') {
            setHasNewMessage(true);
            // Auto-hide the indicator after 3 seconds
            setTimeout(() => setHasNewMessage(false), 3000);
          }
          
          // Mark messages as read if chat is open
          markMessagesAsRead(appointment.id)
            .then(() => socketMarkMessagesAsRead(appointment.id))
            .catch(error => console.error('Error marking messages as read:', error));
        }
      });
      
      // Subscribe to messages read events
      const unsubscribeMessagesRead = subscribeToMessagesRead(appointment.id, (data) => {
        // Update read status for messages
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
      
      // Store unsubscribe functions
      socketUnsubscribersRef.current = [unsubscribeMessages, unsubscribeMessagesRead];
      
      // Mark messages as read when opening the chat
      markMessagesAsRead(appointment.id)
        .then(() => socketMarkMessagesAsRead(appointment.id))
        .catch(error => console.error('Error marking messages as read:', error));
      
      return () => {
        // Cleanup socket subscriptions
        socketUnsubscribersRef.current.forEach(unsub => unsub && unsub());
        socketUnsubscribersRef.current = [];
        // Clear polling interval
        clearInterval(pollingInterval);
      };
    }
  }, [isOpen, appointment]);

  const handleSendMessage = () => {
    if (input.trim() === '' || !appointment) return;
    
    const messageData = {
      text: input
    };
    
    // Add message to UI immediately for better UX
    const tempMessage = {
      id: `temp-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
      read_by_coach: false,
      read_by_user: true,
      pending: true
    };
    
    setMessages(prevMessages => [...prevMessages, tempMessage]);
    setInput('');
    
    // Send message via API
    sendAppointmentMessage(appointment.id, messageData)
      .then(response => {
        if (response?.success && response?.data) {
          // Replace temp message with actual message from server
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === tempMessage.id ? response.data : msg
            )
          );
          
          // Just emit a socket event to notify others of the new message
          // Since the message is already saved in the database, we send a notification-only event
          sendMessageNotification(appointment.id);
        } else {
          // Handle error
          console.error('Failed to send message');
          // Mark message as failed
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === tempMessage.id ? { ...msg, failed: true } : msg
            )
          );
        }
      })
      .catch(error => {
        console.error('Error sending message:', error);
        // Mark message as failed
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempMessage.id ? { ...msg, failed: true } : msg
          )
        );
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Function to get user avatar
  const getUserAvatar = () => {
    if (appointment.userAvatar) {
      return appointment.userAvatar;
    }
    // Use different default avatars based on appointment ID
    const avatars = [
      '/image/default-user-avatar.svg',
      '/image/default-user-avatar-green.svg'
    ];
    return avatars[appointment.id % avatars.length];
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  if (!isOpen || !appointment || !coach) return null;

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
      <div className="coach-chat-overlay">
        <div className="coach-chat-container">
          <div className="coach-chat-header">
            <div className="coach-chat-title">
              <div className="coach-avatar-small">
                <img src={coach.avatar} alt={coach.name} />
                {/* Status indicator ẩn vì đã có text status */}
              </div>
              <div>
                <h3>Coach {coach.name}</h3>
                <p>● Đang online - Sẵn sàng hỗ trợ</p>
              </div>
              {hasNewMessage && (
                <div className="new-message-indicator">
                  Tin nhắn mới!
                </div>
              )}
            </div>
            <button className="coach-chat-close" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
          {/* Thêm nút gọi video */}
          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            <button
              style={{
                padding: '8px 16px',
                background: '#0077ff',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 16,
                cursor: 'pointer',
              }}
              onClick={() => setShowJitsi(true)}
            >
              Gọi video với Coach
            </button>
          </div>
          <div className="coach-chat-messages">
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
                      className={`message ${message.sender === 'coach' ? 'coach-message' : 'user-message'} ${message.pending ? 'pending' : ''} ${message.failed ? 'failed' : ''}`}
                    >
                      {message.sender === 'coach' && (
                        <div className="avatar-container">
                          <img 
                            src={coach.avatar || '/image/default-coach-avatar.svg'} 
                            alt={message.coach_name || coach.name || "Coach"} 
                            className="message-avatar" 
                          />
                        </div>
                      )}
                      
                      <div className="message-bubble">
                        <div className="message-sender-name">
                          {message.sender === 'user' 
                            ? (message.user_name || appointment.userName || 'Người dùng') 
                            : (message.coach_name || coach.name || 'Coach')}
                        </div>
                        <p>{message.text}</p>
                        <span className="message-time">
                          {message.failed ? 'Gửi thất bại' : (message.pending ? 'Đang gửi...' : formatTime(message.timestamp || message.created_at))}
                        </span>
                      </div>
                      
                      {message.sender === 'user' && (
                        <div className="avatar-container">
                          <img 
                            src={getUserAvatar()} 
                            alt={message.user_name || appointment.userName || 'Người dùng'} 
                            className="message-avatar"
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="coach-chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn gửi coach..."
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
          
          <div className="coach-chat-footer">
            <p>Coach sẽ phản hồi trong vòng: <strong>15-30 phút</strong></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoachChat;
