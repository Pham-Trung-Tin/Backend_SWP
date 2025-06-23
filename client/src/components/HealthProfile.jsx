import React from 'react';
import { FaHeartbeat, FaClipboardList, FaCheck, FaClock } from 'react-icons/fa';
import '../styles/HealthProfile.css';

/**
 * Component hiển thị thông tin hồ sơ sức khỏe
 * @param {Object} props
 * @param {Object} props.healthData - Dữ liệu sức khỏe người dùng
 */
const HealthProfile = ({ healthData = {} }) => {
  // Dữ liệu mẫu nếu không có dữ liệu thực
  const data = healthData.stats || {
    smokingHistory: '15 năm',
    dailyConsumption: '20 điếu/ngày',
    quitAttempts: '2 lần',
    healthIssues: 'Ho mãn tính, khó thở khi vận động',
    bloodPressure: '130/85',
    heartRate: '78 bpm',
    oxygenLevel: '96%',
    respiratoryRate: '16 lần/phút'
  };

  // Các cải thiện sức khỏe theo thời gian sau khi cai thuốc
  const improvements = healthData.improvements || [
    {
      time: '20 phút',
      description: 'Nhịp tim và huyết áp giảm xuống',
      completed: true
    },
    {
      time: '12 giờ',
      description: 'Mức carbon monoxide trong máu giảm xuống mức bình thường',
      completed: true
    },
    {
      time: '2 tuần',
      description: 'Tuần hoàn máu cải thiện và chức năng phổi tăng lên',
      completed: true
    },
    {
      time: '1-9 tháng',
      description: 'Ho và khó thở giảm, phổi tự làm sạch',
      completed: false
    },
    {
      time: '1 năm',
      description: 'Nguy cơ bệnh tim giảm một nửa so với người hút thuốc',
      completed: false
    }
  ];

  return (
    <div className="health-profile">
      <div className="health-stats">
        <div className="health-stat-row">
          <div className="health-stat">
            <h4>Tiền sử hút thuốc</h4>
            <p>{data.smokingHistory}</p>
          </div>
        </div>
        
        <div className="health-stat-row two-col">
          <div className="health-stat-item">
            <label>Mức tiêu thụ hàng ngày</label>
            <p>{data.dailyConsumption}</p>
          </div>
          <div className="health-stat-item">
            <label>Số lần cố gắng cai thuốc</label>
            <p>{data.quitAttempts}</p>
          </div>
        </div>
        
        <div className="health-stat-row">
          <div className="health-stat">
            <h4>Vấn đề sức khỏe liên quan</h4>
            <p>{data.healthIssues}</p>
          </div>
        </div>

        <div className="health-stat-row two-col">
          <div className="health-stat-item">
            <label>Huyết áp</label>
            <p>{data.bloodPressure}</p>
          </div>
          <div className="health-stat-item">
            <label>Nhịp tim</label>
            <p>{data.heartRate}</p>
          </div>
        </div>

        <div className="health-stat-row two-col">
          <div className="health-stat-item">
            <label>Mức oxy trong máu</label>
            <p>{data.oxygenLevel}</p>
          </div>
          <div className="health-stat-item">
            <label>Tần số hô hấp</label>
            <p>{data.respiratoryRate}</p>
          </div>
        </div>
      </div>

      <div className="health-improvements">
        <h3>Cải thiện sức khỏe</h3>
        <div className="improvements-list">
          {improvements.map((item, index) => (
            <div className="improvement-item" key={index}>
              <span className="improvement-time">{item.time}</span>
              <span className="improvement-description">{item.description}</span>
              {item.completed ? (
                <FaCheck className="completed-icon" />
              ) : (
                <FaClock className="pending-icon" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthProfile;
