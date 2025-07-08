import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPaperPlane, FaUser } from 'react-icons/fa';
import '../styles/CoachChat.css';

const CoachChat = ({ coach, appointment, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  // Load previous messages from localStorage
  useEffect(() => {
    if (isOpen && appointment && isFirstLoad) {
      const chatKey = `coach_chat_${appointment.id}`;
      const savedMessages = JSON.parse(localStorage.getItem(chatKey)) || [];
      
      // If no previous messages, add a welcome message from the coach
      if (savedMessages.length === 0) {
        const welcomeMessage = {
          id: 1,
          text: `Xin chào ${appointment.userName || 'bạn'}! Tôi là Coach ${coach.name}, chuyên gia hỗ trợ cai thuốc. Rất vui được đồng hành cùng bạn trong hành trình cai thuốc lá này. Hãy chia sẻ với tôi về tình trạng hiện tại và mục tiêu của bạn nhé! 🌟`,
          sender: 'coach',
          timestamp: new Date().toISOString(),
          readByUser: false
        };
        const initialMessages = [welcomeMessage];
        setMessages(initialMessages);
        localStorage.setItem(chatKey, JSON.stringify(initialMessages));
        
        // Mark welcome message as unread
        const unreadKey = `unread_messages_${appointment.id}`;
        localStorage.setItem(unreadKey, '1');
      }
      setIsFirstLoad(false);
    }
  }, [isOpen, appointment, coach, isFirstLoad]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to load messages from localStorage
  const loadMessages = () => {
    if (!appointment) return;
    
    const chatKey = `coach_chat_${appointment.id}`;
    const savedMessages = JSON.parse(localStorage.getItem(chatKey)) || [];
    
    // Check if there are new messages
    if (savedMessages.length > lastMessageCountRef.current) {
      setHasNewMessage(true);
      // Auto-hide the indicator after 3 seconds
      setTimeout(() => setHasNewMessage(false), 3000);
    }
    
    lastMessageCountRef.current = savedMessages.length;
    
    // Only update if messages have changed
    if (JSON.stringify(savedMessages) !== JSON.stringify(messages)) {
      // Mark all coach messages as read by user when loading
      const updatedMessages = savedMessages.map(msg => ({
        ...msg,
        readByUser: msg.sender === 'coach' ? true : msg.readByUser
      }));
      
      setMessages(updatedMessages);
      
      // Update localStorage with read status
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
      
      // Clear unread count for user
      const unreadKey = `unread_messages_${appointment.id}`;
      localStorage.setItem(unreadKey, '0');
    }
  };

  // Real-time polling effect
  useEffect(() => {
    if (isOpen && appointment) {
      // Load messages immediately
      loadMessages();
      
      // Set up polling every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        loadMessages();
      }, 2000);
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    } else {
      // Clear polling when chat is closed
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [isOpen, appointment]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
      readByCoach: false
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    
    // Save to localStorage
    if (appointment) {
      const chatKey = `coach_chat_${appointment.id}`;
      localStorage.setItem(chatKey, JSON.stringify(newMessages));
    }
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

  // Function to mark a new message from coach as unread if chat is not open
  const markMessageAsUnread = () => {
    if (!isOpen && appointment) {
      const unreadKey = `unread_messages_${appointment.id}`;
      const currentUnreadCount = localStorage.getItem(unreadKey) || '0';
      const newUnreadCount = parseInt(currentUnreadCount) + 1;
      localStorage.setItem(unreadKey, newUnreadCount.toString());
    }
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

  return (
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
        
        <div className="coach-chat-messages">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.sender === 'coach' ? 'coach-message' : 'user-message'}`}
            >
              {message.sender === 'coach' && (
                <div 
                  className="coach-avatar-mini"
                  data-username={coach.name}
                >
                  <img src={coach.avatar} alt={coach.name} />
                </div>
              )}
              
              <div className="message-content">
                <p>{message.text}</p>
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              
              {message.sender === 'user' && (
                <div 
                  className="user-avatar-mini"
                  data-username={appointment.userName || 'Người dùng'}
                >
                  <img 
                    src={getUserAvatar()} 
                    alt={appointment.userName || 'User'} 
                  />
                </div>
              )}
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="coach-chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn gửi coach..."
          />
          <button className="send-button" onClick={handleSendMessage}>
            <FaPaperPlane />
          </button>
        </div>
        
        <div className="coach-chat-footer">
          <p>Coach sẽ phản hồi trong vòng: <strong>15-30 phút</strong></p>
        </div>
      </div>
    </div>
  );
};

export default CoachChat;
