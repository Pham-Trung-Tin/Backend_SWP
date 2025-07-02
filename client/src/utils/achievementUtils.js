/**
 * Utility functions để tính toán huy hiệu một cách nhất quán
 */

/**
 * Tính toán số ngày đã cai thuốc
 * @param {Object} activePlan - Kế hoạch cai thuốc hiện tại
 * @param {Object} user - Thông tin user
 * @returns {number} Số ngày đã cai thuốc
 */
export const calculateDaysWithoutSmoking = (activePlan, user) => {
  // Ưu tiên sử dụng activePlan.startDate
  if (activePlan?.startDate) {
    try {
      const startDate = new Date(activePlan.startDate);
      
      // Kiểm tra ngày có hợp lệ không
      if (isNaN(startDate.getTime())) {
        console.warn("Ngày bắt đầu từ activePlan không hợp lệ:", activePlan.startDate);
      } else {
        const now = new Date();
        const days = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        console.log('📅 ACHIEVEMENT: Tính từ activePlan.startDate =', startDate.toLocaleDateString('vi-VN'), '→', days, 'ngày');
        return days > 0 ? days : 0;
      }
    } catch (error) {
      console.error("Lỗi khi xử lý activePlan.startDate:", error);
    }
  }
  
  // Fallback: sử dụng user.startDate nếu có
  if (user?.startDate) {
    try {
      const startDate = new Date(user.startDate);
      
      if (isNaN(startDate.getTime())) {
        console.warn("Ngày bắt đầu từ user không hợp lệ:", user.startDate);
      } else {
        const now = new Date();
        const days = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        console.log('📅 ACHIEVEMENT: Tính từ user.startDate =', startDate.toLocaleDateString('vi-VN'), '→', days, 'ngày');
        return days > 0 ? days : 0;
      }
    } catch (error) {
      console.error("Lỗi khi xử lý user.startDate:", error);
    }
  }
  
  console.log('📅 ACHIEVEMENT: Không có ngày bắt đầu hợp lệ → 0 ngày');
  return 0;
};

/**
 * Tạo danh sách huy hiệu dựa trên số ngày đã cai thuốc
 * @param {number} daysWithoutSmoking - Số ngày đã cai thuốc
 * @returns {Array} Danh sách huy hiệu
 */
export const generateAchievements = (daysWithoutSmoking) => {
  return [
    {
      id: 1,
      name: "24 giờ đầu tiên",
      date: daysWithoutSmoking >= 1 ? "Đã hoàn thành" : "",
      icon: "⭐",
      description: "Hoàn thành 24 giờ đầu tiên không hút thuốc",
      completed: daysWithoutSmoking >= 1
    },
    {
      id: 2,
      name: "1 tuần không hút",
      date: daysWithoutSmoking >= 7 ? "Đã hoàn thành" : "",
      icon: "🏅",
      description: "Hoàn thành 1 tuần không hút thuốc",
      completed: daysWithoutSmoking >= 7
    },
    {
      id: 3,
      name: "2 tuần không hút",
      date: daysWithoutSmoking >= 14 ? "Đã hoàn thành" : "",
      icon: "🏆",
      description: "Hoàn thành 2 tuần không hút thuốc",
      completed: daysWithoutSmoking >= 14
    },
    {
      id: 4,
      name: "1 tháng không hút",
      date: daysWithoutSmoking >= 30 ? "Đã hoàn thành" : "",
      icon: "👑",
      description: "Hoàn thành 1 tháng không hút thuốc",
      completed: daysWithoutSmoking >= 30
    },
  ];
};

/**
 * Lấy danh sách huy hiệu đã đạt được
 * @param {number} daysWithoutSmoking - Số ngày đã cai thuốc
 * @returns {Array} Danh sách huy hiệu đã đạt được
 */
export const getCompletedAchievements = (daysWithoutSmoking) => {
  const allAchievements = generateAchievements(daysWithoutSmoking);
  return allAchievements.filter(achievement => achievement.completed);
};

/**
 * Đếm số huy hiệu đã đạt được
 * @param {number} daysWithoutSmoking - Số ngày đã cai thuốc
 * @returns {number} Số huy hiệu đã đạt được
 */
export const getCompletedAchievementsCount = (daysWithoutSmoking) => {
  return getCompletedAchievements(daysWithoutSmoking).length;
};

/**
 * Lấy huy hiệu tiếp theo cần đạt
 * @param {number} daysWithoutSmoking - Số ngày đã cai thuốc
 * @returns {Object|null} Huy hiệu tiếp theo hoặc null nếu đã đạt hết
 */
export const getNextAchievement = (daysWithoutSmoking) => {
  const allAchievements = generateAchievements(daysWithoutSmoking);
  return allAchievements.find(achievement => !achievement.completed) || null;
};
