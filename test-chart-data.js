// Test script để kiểm tra dữ liệu biểu đồ
console.log("=== KIỂM TRA DỮ LIỆU BIỂU ĐỒ ===");

// Kiểm tra localStorage
console.log("1. Kiểm tra localStorage:");
const activePlan = localStorage.getItem('activePlan');
console.log("activePlan:", activePlan ? JSON.parse(activePlan) : 'Không có');

const dashboardStats = localStorage.getItem('dashboardStats');
console.log("dashboardStats:", dashboardStats ? JSON.parse(dashboardStats) : 'Không có');

// Kiểm tra dữ liệu check-in
console.log("\n2. Kiểm tra dữ liệu check-in:");
const today = new Date();
for (let i = 0; i < 7; i++) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];
  const checkinData = localStorage.getItem(`checkin_${dateStr}`);
  
  if (checkinData) {
    const data = JSON.parse(checkinData);
    console.log(`${dateStr}: ${data.actualCigarettes}/${data.targetCigarettes} điếu`);
  } else {
    console.log(`${dateStr}: Không có dữ liệu`);
  }
}

// Kiểm tra chart components
console.log("\n3. Kiểm tra chart components:");
const chartWrapper = document.querySelector('.quit-progress-chart');
if (chartWrapper) {
  console.log("✅ Chart wrapper tồn tại");
  const canvas = chartWrapper.querySelector('canvas');
  if (canvas) {
    console.log("✅ Canvas tồn tại");
  } else {
    console.log("❌ Canvas không tồn tại");
  }
} else {
  console.log("❌ Chart wrapper không tồn tại");
}

// Kiểm tra Chart.js
console.log("\n4. Kiểm tra Chart.js:");
if (typeof Chart !== 'undefined') {
  console.log("✅ Chart.js đã được load");
  console.log("Chart version:", Chart.version);
} else {
  console.log("❌ Chart.js chưa được load");
}

console.log("\n=== KẾT THÚC KIỂM TRA ===");
