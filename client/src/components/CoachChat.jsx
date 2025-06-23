import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPaperPlane, FaUser } from 'react-icons/fa';
import '../styles/CoachChat.css';

const CoachChat = ({ coach, appointment, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const messagesEndRef = useRef(null);
  // Load previous messages from localStorage
  useEffect(() => {
    if (isOpen && appointment) {
      const chatKey = `coach_chat_${appointment.id}`;
      const savedMessages = JSON.parse(localStorage.getItem(chatKey)) || [];
      
      // If no previous messages, add a welcome message from the coach
      if (savedMessages.length === 0 && isFirstLoad) {
        const welcomeMessage = {
          id: 1,
          text: `Xin chào! Tôi là ${coach.name}, coach hỗ trợ cai thuốc của bạn. Bạn có thể đặt câu hỏi hoặc chia sẻ trải nghiệm của mình về quá trình cai thuốc ở đây.`,
          sender: 'coach',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        localStorage.setItem(chatKey, JSON.stringify([welcomeMessage]));
        
        // Mark welcome message as unread
        const unreadKey = `unread_messages_${appointment.id}`;
        localStorage.setItem(unreadKey, '1');
      } else {
        setMessages(savedMessages);
      }
      setIsFirstLoad(false);
    }
  }, [isOpen, appointment, coach, isFirstLoad]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    
    // Save to localStorage
    if (appointment) {
      const chatKey = `coach_chat_${appointment.id}`;
      localStorage.setItem(chatKey, JSON.stringify(newMessages));
    }      // Simulate coach response after a delay (in a real app, this would be handled by a backend)
      setTimeout(() => {
        const autoResponses = [
          "Cảm ơn bạn đã chia sẻ! Tôi hiểu rằng quá trình cai thuốc có nhiều thách thức.",
          "Điều đó rất đáng khích lệ! Hãy tiếp tục kiên trì nhé.",
          "Tôi sẽ ghi nhận vấn đề này và hỗ trợ bạn trong buổi tư vấn tới.",
          "Đó là một tiến bộ đáng kể! Hãy duy trì động lực này bạn nhé.",
          "Đừng lo lắng, việc có khó khăn là điều bình thường. Chúng ta sẽ cùng vượt qua.",
          "Tôi ghi nhận ý kiến của bạn và sẽ cung cấp thêm thông tin trong buổi hẹn."
        ];
        
        const randomResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)];
        
        const coachMessage = {
          id: newMessages.length + 1,
          text: randomResponse,
          sender: 'coach',
          timestamp: new Date()
        };
        
        const updatedMessages = [...newMessages, coachMessage];
        setMessages(updatedMessages);
        
        // Save coach response to localStorage
        if (appointment) {
          const chatKey = `coach_chat_${appointment.id}`;
          localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
          
          // Mark message as unread if chat is not visible
          markMessageAsUnread();
        }
      }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
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

  if (!isOpen || !appointment || !coach) return null;

  return (
    <div className="coach-chat-overlay">
      <div className="coach-chat-container">
        <div className="coach-chat-header">
          <div className="coach-chat-title">
            <div className="coach-avatar-small">
              <img src={coach.avatar} alt={coach.name} />
              <div className="coach-status online"></div>
            </div>
            <div>
              <h3>{coach.name}</h3>
              <p>{coach.role}</p>
            </div>
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
                <div className="coach-avatar-mini">
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
                <div className="user-avatar">
                  <FaUser />
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
            placeholder="Nhập tin nhắn của bạn..."
          />
          <button className="send-button" onClick={handleSendMessage}>
            <FaPaperPlane />
          </button>
        </div>
        
        <div className="coach-chat-footer">
          <p>Thời gian phản hồi thông thường: <strong>15-30 phút</strong></p>
        </div>
      </div>
    </div>
  );
};

export default CoachChat;
