import React from 'react';
import { FaCalendarAlt, FaArrowRight, FaCheck, FaClock } from 'react-icons/fa';
import '../styles/ProfilePlan.css';

/**
 * Component hiển thị thông tin kế hoạch cai thuốc đơn giản
 * @param {Object} props
 * @param {Object} props.planData - Dữ liệu kế hoạch cai thuốc
 * @param {Function} props.onEditClick - Hàm callback khi click nút chỉnh sửa
 */
const ProfilePlan = ({ planData = {}, onEditClick }) => {
  // Dữ liệu mẫu nếu không có dữ liệu thực
  const plan = planData || {
    strategy: 'Cai thuốc hoàn toàn và duy trì lâu dài',
    startDate: '01/06/2025',
    goal: 'Cải thiện sức khỏe và tiết kiệm chi phí',
    milestones: [
      { 
        id: 1, 
        title: 'Tuần đầu tiên', 
        description: 'Giảm 25% lượng thuốc lá sử dụng hàng ngày', 
        completed: true 
      },
      { 
        id: 2, 
        title: 'Tuần thứ hai', 
        description: 'Giảm 50% lượng thuốc lá sử dụng hàng ngày', 
        completed: true 
      },
      { 
        id: 3, 
        title: 'Tuần thứ ba', 
        description: 'Giảm 75% lượng thuốc lá sử dụng hàng ngày', 
        inProgress: true 
      },
      { 
        id: 4, 
        title: 'Tuần thứ tư', 
        description: 'Ngừng hoàn toàn việc sử dụng thuốc lá', 
        upcoming: true 
      }
    ]
  };

  return (
    <div className="simple-plan">
      <div className="current-plan">
        <div className="plan-strategy">
          <h3>Chiến lược</h3>
          <p>{plan.strategy}</p>
        </div>
        
        <div className="plan-start-date">
          <div className="date-label">
            <FaCalendarAlt className="icon" />
            <span>Ngày bắt đầu:</span>
          </div>
          <strong>{plan.startDate}</strong>
        </div>
        
        <div className="plan-goal">
          <h3>Mục tiêu</h3>
          <p>{plan.goal}</p>
        </div>
        
        <div className="milestones">
          <h3>Cột mốc</h3>
          {plan.milestones?.map((milestone) => (
            <div className="milestone-item" key={milestone.id}>
              <div className="milestone-status">
                {milestone.completed && (
                  <span className="status-circle completed">
                    <FaCheck />
                  </span>
                )}
                {milestone.inProgress && (
                  <span className="status-circle in-progress">
                    <FaClock />
                  </span>
                )}
                {milestone.upcoming && (
                  <span className="status-circle upcoming">
                    <FaArrowRight />
                  </span>
                )}
              </div>
              <div className="milestone-info">
                <h4>{milestone.title}</h4>
                <p>{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <button className="edit-plan-btn" onClick={onEditClick}>
          Điều chỉnh kế hoạch
        </button>
      </div>
    </div>
  );
};

export default ProfilePlan;