import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaArrowRight, FaCheck, FaClock } from 'react-icons/fa';
import '../styles/ProfilePlan.css';

/**
 * Component hiển thị thông tin kế hoạch cai thuốc đơn giản
 * @param {Object} props
 * @param {Object} props.planData - Dữ liệu kế hoạch cai thuốc
 * @param {Object} props.activePlan - Kế hoạch đang hoạt động từ localStorage
 */
const ProfilePlan = ({ planData = {}, activePlan = null }) => {
  const navigate = useNavigate();
    // Hàm điều hướng đến trang tạo/chỉnh sửa kế hoạch
  const handleGoToPlan = () => {
    navigate('/journey');
  };

  // Kiểm tra xem có kế hoạch thực tế không
  const hasValidPlan = activePlan && (activePlan.strategy || activePlan.weeks);
  
  // Xử lý ngày bắt đầu: ưu tiên activePlan.startDate, nếu không có thì dùng ngày hiện tại khi có activePlan
  const getStartDate = () => {
    if (activePlan?.startDate) {
      return new Date(activePlan.startDate).toLocaleDateString('vi-VN');
    }
    if (planData.startDate) {
      return planData.startDate;
    }
    if (hasValidPlan) {
      // Nếu có kế hoạch nhưng không có startDate, dùng ngày hiện tại
      return new Date().toLocaleDateString('vi-VN');
    }
    return 'Chưa tạo kế hoạch';
  };
  // Ưu tiên sử dụng dữ liệu thực tế từ activePlan
  const plan = {
    name: activePlan?.name || 'Kế hoạch cai thuốc cá nhân',
    strategy: activePlan?.strategy || planData.strategy || 'Cai thuốc hoàn toàn và duy trì lâu dài',
    startDate: getStartDate(),
    goal: activePlan?.goal || planData.goal || 'Cải thiện sức khỏe và tiết kiệm chi phí',
    initialCigarettes: activePlan?.initialCigarettes || planData.initialCigarettes || 20,
    weeks: activePlan?.weeks || planData.weeks || [],
    milestones: planData.milestones || []
  };

  // Tạo milestones từ kế hoạch thực tế nếu có
  const generateMilestonesFromPlan = (activePlan) => {
    if (!activePlan || !activePlan.weeks || !Array.isArray(activePlan.weeks)) {
      return plan.milestones || [];
    }

    const currentDate = new Date();
    const startDate = activePlan.startDate ? new Date(activePlan.startDate) : currentDate;
    
    return activePlan.weeks.map((week, index) => {
      const weekStartDate = new Date(startDate);
      weekStartDate.setDate(startDate.getDate() + (index * 7));
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);
      
      const isCompleted = currentDate > weekEndDate;
      const isInProgress = currentDate >= weekStartDate && currentDate <= weekEndDate;
      
      return {
        id: week.week,
        title: `Tuần ${week.week} - ${week.phase}`,
        description: `Mục tiêu: ${week.amount} điếu/ngày`,
        completed: isCompleted,
        inProgress: isInProgress,
        upcoming: !isCompleted && !isInProgress,
        amount: week.amount,
        phase: week.phase
      };
    });
  };

  const milestones = activePlan ? generateMilestonesFromPlan(activePlan) : (plan.milestones || []);
  return (
    <div className="simple-plan">      <div className="current-plan">
        <div className="plan-strategy">
          <h3>Tên kế hoạch</h3>
          <p>{plan.name || plan.strategy}</p>
        </div>
        
        <div className="plan-start-date">
          <div className="date-label">
            <FaCalendarAlt className="icon" />
            <span>Ngày bắt đầu:</span>
          </div>
          <strong>{plan.startDate}</strong>
        </div>
        
        {activePlan && activePlan.initialCigarettes && (
          <div className="plan-initial">
            <h3>Thông tin ban đầu</h3>
            <p>Số điếu/ngày trước khi cai: <strong>{activePlan.initialCigarettes} điếu</strong></p>
            {activePlan.packPrice && (
              <p>Giá gói thuốc: <strong>{activePlan.packPrice.toLocaleString()} VNĐ</strong></p>
            )}
            {activePlan.weeks && activePlan.weeks.length > 0 && (
              <p>Thời gian kế hoạch: <strong>{activePlan.weeks.length} tuần</strong></p>
            )}
          </div>        )}
        
        <div className="milestones">
          <h3>Cột mốc theo tuần</h3>
          {milestones.length > 0 ? (
            <div className="milestones-grid">
              {milestones.map((milestone) => (
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
            </div>          ) : (
            <p>Chưa có kế hoạch cai thuốc cụ thể. <button onClick={handleGoToPlan} className="edit-link">Tạo kế hoạch ngay</button></p>
          )}
        </div>
        
        <button className="edit-plan-btn" onClick={handleGoToPlan}>
          Xem kế hoạch cai thuốc
        </button>
      </div>
    </div>
  );
};

export default ProfilePlan;