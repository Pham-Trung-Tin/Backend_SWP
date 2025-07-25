import React, { useState, useEffect, useCallback } from 'react';
import { FaTrophy, FaCalendarCheck, FaChartLine, FaLeaf, FaCoins, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import QuitProgressChart from './QuitProgressChart';

const ProgressDashboard = ({ userPlan, completionDate, dashboardStats: externalStats, actualProgress = [], onDataReset }) => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [milestones, setMilestones] = useState([]);  // Tính toán thống kê
  
  // Debug logging để kiểm tra dữ liệu userPlan nhận được
  console.log("🔍 ProgressDashboard nhận được userPlan:", {
    userPlan: userPlan,
    planName: userPlan?.plan_name || userPlan?.planName,
    planId: userPlan?.id,
    initialCigarettes: userPlan?.initial_cigarettes || userPlan?.initialCigarettes,
    startDate: userPlan?.start_date || userPlan?.startDate,
    totalWeeks: userPlan?.total_weeks || userPlan?.totalWeeks,
    weeks: userPlan?.weeks ? userPlan.weeks.length : 0
  });
  
  console.log("🔍 ProgressDashboard nhận được completionDate:", completionDate);
  console.log("🔍 ProgressDashboard nhận được externalStats:", externalStats);
  console.log("🔍 ProgressDashboard nhận được actualProgress:", actualProgress);
  
  // Tạo dữ liệu mẫu cho biểu đồ thực tế
  const generateSampleActualData = (plan) => {
    if (!plan || !plan.weeks || plan.weeks.length === 0) {
      return [{date: new Date().toISOString().split('T')[0], actualCigarettes: 0, targetCigarettes: 0}];
    }
    
    // Tạo dữ liệu mẫu dựa trên kế hoạch
    const sampleData = [];
    const today = new Date();
    
    // Dùng vòng lặp thông thường để tạo dữ liệu mẫu
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Tính tuần tương ứng
      let weekIndex = Math.floor(i / 7);
      weekIndex = Math.min(weekIndex, plan.weeks.length - 1);
      if (weekIndex < 0) weekIndex = 0;
      
      // Lấy mục tiêu từ kế hoạch
      const week = plan.weeks[weekIndex];
      const plannedAmount = week.cigarettes || week.amount || 0;
      
      // Thêm biến động ngẫu nhiên để dữ liệu thực tế khác một chút so với kế hoạch
      const randomVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, hoặc 1
      const actualAmount = Math.max(0, plannedAmount + randomVariation);
      
      sampleData.push({
        date: dateStr,
        actualCigarettes: actualAmount,
        targetCigarettes: plannedAmount
      });
    }
    
    console.log("DEBUG: Tạo dữ liệu mẫu cho biểu đồ:", sampleData.length, "ngày");
    return sampleData;
  };
  
  // Early return if required props are missing
  if (!userPlan || !completionDate) {
    console.log("🔍 ProgressDashboard - Missing required props:", {
      hasUserPlan: !!userPlan,
      hasCompletionDate: !!completionDate,
      userPlan: userPlan,
      completionDate: completionDate
    });
    return (
      <div className="dashboard-error">
        <p>Không thể hiển thị dashboard - thiếu dữ liệu cần thiết</p>
        <p>UserPlan: {userPlan ? 'Có' : 'Không'}</p>
        <p>CompletionDate: {completionDate ? 'Có' : 'Không'}</p>
      </div>
    );
  }
  
  const calculateDashboardStats = useCallback(() => {
    console.log("🔍 calculateDashboardStats được gọi với:", {
      userPlan: userPlan,
      completionDate: completionDate,
      externalStats: externalStats,
      actualProgress: actualProgress
    });
    
    if (!userPlan || !completionDate) {
      console.log("🔍 calculateDashboardStats - Missing required data, returning");
      return;
    }

    // Nếu có thống kê từ bên ngoài, sử dụng nó thay vì tính toán lại
    if (externalStats && Object.keys(externalStats).length > 0) {
      console.log("🔍 Sử dụng thống kê từ Progress.jsx:", externalStats);
      setDashboardStats({
        daysSincePlanCreation: externalStats.noSmokingDays || 0, 
        cigarettesSaved: externalStats.savedCigarettes || 0,
        moneySaved: externalStats.savedMoney || 0,
        planDuration: userPlan.weeks ? userPlan.weeks.length : 0,
        planName: userPlan.name || 'Kế hoạch cá nhân',
        healthProgress: externalStats.healthProgress || 0
      });
      return;
    }

    // Tính toán từ actualProgress nếu có dữ liệu thực tế
    if (actualProgress && actualProgress.length > 0) {
      console.log("Tính toán từ actualProgress:", actualProgress);
      
      let totalCigarettesSaved = 0;
      let totalMoneySaved = 0;
      
      // Lấy giá gói thuốc từ activePlan
      let packPrice = 25000;
      try {
        const activePlanData = localStorage.getItem('activePlan');
        if (activePlanData) {
          const activePlan = JSON.parse(activePlanData);
          if (activePlan && activePlan.packPrice) {
            packPrice = activePlan.packPrice;
          }
        }
      } catch (error) {
        console.error('Lỗi khi đọc packPrice:', error);
      }
      
      const pricePerCigarette = packPrice / 20;
      
      // Tính tổng cigarettes saved từ dữ liệu thực tế
      actualProgress.forEach(dayRecord => {
        const targetForDay = dayRecord.targetCigarettes || dayRecord.target_cigarettes || 0;
        const actualForDay = dayRecord.actualCigarettes || dayRecord.actual_cigarettes || 0;
        const daySaved = Math.max(0, targetForDay - actualForDay);
        
        totalCigarettesSaved += daySaved;
        totalMoneySaved += daySaved * pricePerCigarette;
        
        console.log(`Ngày ${dayRecord.date}: Target: ${targetForDay}, Actual: ${actualForDay}, Saved: ${daySaved}`);
      });
      
      console.log(`Tổng cigarettes saved từ actualProgress: ${totalCigarettesSaved}`);
      
      setDashboardStats({
        daysSincePlanCreation: actualProgress.length,
        cigarettesSaved: totalCigarettesSaved,
        moneySaved: totalMoneySaved,
        planDuration: userPlan.weeks ? userPlan.weeks.length : 0,
        planName: userPlan.name || 'Kế hoạch cá nhân',
        healthProgress: 0
      });
      return;
    }

    // Tính toán thông thường nếu không có thống kê từ bên ngoài
    console.log("🔍 Tính toán thông thường - không có external stats");
    const startDate = new Date(completionDate);
    const today = new Date();
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    console.log("🔍 Date calculation:", {
      startDate: startDate,
      today: today,
      daysSinceStart: daysSinceStart
    });
    
    // Tính toán số điếu đã tiết kiệm được - đảm bảo userPlan.weeks tồn tại
    const initialCigarettesPerDay = userPlan.weeks && userPlan.weeks.length > 0 ? 
      userPlan.weeks[0]?.amount || 20 : 20;
    const estimatedSaved = initialCigarettesPerDay * daysSinceStart;
    
    console.log("🔍 Cigarettes calculation:", {
      initialCigarettesPerDay: initialCigarettesPerDay,
      estimatedSaved: estimatedSaved
    });      // Tính tiền tiết kiệm dựa trên giá gói thuốc từ kế hoạch của người dùng
    let packPrice = 25000; // Giá mặc định nếu không tìm thấy
    
    // Lấy giá gói thuốc từ activePlan
    try {
      const activePlanData = localStorage.getItem('activePlan');
      if (activePlanData) {
        const activePlan = JSON.parse(activePlanData);
        if (activePlan && activePlan.packPrice) {
          packPrice = activePlan.packPrice;
          console.log(`[Dashboard] Lấy giá gói thuốc từ activePlan: ${packPrice.toLocaleString()}đ`);
        }
      }
    } catch (error) {
      console.error('[Dashboard] Lỗi khi đọc packPrice từ activePlan:', error);
    }
    
    const pricePerCigarette = packPrice / 20; // Giả sử 1 gói = 20 điếu
    const moneySaved = externalStats && externalStats.savedMoney ? 
                     externalStats.savedMoney : 
                     estimatedSaved * pricePerCigarette;
    
    console.log("🔍 Final calculation:", {
      packPrice: packPrice,
      pricePerCigarette: pricePerCigarette,
      moneySaved: moneySaved
    });
    
    const finalStats = {
      daysSincePlanCreation: daysSinceStart, 
      cigarettesSaved: estimatedSaved,
      moneySaved: moneySaved,
      planDuration: userPlan.weeks ? userPlan.weeks.length : 0,
      planName: userPlan.name || 'Kế hoạch cá nhân',
      healthProgress: 0 // Giá trị mặc định
    };
    
    console.log("🔍 Setting dashboard stats:", finalStats);
    setDashboardStats(finalStats);
  }, [userPlan, completionDate, externalStats, actualProgress]);
  
  const loadMilestones = useCallback(() => {
    // Nếu không có dữ liệu đầy đủ, không thực hiện
    if (!userPlan || !completionDate || !dashboardStats) {
      return;
    }
    
    
    // Milestone theo thời gian WHO
    const healthMilestones = [
      { days: 1, title: '24 giờ đầu tiên', description: 'Carbon monoxide được loại bỏ khỏi cơ thể', achieved: false },
      { days: 2, title: '48 giờ', description: 'Nicotine được loại bỏ, vị giác cải thiện', achieved: false },
      { days: 3, title: '72 giờ', description: 'Đường hô hấp thư giãn, năng lượng tăng', achieved: false },
      { days: 14, title: '2 tuần', description: 'Tuần hoàn máu cải thiện', achieved: false },
      { days: 30, title: '1 tháng', description: 'Chức năng phổi tăng 30%', achieved: false },
      { days: 90, title: '3 tháng', description: 'Ho và khó thở giảm đáng kể', achieved: false },
      { days: 365, title: '1 năm', description: 'Nguy cơ bệnh tim giảm 50%', achieved: false }
    ];

    const updatedMilestones = healthMilestones.map(milestone => ({
      ...milestone,
      achieved: (externalStats?.noSmokingDays || dashboardStats?.daysSincePlanCreation || 0) >= milestone.days
    }));
    setMilestones(updatedMilestones);
  }, [userPlan, completionDate, dashboardStats]);

  // Add useEffect hooks after function declarations
  useEffect(() => {
    if (userPlan && completionDate) {
      calculateDashboardStats();
    }
  }, [userPlan, completionDate, calculateDashboardStats, actualProgress]);
  
  // Tải milestone sau khi đã có thống kê
  useEffect(() => {
    if (dashboardStats) {
      loadMilestones();
    }
  }, [dashboardStats, loadMilestones]);  const getAchievementProgress = () => {
    // Nếu có giá trị từ bên ngoài, sử dụng nó
    if (dashboardStats && dashboardStats.healthProgress !== undefined) {
      return dashboardStats.healthProgress;
    }
    
    // Nếu không, tính toán từ milestone
    if (!milestones || milestones.length === 0) return 0;
    const achieved = milestones.filter(m => m.achieved).length;
    return (achieved / milestones.length) * 100;
  };

  // Add some debugging information
  useEffect(() => {
    console.log("Current dashboard stats:", dashboardStats);
    console.log("Current milestones:", milestones);
  }, [dashboardStats, milestones]);
  
  // Show loading state while dashboardStats is not set
  if (!dashboardStats) {
    console.log("🔍 Dashboard stats not set yet, showing loading screen");
    console.log("🔍 Current dashboardStats:", dashboardStats);
    return (
      <div className="dashboard-loading">
        <p>Đang tải dashboard...</p>
        <p>Debug: userPlan={userPlan ? 'Có' : 'Không'}, completionDate={completionDate ? 'Có' : 'Không'}</p>
      </div>
    );
  }

  const achievementProgress = getAchievementProgress();

  // Thêm reset toàn bộ dữ liệu
  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn reset dữ liệu check-in?')) {
      localStorage.removeItem('actualProgress');
      localStorage.removeItem('dashboardStats');
      if (onDataReset) {
        onDataReset();
      }
      alert('Dữ liệu đã được reset');
    }
  };

  return (
    <div className="progress-dashboard">      {/* Key Statistics */}
      <div className="dashboard-stats">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FaCalendarCheck />
          </div>          <div className="stat-content">
            <h3>{externalStats?.noSmokingDays || dashboardStats?.daysSincePlanCreation || 0}</h3>
            <p>Ngày theo dõi</p>
          </div>
        </div>        <div className="stat-card success">
          <div className="stat-icon">
            <FaLeaf />
          </div>          <div className="stat-content">
            <h3>{(externalStats?.savedCigarettes || dashboardStats?.cigarettesSaved || 0).toLocaleString()}</h3>
            <p>Điếu thuốc đã tránh</p>       
          </div>
        </div>

        <div className="stat-card money">
          <div className="stat-icon">
            <FaCoins />
          </div>
          <div className="stat-content">
            <h3>{((externalStats?.savedMoney || dashboardStats?.moneySaved || 0) / 1000).toFixed(0)}K</h3>
            <p>VNĐ đã tiết kiệm</p>
          </div>
        </div>

        <div className="stat-card health">
          <div className="stat-icon">
            <FaHeart />
          </div>
          <div className="stat-content">
            <h3>{achievementProgress.toFixed(0)}%</h3>
            <p>Milestone sức khỏe</p>
          </div>
        </div>
      </div>      {/* Progress Chart */}
      <div className="maintenance-section">
        <h2>
          <FaChartLine className="section-icon" />
          Kế hoạch của bạn
        </h2>        <div className="maintenance-chart">
          <QuitProgressChart
            userPlan={userPlan}
            actualProgress={actualProgress && actualProgress.length > 0 ? actualProgress : generateSampleActualData(userPlan)}
            timeFilter="Tất cả"
            height={250}
          />
        </div>
      </div>

      {/* Health Milestones */}
      <div className="milestones-section">
        <h2>Milestone sức khỏe</h2>
        <div className="milestones-grid">
          {milestones.map((milestone, index) => (
            <div 
              key={index} 
              className={`milestone-card ${milestone.achieved ? 'achieved' : 'pending'}`}
            >
              <div className="milestone-indicator">
                {milestone.achieved ? '✅' : '⏳'}
              </div>
              <div className="milestone-content">
                <h4>{milestone.title}</h4>
                <p>{milestone.description}</p>
                {!milestone.achieved && dashboardStats && (
                  <span className="days-remaining">
                    Còn {Math.max(0, milestone.days - (externalStats?.noSmokingDays || dashboardStats?.daysSincePlanCreation || 0))} ngày
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>      {/* Tips section */}
      <div className="maintenance-tips-section">
        <h2>Lời khuyên duy trì</h2>
        
        <div className="maintenance-tips">
          <h3>💡 Mẹo hữu ích</h3>
          <ul>
            <li>Tiếp tục tránh xa môi trường có khói thuốc</li>
            <li>Duy trì các hoạt động thể chất thường xuyên</li>
            <li>Ăn uống lành mạnh để tránh tăng cân</li>
            <li>Tìm kiếm hỗ trợ từ gia đình và bạn bè</li>
            <li>Nhắc nhở bản thân về lợi ích đã đạt được</li>
          </ul>
        </div><div className="support-options">
          <h3>🤝 Hỗ trợ thêm</h3>
          <div className="support-buttons">
            <Link to="/blog" className="support-btn primary">
              Tham gia cộng đồng
            </Link>
            <Link to="/appointment" className="support-btn tertiary">
              Tư vấn chuyên gia
            </Link>
          </div>
        </div>
      </div>      {/* Success Story */}
      <div className="success-story">
        <h2>🎉 Câu chuyện thành công của bạn</h2>
        <div className="story-content">
          <p>
            Bạn đã lập thành công <strong>{userPlan?.name || 'Kế hoạch cá nhân'}</strong> và duy trì được{' '}
            <strong>{externalStats?.noSmokingDays || dashboardStats?.daysSincePlanCreation || 0} ngày</strong> không hút thuốc.
          </p>
          <p>
            Trong thời gian này, bạn đã tiết kiệm được{' '}
            <strong>{(((externalStats?.savedMoney || dashboardStats?.moneySaved || 0) / 1000).toFixed(0))}K VNĐ</strong> và tránh được{' '}
            <strong>{(externalStats?.savedCigarettes || dashboardStats?.cigarettesSaved || 0).toLocaleString()}</strong> điếu thuốc.
          </p>
          <p>
            Đây là một thành tích đáng tự hào! Hãy tiếp tục duy trì và truyền cảm hứng cho những người khác.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
