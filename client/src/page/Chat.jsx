import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaComments, FaUser } from 'react-icons/fa';
import './Chat.css';

function Chat() {
  const [chatInfo, setChatInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin chat từ localStorage
    const storedChatInfo = localStorage.getItem('navChatInfo');
    if (storedChatInfo) {
      setChatInfo(JSON.parse(storedChatInfo));
    }
  }, []);

  const handleGoBack = () => {
    navigate('/appointment');
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="back-button" onClick={handleGoBack}>
          <FaArrowLeft /> Quay lại
        </button>
        <h2><FaComments /> Chat Navigation</h2>
      </div>

      <div className="chat-content">
        {chatInfo ? (
          <div className="chat-info-card">
            <div className="coach-info-section">
              <img 
                src={chatInfo.coachAvatar} 
                alt={chatInfo.coachName} 
                className="coach-avatar-large"
              />
              <div className="coach-details-section">
                <h3>{chatInfo.coachName}</h3>
                <p>{chatInfo.coachRole}</p>
              </div>
            </div>
            
            <div className="chat-actions">
              <div className="info-message">
                <FaUser />
                <p>Đây là trang chat navigation. Bạn có thể tích hợp với hệ thống chat thực tế ở đây.</p>
              </div>
              
              <div className="appointment-ref">
                <p>Appointment ID: #{chatInfo.appointmentId}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-chat-info">
            <FaComments className="no-chat-icon" />
            <h3>Không có thông tin chat</h3>
            <p>Vui lòng chọn một lịch hẹn để bắt đầu chat.</p>
            <button className="go-appointments-btn" onClick={handleGoBack}>
              Xem lịch hẹn
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
