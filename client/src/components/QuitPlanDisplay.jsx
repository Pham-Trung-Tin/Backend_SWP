import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaCheckCircle, FaClock, FaInfoCircle } from 'react-icons/fa';
import '../styles/QuitPlanDisplay.css';

const QuitPlanDisplay = () => {
  const [planData, setPlanData] = useState(null);
  const [completionDate, setCompletionDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load plan data from localStorage
    const loadQuitPlanData = () => {
      try {
        setLoading(true);
        
        // Check for completed plan first
        const completionData = localStorage.getItem('quitPlanCompletion');
        if (completionData) {
          const parsedData = JSON.parse(completionData);
          if (parsedData && parsedData.userPlan) {
            setPlanData(parsedData.userPlan);
            setCompletionDate(parsedData.completionDate);
            setLoading(false);
            return;
          }
        }

        // If no completed plan, check for active plan
        const activePlan = localStorage.getItem('activePlan');
        if (activePlan) {
          const parsedPlan = JSON.parse(activePlan);
          if (parsedPlan && Array.isArray(parsedPlan.weeks) && parsedPlan.weeks.length > 0) {
            setPlanData(parsedPlan);
            setLoading(false);
            return;
          }
        }
        
        // Nếu không tìm thấy kế hoạch hợp lệ hoặc kế hoạch bị lỗi
        setError('Không tìm thấy kế hoạch cai thuốc hợp lệ');
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi đọc kế hoạch cai thuốc:', error);
        setError('Lỗi khi đọc kế hoạch cai thuốc. Vui lòng tải lại trang.');
        setLoading(false);
      }
    };

    loadQuitPlanData();
  }, []);
  if (loading) {
    return (
      <div className="loading-plan-message">
        <p>Đang tải kế hoạch cai thuốc...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-plan-message">
        <FaInfoCircle style={{marginRight: '8px', color: '#e74c3c'}} />
        <p>{error}</p>
      </div>
    );
  }
  
  if (!planData) {
    return (
      <div className="no-plan-message">
        <p>Chưa có kế hoạch cai thuốc. Hãy tạo kế hoạch mới để bắt đầu!</p>
        <Link to="/journey" style={{display: 'block', marginTop: '10px', color: '#3498db'}}>
          Tạo kế hoạch cai thuốc
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      // Kiểm tra nếu dateString là null hoặc undefined
      if (!dateString) {
        return 'Không xác định';
      }
      
      // Xử lý chuỗi ngày tháng để đảm bảo định dạng hợp lệ
      // Thử chuyển đổi trực tiếp
      const date = new Date(dateString);
      
      // Kiểm tra xem date có hợp lệ không
      if (isNaN(date.getTime())) {
        // Nếu không hợp lệ, thử phân tích chuỗi ngày tháng
        if (typeof dateString === 'string') {
          // Kiểm tra nếu là định dạng ISO string (YYYY-MM-DD)
          if (dateString.includes('-')) {
            const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
              return new Date(year, month - 1, day).toLocaleDateString('vi-VN');
            }
          }
          // Kiểm tra nếu là định dạng DD/MM/YYYY
          else if (dateString.includes('/')) {
            const parts = dateString.split('/');
            // Nếu là định dạng DD/MM/YYYY
            if (parts.length === 3) {
              const day = parseInt(parts[0], 10);
              const month = parseInt(parts[1], 10) - 1;
              const year = parseInt(parts[2], 10);
              return new Date(year, month, day).toLocaleDateString('vi-VN');
            }
          }
        }
        return 'Ngày không hợp lệ';
      }
      
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Lỗi khi định dạng ngày:', error, dateString);
      return 'Không xác định';
    }
  };

  return (
    <div className="quit-plan-display">
      <div className="plan-header">
        <h3>{planData.name || 'Kế hoạch cai thuốc cá nhân'}</h3>        {completionDate && (
          <div className="completion-badge">
            <FaCheckCircle className="completion-icon" />
            <span>Kế hoạch được lập: {formatDate(completionDate)}</span>
          </div>
        )}
      </div>

      <div className="plan-details">
        <div className="plan-detail-item">
          <FaCalendarAlt className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Ngày bắt đầu:</span>
            <span className="detail-value">{formatDate(planData.startDate)}</span>
          </div>
        </div>

        <div className="plan-detail-item">
          <FaClock className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Thời gian:</span>
            <span className="detail-value">
              {planData.totalWeeks ? `${planData.totalWeeks} tuần` : 
               planData.weeks ? `${planData.weeks.length} tuần` : 'Không xác định'}
            </span>
          </div>
        </div>
      </div>

      {planData.strategy && (
        <div className="plan-strategy">
          <h4>Phương pháp:</h4>
          <p>{planData.strategy}</p>
        </div>
      )}

      {planData.goal && (
        <div className="plan-goal">
          <h4>Mục tiêu:</h4>
          <p>{planData.goal}</p>
        </div>
      )}      {planData.weeks && planData.weeks.length > 0 && (
        <div className="plan-progress">
          <h4>Tiến độ kế hoạch:</h4>
          <div className="weeks-progress">
            {planData.weeks.map((week, index) => (
              <div key={index} className="week-item">
                <span className="week-number">Tuần {week.week || index + 1}:</span>
                <span className="cigarette-count">{week.amount} điếu/ngày</span>
                {week.phase && <span className="week-phase">({week.phase})</span>}
              </div>
            ))}
          </div>          <div className="plan-duration">
            <strong>Thời gian dự kiến:</strong> {planData.totalWeeks || (planData.weeks ? planData.weeks.length : 0)} tuần
          </div>
        </div>
      )}
    </div>
  );
};

export default QuitPlanDisplay;
