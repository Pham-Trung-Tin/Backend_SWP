import React from 'react';

const ResetCheckinData = ({ onDataReset }) => {  const handleReset = () => {
    // Xóa tất cả dữ liệu check-in từ localStorage
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('checkin_')) {
        keys.push(key);
      }
    }
    
    console.log("Đang xóa tất cả dữ liệu check-in:", keys);
    keys.forEach(key => localStorage.removeItem(key));
    
    // Reset dashboard statistics và xóa toàn bộ dữ liệu thống kê cũ
    localStorage.removeItem('dashboardStats');
    console.log("Đã xóa tất cả thống kê cũ");
    
    // Tạo thống kê mới với số điếu đã tránh = 0
    const defaultStats = {
      noSmokingDays: 0,
      savedCigarettes: 0, // Đặt số điếu đã tránh về 0
      savedMoney: 0,
      healthProgress: 0,
      calculationDetails: {
        initialCigarettesPerDay: 0,
        dailySavings: [],
        lastCalculated: new Date().toISOString(),
        resetNote: "Dữ liệu đã được reset hoàn toàn"
      }
    };
    localStorage.setItem('dashboardStats', JSON.stringify(defaultStats));
    
    // Tạo dữ liệu mẫu cho 7 ngày gần nhất
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Lấy kế hoạch hiện tại từ localStorage
      const activePlanStr = localStorage.getItem('activePlan');
      let targetCigs = 20; // Mặc định
      
      if (activePlanStr) {
        try {
          const activePlan = JSON.parse(activePlanStr);
          if (activePlan && activePlan.weeks && activePlan.weeks.length > 0) {
            const daysDiff = Math.floor((date - new Date(activePlan.startDate)) / (1000 * 60 * 60 * 24));
            const weekNum = Math.max(1, Math.floor(daysDiff / 7) + 1);
            const weekData = activePlan.weeks.find(w => w.week === weekNum);
            if (weekData) {
              targetCigs = weekData.amount;
            }
          }
        } catch (error) {
          console.error('Error parsing active plan:', error);
        }
      }
      
      // Tạo dữ liệu ngẫu nhiên xung quanh mục tiêu
      const randomOffset = Math.floor(Math.random() * 5) - 2; // -2 to +2
      const actualCigs = Math.max(0, targetCigs + randomOffset);
      
      const checkinData = {
        date: dateStr,
        targetCigarettes: targetCigs,
        actualCigarettes: actualCigs,
        notes: 'Dữ liệu mẫu tự động tạo'
      };
      
      localStorage.setItem(`checkin_${dateStr}`, JSON.stringify(checkinData));
    }
    
    if (typeof onDataReset === 'function') {
      onDataReset();
    }
    
    alert('Đã tạo lại dữ liệu check-in cho 7 ngày gần nhất. Dữ liệu sẽ được cập nhật ngay lập tức.');
  };
  
  return (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <button 
        onClick={handleReset}
        style={{
          backgroundColor: '#ea4335',
          color: 'white',
          border: 'none',
          padding: '8px 15px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Tạo lại dữ liệu check-in mẫu
      </button>
      <p style={{ fontSize: '12px', color: '#5f6368', marginTop: '5px' }}>
        (Chỉ dùng để test, sẽ xóa dữ liệu check-in hiện tại)
      </p>
    </div>
  );
};

export default ResetCheckinData;
