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

  // Kiểm tra xem có kế hoạch thực tế không - sử dụng dữ liệu database
  const hasValidPlan = activePlan && (activePlan.plan_name || activePlan.start_date || activePlan.plan_details);
  
  // Xử lý ngày bắt đầu: ưu tiên activePlan.start_date từ database
  const getStartDate = () => {
    if (activePlan?.start_date) {
      return new Date(activePlan.start_date).toLocaleDateString('vi-VN');
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

  // Parse plan_details từ database
  const parsePlanDetails = (planDetails) => {
    if (!planDetails) return null;
    try {
      return JSON.parse(planDetails);
    } catch (error) {
      console.error("❌ PROFILE_PLAN: Lỗi parse plan_details:", error);
      return null;
    }
  };

  const planDetails = parsePlanDetails(activePlan?.plan_details);
  // Ưu tiên sử dụng dữ liệu thực tế từ activePlan database
  const plan = {
    name: activePlan?.plan_name || 'Kế hoạch cai thuốc cá nhân',
    strategy: planDetails?.strategy || activePlan?.strategy || planData.strategy || 'Cai thuốc hoàn toàn và duy trì lâu dài',
    startDate: getStartDate(),
    goal: planDetails?.goal || activePlan?.goal || planData.goal || 'Cải thiện sức khỏe và tiết kiệm chi phí',
    initialCigarettes: planDetails?.initialCigarettes || activePlan?.initial_cigarettes || planData.initialCigarettes || 20,
    weeks: planDetails?.weeks || activePlan?.weeks || planData.weeks || [],
    milestones: planData.milestones || []
  };

  // Tạo milestones từ kế hoạch thực tế nếu có
  const generateMilestonesFromPlan = (activePlan, planDetails) => {
    const weeksData = planDetails?.weeks || activePlan?.weeks;
    const startDate = activePlan?.start_date ? new Date(activePlan.start_date) : new Date();
    
    if (!weeksData || !Array.isArray(weeksData)) {
      return plan.milestones || [];
    }

    const currentDate = new Date();
    
    return weeksData.map((week, index) => {
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

  const milestones = activePlan ? generateMilestonesFromPlan(activePlan, planDetails) : (plan.milestones || []);
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
        
        {(activePlan?.initial_cigarettes || planDetails?.initialCigarettes) && (
          <div className="plan-initial">
            <h3>Thông tin ban đầu</h3>
            <p>Số điếu/ngày trước khi cai: <strong>{plan.initialCigarettes} điếu</strong></p>
            {(planDetails?.packPrice || activePlan?.packPrice) && (
              <p>Giá gói thuốc: <strong>{(planDetails?.packPrice || activePlan?.packPrice).toLocaleString()} VNĐ</strong></p>
            )}
            {plan.weeks && plan.weeks.length > 0 && (
              <p>Thời gian kế hoạch: <strong>{plan.weeks.length} tuần</strong></p>
            )}
          </div>
        )}
        
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